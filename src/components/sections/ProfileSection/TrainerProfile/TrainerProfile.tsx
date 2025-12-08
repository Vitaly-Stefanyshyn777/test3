"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./TrainerProfile.module.css";
import PersonalDataSection from "./PersonalDataSection";
import SuperpowerSection from "./SuperpowerSection";
import TagsSection from "./TagsSection";
import type {
  TrainerProfileForm,
  TrainingLocation,
  WorkExperienceEntry,
} from "./types";
import { useUpdateTrainerProfile } from "@/lib/useMutation";
import { useAuthStore } from "@/store/auth";
import { useUserProfileQuery } from "@/components/hooks/useUserProfileQuery";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import WorkExperienceSection from "./WorkExperienceSection";
import TrainingLocationsSection from "./TrainingLocationsSection";
import TrainingLocationModal from "./TrainingLocationModal";
import CertificatesSection from "./CertificatesSection";
import PersonalGallerySection from "./PersonalGallerySection";
import { uploadCoachMedia } from "@/lib/bfbApi";

const emptyExperience: WorkExperienceEntry = {
  gym: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  description: "",
};

const formatWorkExperienceDate = (year: string, month: string) => {
  if (!year || !month) return "";
  const monthPadded = month.padStart(2, "0");
  return `${monthPadded}/01/${year}`;
};

const parseExperienceDate = (value?: string | null) => {
  if (!value) {
    return { month: "", year: "" };
  }
  const [year, month] = value.split("-");
  return {
    month: (month ?? "").slice(0, 2),
    year: year ?? "",
  };
};

