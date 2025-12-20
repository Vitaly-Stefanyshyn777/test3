import { TrainerUser } from "./types";
import api from "@/lib/api";
import { normalizeImageUrl } from "@/lib/imageUtils";

export function buildAuthHeaders(): Headers {
  const rawEnv = process.env.NEXT_PUBLIC_BFB_TOKEN ?? "";
  const tokenClean = rawEnv
    .trim()
    .replace(/(^['"]|['"]$)/g, "")
    .replace(/[^\x00-\x7F]/g, "");
  const headers = new Headers();
  if (tokenClean && /^[A-Za-z0-9._\-]+$/.test(tokenClean)) {
    headers.set("Authorization", `Bearer ${tokenClean}`);
  }
  return headers;
}

export async function fetchTrainer(id: string): Promise<TrainerUser> {
  try {
    const response = await api.get("/api/proxy", {
      params: {
        path: `/wp-json/wp/v2/users/${id}?context=edit`,
      },
      headers: { "x-internal-admin": "1" },
    });

    const rawData = response.data;

    const rawAvatar: string | undefined =
      (typeof (rawData as { img_link_data_avatar?: string })
        .img_link_data_avatar === "string" &&
      (
        rawData as { img_link_data_avatar?: string }
      ).img_link_data_avatar!.trim()
        ? (
            rawData as { img_link_data_avatar?: string }
          ).img_link_data_avatar!.trim()
        : undefined) ||
      (typeof rawData.avatar === "string" && rawData.avatar.trim()
        ? rawData.avatar.trim()
        : undefined) ||
      (typeof rawData?.meta?.img_link_data_avatar === "string" &&
      rawData.meta.img_link_data_avatar.trim()
        ? rawData.meta.img_link_data_avatar.trim()
        : undefined) ||
      (typeof rawData.avatar_urls?.["96"] === "string"
        ? rawData.avatar_urls["96"]
        : undefined) ||
      (typeof rawData.avatar_urls?.medium === "string"
        ? rawData.avatar_urls.medium
        : undefined) ||
      (typeof rawData.avatar_urls?.thumbnail === "string"
        ? rawData.avatar_urls.thumbnail
        : undefined);

    const primaryAvatar: string | undefined = rawAvatar
      ? (() => {
          const normalized = normalizeImageUrl(rawAvatar);
          return normalized !== "/placeholder.svg" ? normalized : undefined;
        })()
      : undefined;

    const rawGallery: unknown =
      rawData.gallery ||
      rawData.meta?.gallery ||
      rawData.meta?.img_link_data_gallery_ ||
      rawData.acf?.gallery ||
      rawData.acf?.img_link_data_gallery_;

    let normalizedGallery: TrainerUser["gallery"] = undefined;
    if (rawGallery) {
      const isEditPageUrl = (url: string) =>
        typeof url === "string" &&
        (url.includes("/wp-admin/user-edit.php") ||
          url.includes("/wp-admin/users.php"));

      if (typeof rawGallery === "string") {
        if (!isEditPageUrl(rawGallery)) {
          const normalized = normalizeImageUrl(rawGallery);
          normalizedGallery =
            normalized !== "/placeholder.svg" ? normalized : undefined;
        }
      } else if (Array.isArray(rawGallery)) {
        normalizedGallery = rawGallery
          .map((item) => {
            if (typeof item === "string") {
              if (isEditPageUrl(item)) {
                return null;
              }
              const normalized = normalizeImageUrl(item);
              return normalized !== "/placeholder.svg" ? normalized : null;
            }
            if (typeof item === "object" && item !== null && "url" in item) {
              const url = (item as { url: string }).url;
              if (isEditPageUrl(url)) {
                return null;
              }
              const normalized = normalizeImageUrl(url);
              return normalized !== "/placeholder.svg" ? normalized : null;
            }
            return null;
          })
          .filter((item): item is string => item !== null);
      }
    }

    const fullName = `${rawData.first_name ?? ""} ${
      rawData.last_name ?? ""
    }`.trim();

    const favouriteExerciseArray = rawData.acf?.favourite_exercise as
      | Array<{ exercise?: string }>
      | undefined;
    const favouriteExercise = favouriteExerciseArray
      ? favouriteExerciseArray
          .map((item) => item.exercise || "")
          .filter(Boolean)
      : Array.isArray(rawData.favourite_exercise)
      ? rawData.favourite_exercise
      : [];

    const specialityArray = rawData.acf?.speciality as
      | Array<{ point?: string }>
      | undefined;
    const specialityFromAcf = specialityArray
      ? specialityArray.map((item) => item.point || "").filter(Boolean)
      : [];

    const rawMySpecialty =
      specialityFromAcf.length > 0
        ? specialityFromAcf
        : rawData.my_specialty ||
          rawData.acf?.my_specialty ||
          rawData.meta?.my_specialty ||
          rawData.point_data_my_specialty ||
          rawData.meta?.point_data_my_specialty ||
          [];

    const normalizedMySpecialty = Array.isArray(rawMySpecialty)
      ? rawMySpecialty
      : typeof rawMySpecialty === "string" && rawMySpecialty.trim()
      ? [rawMySpecialty]
      : [];

    const trainer: TrainerUser = {
      id: rawData.id,
      name: fullName || rawData.name || "Тренер",
      position: (() => {
        if (rawData.position && String(rawData.position).trim()) {
          return String(rawData.position).trim();
        }
        if (
          rawData.meta?.input_text_position &&
          String(rawData.meta.input_text_position).trim()
        ) {
          return String(rawData.meta.input_text_position).trim();
        }
        if (rawData.acf?.position && String(rawData.acf.position).trim()) {
          return String(rawData.acf.position).trim();
        }
        if (
          rawData.acf?.input_text_position &&
          String(rawData.acf.input_text_position).trim()
        ) {
          return String(rawData.acf.input_text_position).trim();
        }
        return undefined;
      })(),
      super_power: rawData.acf?.super_power || rawData.super_power || "",
      favourite_exercise:
        favouriteExercise.length > 0
          ? favouriteExercise
          : rawData.favourite_exercise || "Не вказано",
      experience:
        rawData.acf?.expierence ||
        rawData.experience ||
        rawData.meta?.input_text_experience ||
        rawData.acf?.input_text_experience ||
        "Не вказано",
      avatar: primaryAvatar,
      locations: rawData.locations || [],
      my_specialty: normalizedMySpecialty,
      my_experience: (() => {
        if (
          rawData.acf?.work_experience &&
          Array.isArray(rawData.acf.work_experience) &&
          rawData.acf.work_experience.length > 0
        ) {
          return rawData.acf.work_experience.map(
            (exp: {
              name?: string;
              date_start?: string;
              date_ended?: string;
              description?: string;
            }) => ({
              hl_input_text_gym: exp.name || "",
              hl_input_date_date_start: exp.date_start || "",
              hl_input_date_date_end: exp.date_ended || "",
              hl_textarea_ex_description: exp.description || "",
            })
          );
        }
        if (
          rawData.acf?.my_experience &&
          Array.isArray(rawData.acf.my_experience) &&
          rawData.acf.my_experience.length > 0
        ) {
          return rawData.acf.my_experience;
        }
        if (
          rawData.my_experience &&
          Array.isArray(rawData.my_experience) &&
          rawData.my_experience.length > 0
        ) {
          return rawData.my_experience;
        }
        if (
          rawData.meta?.my_experience &&
          Array.isArray(rawData.meta.my_experience) &&
          rawData.meta.my_experience.length > 0
        ) {
          return rawData.meta.my_experience;
        }
        if (
          rawData.meta?.hl_data_my_experience &&
          Array.isArray(rawData.meta.hl_data_my_experience) &&
          rawData.meta.hl_data_my_experience.length > 0
        ) {
          return rawData.meta.hl_data_my_experience;
        }
        return [];
      })(),
      my_wlocation: (() => {
        if (
          rawData.meta?.hl_data_my_wlocation &&
          Array.isArray(rawData.meta.hl_data_my_wlocation) &&
          rawData.meta.hl_data_my_wlocation.length > 0
        ) {
          return rawData.meta.hl_data_my_wlocation;
        }
        if (
          rawData.acf?.hl_data_my_wlocation &&
          Array.isArray(rawData.acf.hl_data_my_wlocation) &&
          rawData.acf.hl_data_my_wlocation.length > 0
        ) {
          return rawData.acf.hl_data_my_wlocation;
        }
        if (
          rawData.my_wlocation &&
          Array.isArray(rawData.my_wlocation) &&
          rawData.my_wlocation.length > 0
        ) {
          return rawData.my_wlocation;
        }
        if (
          rawData.acf?.my_wlocation &&
          Array.isArray(rawData.acf.my_wlocation) &&
          rawData.acf.my_wlocation.length > 0
        ) {
          return rawData.acf.my_wlocation;
        }
        if (
          rawData.meta?.my_wlocation &&
          Array.isArray(rawData.meta.my_wlocation) &&
          rawData.meta.my_wlocation.length > 0
        ) {
          return rawData.meta.my_wlocation;
        }
        return [];
      })(),
      gallery: normalizedGallery,
      certificate:
        rawData.certificate ||
        rawData.meta?.certificate ||
        rawData.meta?.img_link_data_certificate ||
        rawData.acf?.certificate ||
        rawData.acf?.img_link_data_certificate,
      input_text_phone:
        rawData.input_text_phone || rawData.meta?.input_text_phone,
      input_text_email:
        rawData.input_text_email || rawData.meta?.input_text_email,
      input_text_address:
        rawData.input_text_address || rawData.meta?.input_text_address,
      input_text_schedule:
        rawData.input_text_schedule || rawData.meta?.input_text_schedule,
      hl_data_gallery:
        rawData.hl_data_gallery || rawData.meta?.hl_data_gallery,
      hl_data_contact: rawData.hl_data_contact || rawData.meta?.hl_data_contact,
      social_phone:
        (rawData.acf?.phone as string) ||
        rawData.social_phone ||
        rawData.meta?.social_phone ||
        rawData.meta?.input_text_social_phone ||
        "",
      social_telegram:
        (rawData.acf?.telegram as string) ||
        rawData.social_telegram ||
        rawData.meta?.social_telegram ||
        rawData.meta?.input_text_social_telegram ||
        "",
      social_instagram:
        (rawData.acf?.instagram as string) ||
        rawData.social_instagram ||
        rawData.meta?.social_instagram ||
        rawData.meta?.input_text_social_instagram ||
        "",
      social_facebook:
        rawData.social_facebook ||
        rawData.meta?.social_facebook ||
        rawData.meta?.input_text_social_facebook,
      location_city:
        rawData.acf?.city ||
        rawData.location_city ||
        rawData.meta?.input_text_locations_city ||
        rawData.acf?.location_city ||
        rawData.meta?.location_city,
      location_country:
        rawData.location_country ||
        rawData.acf?.location_country ||
        rawData.meta?.location_country,
    };

    return trainer;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      try {
        const { getAllCoaches } = await import("@/lib/coaches");
        const allCoaches = await getAllCoaches();
        const coach = allCoaches.find((c) => String(c.id) === id);
        if (coach) {
          const fullName = `${coach.first_name ?? ""} ${
            coach.last_name ?? ""
          }`.trim();
          const trainer: TrainerUser = {
            id: coach.id,
            name: fullName || coach.name || "Тренер",
            super_power: coach.super_power || "Не вказано",
            favourite_exercise: Array.isArray(coach.favourite_exercise)
              ? coach.favourite_exercise.join(", ")
              : coach.favourite_exercise || "Не вказано",
            experience: coach.experience || "Не вказано",
            avatar: Array.isArray(coach.avatar)
              ? coach.avatar[0]
              : coach.avatar,
            locations: [],
            my_experience: coach.my_experience || [],
            my_wlocation: coach.my_wlocation || [],
            gallery: Array.isArray(coach.gallery)
              ? coach.gallery
              : coach.gallery,
            certificate: coach.certificate,
            input_text_phone: "",
            input_text_email: "",
            input_text_address: "",
            input_text_schedule: "",
            hl_data_gallery: [],
            hl_data_contact: [],
            social_phone: "",
            location_city: Array.isArray(coach.location_city)
              ? coach.location_city.join(", ")
              : coach.location_city,
            location_country: Array.isArray(coach.location_country)
              ? coach.location_country.join(", ")
              : coach.location_country,
          };

          return trainer;
        }
      } catch {}
    }

    throw error;
  }
}

export function getAvatarUrl(
  avatarField: TrainerUser["avatar"]
): string | undefined {
  if (typeof avatarField === "string") {
    const normalized = normalizeImageUrl(avatarField);
    return normalized !== "/placeholder.svg" ? normalized : undefined;
  }
  if (avatarField && typeof avatarField === "object" && "url" in avatarField) {
    const url = (avatarField as { url: string }).url;
    const normalized = normalizeImageUrl(url);
    return normalized !== "/placeholder.svg" ? normalized : undefined;
  }
  return undefined;
}

export function getSpecialties(trainer: TrainerUser): string[] {
  if (!trainer.my_specialty || !Array.isArray(trainer.my_specialty)) {
    return ["Не вказано"];
  }
  return trainer.my_specialty
    .filter((spec: unknown): spec is string => typeof spec === "string")
    .slice(0, 3);
}

export function getFavouriteExercises(user: TrainerUser): string[] {
  const raw = user?.favourite_exercise;
  if (Array.isArray(raw))
    return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string" && raw.trim()) return [raw];
  return [];
}

export function getGalleryImages(
  galleryField: TrainerUser["gallery"]
): string[] {
  if (typeof galleryField === "string") {
    const normalized = normalizeImageUrl(galleryField);
    return normalized !== "/placeholder.svg" ? [normalized] : [];
  }
  if (Array.isArray(galleryField)) {
    const result = galleryField
      .map((item) => {
        if (typeof item === "string") {
          return normalizeImageUrl(item);
        }
        if (typeof item === "object" && item !== null && "url" in item) {
          return normalizeImageUrl((item as { url: string }).url);
        }
        return null;
      })
      .filter(
        (url): url is string => url !== null && url !== "/placeholder.svg"
      );
    return result;
  }
  return [];
}

export function getHlDataGallery(hlDataGallery: unknown): string[] {
  if (!hlDataGallery || !Array.isArray(hlDataGallery)) return [];
  return hlDataGallery
    .filter(
      (item): item is { hl_img_link_photo: string[] } =>
        item &&
        typeof item === "object" &&
        "hl_img_link_photo" in item &&
        Array.isArray(item.hl_img_link_photo)
    )
    .flatMap((item) => item.hl_img_link_photo)
    .filter((url): url is string => typeof url === "string");
}