const TrainerProfile: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const [formData, setFormData] = useState<TrainerProfileForm>({
    position: "",
    experience: "",
    location: "",
    desiredBoards: "",
    superpower: "",
    favoriteExercises: [],
    specializations: [],
    trainingLocations: [],
  });

  const [newFavoriteExercise, setNewFavoriteExercise] = useState("");
  const [newSpecialization, setNewSpecialization] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { mutateAsync: updateProfile, isPending } = useUpdateTrainerProfile();
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [personalGalleryFiles, setPersonalGalleryFiles] = useState<File[]>([]);
  const [getGalleryUrlsFn, setGetGalleryUrlsFn] = useState<
    (() => string[]) | null
  >(null);
  const [getGalleryFilesFn, setGetGalleryFilesFn] = useState<
    (() => File[]) | null
  >(null);
  const [getCertificatesUrlsFn, setGetCertificatesUrlsFn] = useState<
    (() => string[]) | null
  >(null);
  const [getCertificatesFilesFn, setGetCertificatesFilesFn] = useState<
    (() => File[]) | null
  >(null);
  const authUserId = useAuthStore((s) => s.user?.id);

  const [workExperienceDraft, setWorkExperienceDraft] =
    useState<WorkExperienceEntry>(emptyExperience);
  const [currentMeta, setCurrentMeta] = useState<Record<string, unknown>>({});
  const [certificateUrls, setCertificateUrls] = useState<string[]>([]);
  const [personalGalleryUrls, setPersonalGalleryUrls] = useState<string[]>([]);
  const [personalErrors, setPersonalErrors] = useState<{
    position?: string;
    experience?: string;
    location?: string;
    desiredBoards?: string;
  }>({});

  const [forceUpdate, setForceUpdate] = useState(0);
  const { data: baseProfile } = useUserProfileQuery();
  const queryClient = useQueryClient();
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["trainer-profile-full", baseProfile?.id, token],
    queryFn: async () => {
      if (!baseProfile?.id) return null;
      const id = String(baseProfile.id);
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await api.get("/api/proxy", {
        params: {
          path: `/wp-json/wp/v2/users/${id}?context=edit`,
        },
        headers,
      });
      return response.data;
    },
    enabled: !!baseProfile?.id && !!token,
    staleTime: 60_000,
  });

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn && !token) {
      setFormData({
        position: "",
        experience: "",
        location: "",
        desiredBoards: "",
        superpower: "",
        favoriteExercises: [],
        specializations: [],
        trainingLocations: [],
      });
      setWorkExperienceDraft(emptyExperience);
      setCertificateUrls([]);
      setCurrentMeta({});
      return;
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!profile) return;

    try {
      const rawData = profile as Record<string, unknown>;
      const meta = rawData.meta as Record<string, unknown> | undefined;
      const acf = rawData.acf as Record<string, unknown> | undefined;

      const acfData = acf ? { ...acf } : {};
      if (meta?.my_wlocation && !acfData.my_wlocation) {
        acfData.my_wlocation = meta.my_wlocation;
      }
      if (meta?.hl_data_my_wlocation && !acfData.hl_data_my_wlocation) {
        acfData.hl_data_my_wlocation = meta.hl_data_my_wlocation;
      }
      if (
        rawData.my_wlocation &&
        Array.isArray(rawData.my_wlocation) &&
        rawData.my_wlocation.length > 0 &&
        !acfData.my_wlocation
      ) {
        acfData.my_wlocation = rawData.my_wlocation;
      }
      if (Object.keys(acfData).length > 0) {
        setCurrentMeta(acfData as Record<string, unknown>);
      }

      let restoredLocations: TrainingLocation[] = [];
      let rawWlocation: unknown = undefined;
      if (
        rawData.my_wlocation &&
        Array.isArray(rawData.my_wlocation) &&
        rawData.my_wlocation.length > 0
      ) {
        rawWlocation = rawData.my_wlocation;
      } else if (
        acf?.my_wlocation &&
        Array.isArray(acf.my_wlocation) &&
        acf.my_wlocation.length > 0
      ) {
        rawWlocation = acf.my_wlocation;
      } else if (
        acf?.hl_data_my_wlocation &&
        Array.isArray(acf.hl_data_my_wlocation) &&
        acf.hl_data_my_wlocation.length > 0
      ) {
        rawWlocation = acf.hl_data_my_wlocation;
      } else if (
        meta?.my_wlocation &&
        Array.isArray(meta.my_wlocation) &&
        meta.my_wlocation.length > 0
      ) {
        rawWlocation = meta.my_wlocation;
      } else if (
        meta?.hl_data_my_wlocation &&
        Array.isArray(meta.hl_data_my_wlocation) &&
        meta.hl_data_my_wlocation.length > 0
      ) {
        rawWlocation = meta.hl_data_my_wlocation;
      }

      if (Array.isArray(rawWlocation) && rawWlocation.length > 0) {
        restoredLocations = (
          rawWlocation as Array<Record<string, unknown>>
        ).map((item) => {
          let coordinates = "";
          const lat = item.hl_input_text_coord_lat as string | undefined;
          const lng = item.hl_input_text_coord_ln as string | undefined;
          if (lat && lng) {
            coordinates = `${lat}, ${lng}`;
          }
          return {
            title: (item.hl_input_text_title as string) || "",
            email: (item.hl_input_text_email as string) || "",
            phone: (item.hl_input_text_phone as string) || "",
            telegram: (item.hl_input_text_telegram as string) || "",
            instagram: (item.hl_input_text_instagram as string) || "",
            facebook: (item.hl_input_text_facebook as string) || "",
            schedule_five: (item.hl_input_text_schedule_five as string) || "",
            schedule_two: (item.hl_input_text_schedule_two as string) || "",
            address: (item.hl_input_text_address as string) || "",
            coordinates: coordinates,
            photos: Array.isArray(item.hl_img_link_photo)
              ? (item.hl_img_link_photo as string[])
              : [],
          };
        });
      }

      const favouriteExerciseArray = acf?.favourite_exercise as
        | Array<{ exercise?: string }>
        | undefined;
      const favoriteExercises = favouriteExerciseArray
        ? favouriteExerciseArray
            .map((item) => item.exercise || "")
            .filter(Boolean)
        : Array.isArray(rawData.favourite_exercise)
        ? (rawData.favourite_exercise as string[])
        : [];

      const specialityArray = acf?.speciality as
        | Array<{ point?: string }>
        | undefined;
      const specializations = specialityArray
        ? specialityArray.map((item) => item.point || "").filter(Boolean)
        : Array.isArray(rawData.my_specialty)
        ? (rawData.my_specialty as string[])
        : [];

      const newFormData = {
        position: (() => {
          if (rawData.position && String(rawData.position).trim()) {
            return String(rawData.position).trim();
          }
          if (
            meta?.input_text_position &&
            String(meta.input_text_position).trim()
          ) {
            return String(meta.input_text_position).trim();
          }
          if (acf?.position && String(acf.position).trim()) {
            return String(acf.position).trim();
          }
          if (
            acf?.input_text_position &&
            String(acf.input_text_position).trim()
          ) {
            return String(acf.input_text_position).trim();
          }
          return "";
        })(),
        experience: (acf?.expierence || rawData.experience || "") as string,
        location: (() => {
          const locationValue = (acf?.city ||
            rawData.location_city ||
            "") as string;
          return locationValue.trim() === "" ? "" : locationValue;
        })(),
        desiredBoards: (acf?.boards || rawData.boards || "") as string,
        superpower: (() => {
          const superPowerValue = (acf?.super_power ||
            rawData.super_power ||
            "") as string;
          return superPowerValue.trim() === "" ? "" : superPowerValue;
        })(),
        favoriteExercises: favoriteExercises,
        specializations: specializations,
        trainingLocations: restoredLocations,
      };

      const hasChanged =
        formData.position !== newFormData.position ||
        formData.experience !== newFormData.experience ||
        formData.location !== newFormData.location ||
        formData.desiredBoards !== newFormData.desiredBoards ||
        formData.superpower !== newFormData.superpower ||
        JSON.stringify(formData.favoriteExercises) !==
          JSON.stringify(newFormData.favoriteExercises) ||
        JSON.stringify(formData.specializations) !==
          JSON.stringify(newFormData.specializations) ||
        JSON.stringify(formData.trainingLocations) !==
          JSON.stringify(newFormData.trainingLocations);

      if (!hasChanged && forceUpdate === 0) {
        return;
      }

      if (forceUpdate > 0) {
        setForceUpdate(0);
      }

      setFormData(newFormData);

      let rawExperience: unknown = undefined;
      if (
        acf?.work_experience &&
        Array.isArray(acf.work_experience) &&
        acf.work_experience.length > 0
      ) {
        rawExperience = acf.work_experience;
      } else if (
        acf?.my_experience &&
        Array.isArray(acf.my_experience) &&
        acf.my_experience.length > 0
      ) {
        rawExperience = acf.my_experience;
      } else if (
        rawData.my_experience &&
        Array.isArray(rawData.my_experience) &&
        rawData.my_experience.length > 0
      ) {
        rawExperience = rawData.my_experience;
      } else if (
        meta?.my_experience &&
        Array.isArray(meta.my_experience) &&
        meta.my_experience.length > 0
      ) {
        rawExperience = meta.my_experience;
      } else if (
        meta?.hl_data_my_experience &&
        Array.isArray(meta.hl_data_my_experience) &&
        meta.hl_data_my_experience.length > 0
      ) {
        rawExperience = meta.hl_data_my_experience;
      }

      if (Array.isArray(rawExperience) && rawExperience.length) {
        const first = rawExperience[0] as Record<string, unknown>;
        const isNewStructure =
          first.name !== undefined || first.date_start !== undefined;

        let experienceData: WorkExperienceEntry;

        if (isNewStructure) {
          const parseNewDate = (dateStr: string | undefined) => {
            if (!dateStr) return { month: "", year: "" };
            const parts = (dateStr as string).split("/");
            if (parts.length === 3) {
              return { month: parts[0].padStart(2, "0"), year: parts[2] };
            }
            return { month: "", year: "" };
          };

          const start = parseNewDate(first.date_start as string | undefined);
          const end = parseNewDate(first.date_ended as string | undefined);

          experienceData = {
            gym: (first.name as string) || "",
            startMonth: start.month,
            startYear: start.year,
            endMonth: end.month,
            endYear: end.year,
            description: (first.description as string) || "",
          };
        } else {
          const start = parseExperienceDate(
            first.hl_input_date_date_start as string | undefined
          );
          const end = parseExperienceDate(
            first.hl_input_date_date_end as string | undefined
          );

          experienceData = {
            gym: (first.hl_input_text_gym as string) || "",
            startMonth: start.month,
            startYear: start.year,
            endMonth: end.month,
            endYear: end.year,
            description: (first.hl_textarea_ex_description as string) || "",
          };
        }

        setWorkExperienceDraft(experienceData);
      } else {
        setWorkExperienceDraft(emptyExperience);
      }

      // Отримуємо сертифікати з різних полів
      const rawCertificates =
        meta?.img_link_data_certificate_ ||
        meta?.certificate ||
        rawData.img_link_data_certificate_ ||
        rawData.certificate;

      // Обробляємо сертифікати (можуть бути масивом або рядком)
      if (Array.isArray(rawCertificates) && rawCertificates.length > 0) {
        const certUrls = rawCertificates.filter(
          (url): url is string => typeof url === "string" && url.length > 0
        );
        setCertificateUrls(certUrls);
      } else if (
        typeof rawCertificates === "string" &&
        rawCertificates.length > 0
      ) {
        // Якщо це рядок, перевіряємо чи це JSON
        try {
          const trimmed = rawCertificates.trim();
          if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              const urls = parsed.filter(
                (url): url is string =>
                  typeof url === "string" && url.length > 0
              );
              setCertificateUrls(urls);
            } else {
              setCertificateUrls([trimmed]);
            }
          } else {
            setCertificateUrls([trimmed]);
          }
        } catch {
          setCertificateUrls([rawCertificates]);
        }
      } else {
        setCertificateUrls([]);
      }

      const rawGallery =
        (rawData as Record<string, unknown>).gallery ||
        ((rawData as Record<string, unknown>).meta &&
          ((rawData as Record<string, unknown>).meta as Record<string, unknown>)
            ?.gallery) ||
        ((rawData as Record<string, unknown>).meta &&
          ((rawData as Record<string, unknown>).meta as Record<string, unknown>)
            ?.img_link_data_gallery_) ||
        ((rawData as Record<string, unknown>).acf &&
          ((rawData as Record<string, unknown>).acf as Record<string, unknown>)
            ?.gallery) ||
        ((rawData as Record<string, unknown>).acf &&
          ((rawData as Record<string, unknown>).acf as Record<string, unknown>)
            ?.img_link_data_gallery_) ||
        meta?.gallery ||
        meta?.img_link_data_gallery_ ||
        (rawData as Record<string, unknown>).personal_gallery ||
        meta?.personal_gallery;

      if (process.env.NODE_ENV !== "production") {
        console.log("[TrainerProfile] Завантаження галереї:", {
          rawGallery,
          gallery: (rawData as Record<string, unknown>).gallery,
          metaGallery: meta?.gallery,
          metaImgLink: meta?.img_link_data_gallery_,
        });
      }

      if (Array.isArray(rawGallery) && rawGallery.length > 0) {
        const galleryUrls = rawGallery
          .map((item) => {
            if (typeof item === "string") {
              // Перевіряємо, чи це JSON-рядок
              try {
                const trimmed = item.trim();
                if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                  const parsed = JSON.parse(trimmed);
                  if (Array.isArray(parsed)) {
                    return parsed.filter(
                      (url): url is string => typeof url === "string"
                    );
                  }
                  return null;
                }
                return trimmed;
              } catch {
                return item;
              }
            }
            if (typeof item === "object" && item !== null && "url" in item) {
              return (item as { url: string }).url;
            }
            return null;
          })
          .flat()
          .filter(
            (url): url is string => typeof url === "string" && url.length > 0
          );

        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[TrainerProfile] Встановлення personalGalleryUrls:",
            galleryUrls
          );
        }

        setPersonalGalleryUrls(galleryUrls);
      } else if (typeof rawGallery === "string" && rawGallery.length > 0) {
        // Перевіряємо, чи це JSON-рядок
        try {
          const trimmed = rawGallery.trim();
          if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              const urls = parsed.filter(
                (url): url is string =>
                  typeof url === "string" && url.length > 0
              );
              setPersonalGalleryUrls(urls);
            } else {
              setPersonalGalleryUrls([trimmed]);
            }
          } else {
            setPersonalGalleryUrls([trimmed]);
          }
        } catch {
          setPersonalGalleryUrls([rawGallery]);
        }
      } else {
        setPersonalGalleryUrls([]);
      }
    } catch (e) {
      // Помилка завантаження профілю
    }
  }, [profile, forceUpdate]);

  const handleInputChange = (
    field: keyof TrainerProfileForm,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (
      field === "position" ||
      field === "experience" ||
      field === "location" ||
      field === "desiredBoards"
    ) {
      setPersonalErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddFavoriteExercise = () => {
    if (newFavoriteExercise.trim()) {
      setFormData((prev) => ({
        ...prev,
        favoriteExercises: [
          ...prev.favoriteExercises,
          newFavoriteExercise.trim(),
        ],
      }));
      setNewFavoriteExercise("");
    }
  };

  const handleRemoveFavoriteExercise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      favoriteExercises: prev.favoriteExercises.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim()) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()],
      }));
      setNewSpecialization("");
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  const handleReset = async () => {
    setFormData({
      position: "",
      experience: "",
      location: "",
      desiredBoards: "",
      superpower: "",
      favoriteExercises: [],
      specializations: [],
      trainingLocations: [],
    });

    setPersonalErrors({});
    setEditingIndex(null);
    setWorkExperienceDraft(emptyExperience);
    setNewFavoriteExercise("");
    setNewSpecialization("");
    setForceUpdate((prev) => prev + 1);

    await queryClient.invalidateQueries({
      queryKey: ["trainer-profile-full", baseProfile?.id, token],
    });
    await refetchProfile();
  };

  const handleSave = async () => {
    const nextErrors: typeof personalErrors = {};
    if (!formData.position.trim()) {
      nextErrors.position = "Поле обов'язкове";
    }
    if (!formData.location.trim()) {
      nextErrors.location = "Поле обов'язкове";
    }
    if (!formData.experience) {
      nextErrors.experience = "Оберіть досвід";
    }
    if (!formData.desiredBoards) {
      nextErrors.desiredBoards = "Оберіть кількість бордів";
    }
    if (Object.keys(nextErrors).length > 0) {
      setPersonalErrors(nextErrors);
      return;
    }

    const authToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("wp_jwt_override") ||
          localStorage.getItem("wp_jwt") ||
          undefined
        : undefined);

    const acf: Record<string, unknown> = { ...currentMeta };

    delete acf.avatar;
    delete acf.my_wlocation;
    delete acf.hl_data_my_wlocation;
    delete acf.certificate;
    delete acf.gallery;

    if (formData.experience !== undefined) {
      acf.expierence = formData.experience || "";
    }
    if (formData.location !== undefined) {
      acf.city = formData.location || "";
    }
    if (formData.desiredBoards !== undefined) {
      acf.boards = formData.desiredBoards || "";
    }
    if (formData.superpower !== undefined) {
      if (formData.superpower.trim() === "") {
        acf.super_power = "";
      } else {
        acf.super_power = formData.superpower;
      }
    }
    if (formData.favoriteExercises && formData.favoriteExercises.length) {
      acf.favourite_exercise = formData.favoriteExercises.map((exercise) => ({
        exercise: exercise,
      }));
    } else {
      acf.favourite_exercise = [];
    }
    if (formData.specializations && formData.specializations.length) {
      acf.speciality = formData.specializations.map((point) => ({
        point: point,
      }));
    } else {
      acf.speciality = [];
    }
    const hasExperienceDraft =
      workExperienceDraft.gym.trim() ||
      (workExperienceDraft.startMonth && workExperienceDraft.startYear) ||
      workExperienceDraft.description.trim();

    if (hasExperienceDraft) {
      const experienceData = {
        name: workExperienceDraft.gym,
        date_start: formatWorkExperienceDate(
          workExperienceDraft.startYear,
          workExperienceDraft.startMonth
        ),
        date_ended: formatWorkExperienceDate(
          workExperienceDraft.endYear,
          workExperienceDraft.endMonth
        ),
        description: workExperienceDraft.description || "",
      };

      acf.work_experience = [experienceData];
    } else if (currentMeta.work_experience) {
      acf.work_experience = currentMeta.work_experience;
    } else if (currentMeta.my_experience) {
      acf.my_experience = currentMeta.my_experience;
    }

    const numericOrServerId = (profile as unknown as { id?: number | string })
      ?.id;
    const targetId = String(numericOrServerId ?? authUserId ?? "");

    const payload: { id?: string | number; acf: Record<string, unknown> } = {
      acf,
    };
    if (targetId) payload.id = targetId;

    try {
      await updateProfile({ payload, token: authToken });

      try {
        const locationsPayload = (formData.trainingLocations || []).map(
          (loc) => {
            const [lat, lng] = loc.coordinates
              ? loc.coordinates.split(",").map((c) => c.trim())
              : ["", ""];
            return {
              hl_input_text_title: loc.title || "",
              hl_input_text_email: loc.email || "",
              hl_input_text_phone: loc.phone || "",
              hl_input_text_telegram: loc.telegram || "",
              hl_input_text_instagram: loc.instagram || "",
              hl_input_text_facebook: loc.facebook || "",
              hl_input_text_schedule_five: loc.schedule_five || "",
              hl_input_text_schedule_two: loc.schedule_two || "",
              hl_input_text_address: loc.address || "",
              hl_input_text_coord_lat: lat || "",
              hl_input_text_coord_ln: lng || "",
              hl_img_link_photo: loc.photos || [],
            };
          }
        );

        let freshMeta: Record<string, unknown> = {};
        try {
          const freshProfileRes = await fetch(
            `/api/proxy?path=${encodeURIComponent(
              `/wp-json/wp/v2/users/${targetId}?context=edit`
            )}`,
            {
              method: "GET",
              headers: {
                "x-internal-admin": "1",
              },
            }
          );
          if (freshProfileRes.ok) {
            const freshProfile = await freshProfileRes.json();
            freshMeta = (freshProfile?.meta as Record<string, unknown>) || {};
          }
        } catch (error) {
          // Помилка отримання свіжих даних
        }

        // Спочатку завантажуємо нові файли галереї на сервер (якщо є)
        const filesToUpload = getGalleryFilesFn ? getGalleryFilesFn() : [];
        let uploadedUrls: string[] = [];

        if (filesToUpload.length > 0 && authToken) {
          try {
            if (process.env.NODE_ENV !== "production") {
              console.log(
                "[TrainerProfile] Завантаження нових файлів галереї:",
                {
                  filesCount: filesToUpload.length,
                }
              );
            }

            // Завантажуємо файли послідовно
            for (const file of filesToUpload) {
              try {
                const resp = await uploadCoachMedia({
                  token: authToken,
                  fieldType: "img_link_data_gallery_",
                  files: [file],
                });

                if (resp?.success && resp.current_field_value) {
                  let parsedValue: unknown = resp.current_field_value;
                  if (typeof resp.current_field_value === "string") {
                    try {
                      const trimmed = resp.current_field_value.trim();
                      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                        parsedValue = JSON.parse(trimmed);
                      } else {
                        parsedValue = trimmed;
                      }
                    } catch {
                      parsedValue = resp.current_field_value;
                    }
                  }

                  const galleryUrls = Array.isArray(parsedValue)
                    ? parsedValue.filter(
                        (url): url is string =>
                          typeof url === "string" && url.length > 0
                      )
                    : typeof parsedValue === "string" && parsedValue.length > 0
                    ? [parsedValue]
                    : [];

                  // Оновлюємо uploadedUrls з останнім значенням з сервера
                  uploadedUrls = galleryUrls;
                }
              } catch (error) {
                if (process.env.NODE_ENV !== "production") {
                  console.error(
                    "[TrainerProfile] Помилка завантаження файлу:",
                    file.name,
                    error
                  );
                }
              }
            }
          } catch (error) {
            if (process.env.NODE_ENV !== "production") {
              console.error(
                "[TrainerProfile] Помилка завантаження файлів галереї:",
                error
              );
            }
          }
        }

        // Завантажуємо нові файли сертифікатів на сервер (якщо є)
        const certificatesFilesToUpload = getCertificatesFilesFn
          ? getCertificatesFilesFn()
          : [];
        let uploadedCertificatesUrls: string[] = [];

        if (certificatesFilesToUpload.length > 0 && authToken) {
          try {
            if (process.env.NODE_ENV !== "production") {
              console.log(
                "[TrainerProfile] Завантаження нових файлів сертифікатів:",
                {
                  filesCount: certificatesFilesToUpload.length,
                }
              );
            }

            // Завантажуємо файли послідовно
            for (const file of certificatesFilesToUpload) {
              try {
                const resp = await uploadCoachMedia({
                  token: authToken,
                  fieldType: "img_link_data_certificate_",
                  files: [file],
                });

                if (resp?.success && resp.current_field_value) {
                  let parsedValue: unknown = resp.current_field_value;
                  if (typeof resp.current_field_value === "string") {
                    try {
                      const trimmed = resp.current_field_value.trim();
                      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                        parsedValue = JSON.parse(trimmed);
                      } else {
                        parsedValue = trimmed;
                      }
                    } catch {
                      parsedValue = resp.current_field_value;
                    }
                  }

                  const certificateUrls = Array.isArray(parsedValue)
                    ? parsedValue.filter(
                        (url): url is string =>
                          typeof url === "string" && url.length > 0
                      )
                    : typeof parsedValue === "string" && parsedValue.length > 0
                    ? [parsedValue]
                    : [];

                  // Оновлюємо uploadedCertificatesUrls з останнім значенням з сервера
                  uploadedCertificatesUrls = certificateUrls;
                }
              } catch (error) {
                if (process.env.NODE_ENV !== "production") {
                  console.error(
                    "[TrainerProfile] Помилка завантаження файлу сертифіката:",
                    file.name,
                    error
                  );
                }
              }
            }
          } catch (error) {
            if (process.env.NODE_ENV !== "production") {
              console.error(
                "[TrainerProfile] Помилка завантаження файлів сертифікатів:",
                error
              );
            }
          }
        }

        // Отримуємо поточний стан галереї з PersonalGallerySection (з урахуванням видалених фото)
        const currentGalleryFromState = getGalleryUrlsFn
          ? getGalleryUrlsFn()
          : [];

        // Отримуємо поточний стан сертифікатів з CertificatesSection (з урахуванням видалених сертифікатів)
        const currentCertificatesFromState = getCertificatesUrlsFn
          ? getCertificatesUrlsFn()
          : [];

        // Формуємо фінальний масив галереї:
        // 1. Беремо currentGalleryFromState як основу (вона вже містить видалені фото)
        // 2. Якщо були завантажені нові файли, додаємо їх з uploadedUrls
        let galleryUrls: string[] = [];

        if (uploadedUrls.length > 0) {
          // Якщо були завантажені нові файли:
          // uploadedUrls містить всі фото з сервера після завантаження (включаючи нові)
          // currentGalleryFromState містить тільки ті фото, які не були видалені локально
          // Потрібно: взяти uploadedUrls і залишити тільки ті, що є в currentGalleryFromState + нові завантажені
          const currentUrlsSet = new Set(currentGalleryFromState);

          // Фільтруємо uploadedUrls: залишаємо тільки ті, що є в currentGalleryFromState (не видалені)
          const existingUrls = uploadedUrls.filter((url) =>
            currentUrlsSet.has(url)
          );

          // Знаходимо нові завантажені файли (ті, що в uploadedUrls, але не в currentGalleryFromState)
          const newUploadedUrls = uploadedUrls.filter(
            (url) => !currentUrlsSet.has(url)
          );

          // Об'єднуємо: існуючі (не видалені) + нові завантажені
          galleryUrls = [...existingUrls, ...newUploadedUrls];
        } else {
          // Якщо нових файлів не було, використовуємо поточний стан (з урахуванням видалених)
          const currentGalleryValue =
            freshMeta.img_link_data_gallery_ || freshMeta.gallery;
          galleryUrls =
            currentGalleryFromState.length > 0
              ? currentGalleryFromState
              : personalGalleryUrls.length > 0
              ? personalGalleryUrls
              : Array.isArray(currentGalleryValue)
              ? currentGalleryValue.filter(
                  (url): url is string => typeof url === "string"
                )
              : typeof currentGalleryValue === "string"
              ? [currentGalleryValue]
              : [];
        }

        if (process.env.NODE_ENV !== "production") {
          console.log("[TrainerProfile] Збереження галереї:", {
            uploadedUrlsCount: uploadedUrls.length,
            currentGalleryFromStateCount: currentGalleryFromState.length,
            finalGalleryUrlsCount: galleryUrls.length,
            uploadedUrls,
            currentGalleryFromState,
            galleryUrls,
          });
        }

        // Формуємо фінальний масив сертифікатів (аналогічно до галереї)
        let certificatesUrls: string[] = [];

        if (uploadedCertificatesUrls.length > 0) {
          // Якщо були завантажені нові файли
          const currentCertificatesSet = new Set(currentCertificatesFromState);
          const existingCertificates = uploadedCertificatesUrls.filter((url) =>
            currentCertificatesSet.has(url)
          );
          const newUploadedCertificates = uploadedCertificatesUrls.filter(
            (url) => !currentCertificatesSet.has(url)
          );
          certificatesUrls = [
            ...existingCertificates,
            ...newUploadedCertificates,
          ];
        } else {
          // Якщо нових файлів не було, використовуємо поточний стан (з урахуванням видалених)
          const currentCertificatesValue =
            freshMeta.img_link_data_certificate_ || freshMeta.certificate;
          certificatesUrls =
            currentCertificatesFromState.length > 0
              ? currentCertificatesFromState
              : certificateUrls.length > 0
              ? certificateUrls
              : Array.isArray(currentCertificatesValue)
              ? currentCertificatesValue.filter(
                  (url): url is string => typeof url === "string"
                )
              : typeof currentCertificatesValue === "string" &&
                currentCertificatesValue.length > 0
              ? [currentCertificatesValue]
              : [];
        }

        if (process.env.NODE_ENV !== "production") {
          console.log("[TrainerProfile] Збереження сертифікатів:", {
            uploadedCertificatesUrlsCount: uploadedCertificatesUrls.length,
            currentCertificatesFromStateCount:
              currentCertificatesFromState.length,
            finalCertificatesUrlsCount: certificatesUrls.length,
            uploadedCertificatesUrls,
            currentCertificatesFromState,
            certificatesUrls,
          });
        }

        const metaToSave: Record<string, unknown> = {
          ...(freshMeta.input_text_social_phone !== undefined
            ? { input_text_social_phone: freshMeta.input_text_social_phone }
            : {}),
          ...(freshMeta.input_text_social_telegram !== undefined
            ? {
                input_text_social_telegram:
                  freshMeta.input_text_social_telegram,
              }
            : {}),
          ...(freshMeta.input_text_social_instagram !== undefined
            ? {
                input_text_social_instagram:
                  freshMeta.input_text_social_instagram,
              }
            : {}),
          hl_data_my_wlocation: locationsPayload,
          ...(formData.position !== undefined
            ? { input_text_position: formData.position.trim() || "" }
            : {}),
          // Завжди відправляємо галерею (навіть якщо порожня), щоб зберегти зміни
          img_link_data_gallery_: galleryUrls,
          // Завжди відправляємо сертифікати (навіть якщо порожні), щоб зберегти зміни
          // Якщо сертифікатів більше одного - відправляємо масив, інакше - рядок (для сумісності)
          img_link_data_certificate_:
            certificatesUrls.length > 1
              ? certificatesUrls
              : certificatesUrls.length === 1
              ? certificatesUrls[0]
              : "",
        };

        const metaPayload = {
          id: targetId,
          meta: metaToSave,
        };

        const metaProxyUrl = `/api/proxy?path=${encodeURIComponent(
          `/wp-json/wp/v2/users/${targetId}`
        )}`;
        const metaRes = await fetch(metaProxyUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-internal-admin": "1",
          },
          body: JSON.stringify(metaPayload),
        });

        if (!metaRes.ok) {
          // Помилка збереження локацій та position
        }
      } catch (metaError) {
        // Помилка збереження локацій та position в meta
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await refetchProfile();
    } catch (e) {
      // Помилка оновлення профілю
    }
  };

  const handleModalSave = (location: TrainingLocation) => {
    setFormData((prev) => {
      const current = [...(prev.trainingLocations || [])];
      if (
        editingIndex !== null &&
        editingIndex >= 0 &&
        editingIndex < current.length
      ) {
        current[editingIndex] = location;
      } else {
        current.push(location);
      }
      return { ...prev, trainingLocations: current };
    });
    setEditingIndex(null);
    closeModal();
  };

  const openModal = () => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.body.classList.add("modalOpen");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.body.classList.remove("modalOpen");
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const idx = (e as CustomEvent).detail?.index as number;
      const loc = formData.trainingLocations?.[idx];
      if (!loc) return;
      setEditingIndex(idx);
      openModal();
    };
    const handleDelete = (e: Event) => {
      const idx = (e as CustomEvent).detail?.index as number;
      setFormData((prev) => ({
        ...prev,
        trainingLocations: (prev.trainingLocations || []).filter(
          (_, i) => i !== idx
        ),
      }));
    };
    window.addEventListener("trainerLocationEdit", handleEdit as EventListener);
    window.addEventListener(
      "trainerLocationDelete",
      handleDelete as EventListener
    );
    return () => {
      window.removeEventListener(
        "trainerLocationEdit",
        handleEdit as EventListener
      );
      window.removeEventListener(
        "trainerLocationDelete",
        handleDelete as EventListener
      );
    };
  }, [formData.trainingLocations]);

  useEffect(() => {
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.classList.remove("modalOpen");
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <div className={styles.trainerProfile}>
      <div className={styles.header}>
        <h2 className={styles.title}>Профіль тренера</h2>
      </div>

      <div className={styles.divider1}></div>

      <div className={styles.form}>
        <PersonalDataSection
          formData={formData}
          onChange={(field, value) => handleInputChange(field, value)}
          errors={personalErrors}
        />
        <div className={styles.divider}></div>
        <PersonalGallerySection
          onChange={setPersonalGalleryFiles}
          initialImages={personalGalleryUrls}
          userId={baseProfile?.id || authUserId}
          onGetGalleryUrls={useCallback((fn: () => string[]) => {
            setGetGalleryUrlsFn(() => fn);
          }, [])}
          onGetFiles={useCallback((fn: () => File[]) => {
            setGetGalleryFilesFn(() => fn);
          }, [])}
          onUploadSuccess={async () => {
            // Оновлюємо тільки галерею, не весь профіль, щоб не перезаписати інші поля
            // Інвалідуємо кеш для оновлення галереї
            await queryClient.invalidateQueries({
              queryKey: ["trainer-profile-full", baseProfile?.id, token],
            });
            // Невелика затримка, щоб сервер встиг оновити дані
            await new Promise((resolve) => setTimeout(resolve, 500));
            // Оновлюємо тільки галерею, не весь профіль
            const updatedProfile = await refetchProfile();
            if (updatedProfile.data) {
              const rawData = updatedProfile.data as Record<string, unknown>;
              const meta = rawData.meta as Record<string, unknown> | undefined;
              const acf = rawData.acf as Record<string, unknown> | undefined;
              const rawGallery =
                rawData.gallery ||
                (meta?.gallery as unknown) ||
                (meta?.img_link_data_gallery_ as unknown) ||
                (acf?.gallery as unknown) ||
                (acf?.img_link_data_gallery_ as unknown) ||
                (rawData as Record<string, unknown>).personal_gallery ||
                (meta?.personal_gallery as unknown);

              if (Array.isArray(rawGallery) && rawGallery.length > 0) {
                const galleryUrls = rawGallery
                  .map((item) => {
                    if (typeof item === "string") {
                      try {
                        const trimmed = item.trim();
                        if (
                          trimmed.startsWith("[") ||
                          trimmed.startsWith("{")
                        ) {
                          const parsed = JSON.parse(trimmed);
                          if (Array.isArray(parsed)) {
                            return parsed.filter(
                              (url): url is string => typeof url === "string"
                            );
                          }
                          return null;
                        }
                        return trimmed;
                      } catch {
                        return item;
                      }
                    }
                    if (
                      typeof item === "object" &&
                      item !== null &&
                      "url" in item
                    ) {
                      return (item as { url: string }).url;
                    }
                    return null;
                  })
                  .flat()
                  .filter(
                    (url): url is string =>
                      typeof url === "string" && url.length > 0
                  );
                setPersonalGalleryUrls(galleryUrls);
              } else if (
                typeof rawGallery === "string" &&
                rawGallery.length > 0
              ) {
                try {
                  const trimmed = rawGallery.trim();
                  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                      const urls = parsed.filter(
                        (url): url is string =>
                          typeof url === "string" && url.length > 0
                      );
                      setPersonalGalleryUrls(urls);
                    } else {
                      setPersonalGalleryUrls([trimmed]);
                    }
                  } else {
                    setPersonalGalleryUrls([trimmed]);
                  }
                } catch {
                  setPersonalGalleryUrls([rawGallery]);
                }
              } else {
                setPersonalGalleryUrls([]);
              }
            }
          }}
        />
        <div className={styles.divider}></div>
        <SuperpowerSection
          value={formData.superpower}
          onChange={(value) => handleInputChange("superpower", value)}
        />
        <div className={styles.divider}></div>
        <TagsSection
          title="Моя улюблена вправа:"
          placeholder="Улюблена вправа"
          values={formData.favoriteExercises}
          newValue={newFavoriteExercise}
          onNewValueChange={setNewFavoriteExercise}
          onAdd={handleAddFavoriteExercise}
          onRemove={handleRemoveFavoriteExercise}
        />
        <div className={styles.divider}></div>
        <TagsSection
          title="Спеціалізація:"
          placeholder="Спеціалізація"
          values={formData.specializations}
          newValue={newSpecialization}
          onNewValueChange={setNewSpecialization}
          onAdd={handleAddSpecialization}
          onRemove={handleRemoveSpecialization}
        />
        <div className={styles.divider}></div>
        <WorkExperienceSection
          value={workExperienceDraft}
          onChange={(field, value) =>
            setWorkExperienceDraft((prev) => ({ ...prev, [field]: value }))
          }
        />
        <div className={styles.divider}></div>
        <TrainingLocationsSection
          onAddClick={openModal}
          locations={formData.trainingLocations || []}
        />
        <div className={styles.divider}></div>
        <CertificatesSection
          onChange={setCertificateFiles}
          initialCertificates={certificateUrls}
          onGetCertificatesUrls={useCallback((fn: () => string[]) => {
            setGetCertificatesUrlsFn(() => fn);
          }, [])}
          onGetCertificatesFiles={useCallback((fn: () => File[]) => {
            setGetCertificatesFilesFn(() => fn);
          }, [])}
        />
        <div className={styles.bottomActions}>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={isPending}
          >
            Зберегти дані
          </button>
          <button
            className={styles.clearBtn}
            onClick={handleReset}
            disabled={isPending}
          >
            Стерти всю інформацію
          </button>
        </div>
      </div>

      <TrainingLocationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        initialLocation={
          editingIndex !== null && formData.trainingLocations
            ? formData.trainingLocations[editingIndex] || null
            : null
        }
      />
    </div>
  );
};

export default TrainerProfile;
