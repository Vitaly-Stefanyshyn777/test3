import api from "./api";

export interface CoachApi {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  experience?: string;
  location_city?: string | string[];
  location_country?: string | string[];
  avatar?: string | string[];
  gallery?: string | string[];
  certificate?: string[];
  super_power?: string;
  favourite_exercise?: string | string[];
  my_specialty?: string[] | string;
  my_experience?: Array<{
    hl_input_text_gym?: string;
    hl_input_date_date_start?: string;
    hl_input_date_date_end?: string;
    hl_textarea_ex_description?: string;
  }>;
  my_wlocation?: Array<{
    hl_input_text_title?: string;
    hl_input_text_email?: string;
    hl_input_text_phone?: string;
    hl_input_text_schedule_five?: string;
    hl_input_text_schedule_two?: string;
    hl_input_text_address?: string;
    hl_input_text_coord_lat?: string;
    hl_input_text_coord_ln?: string;
    coord_lat?: string;
    coord_lng?: string;
    latitude?: string | number;
    longitude?: string | number;
    lat?: string | number;
    lng?: string | number;
  }>;
  meta?: Record<string, unknown>;
  avatar_urls?: Record<string, string>;
}

export interface CoachUiItem {
  id: string;
  name: string;
  location: string;
  specialization: string;
  image: string;
  experience: string;
  superPower: string;
  favouriteExercise: string;
  workExperience: Array<{
    gym: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
}

function ensureString(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string")
    return value[0] as string;
  return "";
}

function joinToString(value: unknown, separator = ", "): string {
  if (Array.isArray(value))
    return (value as unknown[])
      .filter((v): v is string => typeof v === "string")
      .join(separator);
  if (typeof value === "string") return value;
  return "";
}

export const getCoachesFirstPage = async (): Promise<{
  data: CoachApi[];
  totalPages: number;
}> => {
  try {
    console.log("[getCoachesFirstPage] 🚀 Запитую тренерів з API...");
    const response = await api.get("/api/trainers", {
      params: {
        roles: "bfb_coach",
        per_page: 100,
        context: "edit", // Додаємо context=edit, щоб отримати first_name та last_name
      },
      headers: { "x-internal-admin": "1" },
    });

    const totalPages = Number(response.headers["x-wp-totalpages"]) || 1;
    console.log(
      "[getCoachesFirstPage] ✅ Отримано тренерів:",
      response.data?.length || 0
    );

    return {
      data: response.data,
      totalPages,
    };
  } catch (error: unknown) {
    // Якщо 401 — спробуємо авто-логін адміна і повторимо запит один раз
    const maybeAxiosErr = error as { response?: { status?: number } };
    const isAxios401 =
      error &&
      typeof error === "object" &&
      "response" in maybeAxiosErr &&
      maybeAxiosErr.response?.status === 401;

    if (isAxios401) {
      try {
        console.warn(
          "[getCoachesFirstPage] 401 → виконую /api/admin-login і повторюю запит…"
        );
        await fetch("/api/admin-login", {
          method: "POST",
          credentials: "include",
        });
        // невелика пауза щоб кукі застосуався на сервері
        await new Promise((r) => setTimeout(r, 250));

        const retry = await api.get("/api/trainers", {
          params: { roles: "bfb_coach", per_page: 100 },
          headers: { "x-internal-admin": "1" },
        });

        const totalPages = Number(retry.headers["x-wp-totalpages"]) || 1;
        console.log(
          "[getCoachesFirstPage] ✅ Після логіну отримано тренерів:",
          retry.data?.length || 0
        );
        return { data: retry.data, totalPages };
      } catch (e) {
        console.error(
          "[getCoachesFirstPage] Повтор після логіну не вдався:",
          e
        );
      }
    }

    console.error("Failed to fetch coaches:", error);

    console.warn("Using mock coaches data");
    const mockCoaches: CoachApi[] = [
      {
        id: 1,
        name: "Олександр Петренко",
        first_name: "Олександр",
        last_name: "Петренко",
        position: "Фітнес тренер",
        experience: "5 років",
        location_city: "Київ",
        location_country: "Україна",
        avatar: "/images/happy-man.jpg",
        super_power: "Силові тренування",
        favourite_exercise: "Жим лежачи",
        my_specialty: ["Силові тренування", "Бодибілдінг"],
        my_experience: [],
        my_wlocation: [],
      },
      {
        id: 2,
        name: "Марія Коваленко",
        first_name: "Марія",
        last_name: "Коваленко",
        position: "Йога інструктор",
        experience: "3 роки",
        location_city: "Львів",
        location_country: "Україна",
        avatar: "/images/happy-woman.jpg",
        super_power: "Йога та медитація",
        favourite_exercise: "Планка",
        my_specialty: ["Йога", "Стретчинг"],
        my_experience: [],
        my_wlocation: [],
      },
    ];

    return {
      data: mockCoaches,
      totalPages: 1,
    };
  }
};

export const getCoachesPage = async (page: number): Promise<CoachApi[]> => {
  const response = await api.get("/api/trainers", {
    params: {
      roles: "bfb_coach",
      per_page: 100,
      page: page,
      context: "edit", // Додаємо context=edit, щоб отримати first_name та last_name
    },
    headers: { "x-internal-admin": "1" },
  });

  return response.data;
};

export const getAllCoaches = async (): Promise<CoachApi[]> => {
  const { data: firstPageData, totalPages } = await getCoachesFirstPage();

  if (totalPages <= 1) {
    return firstPageData;
  }

  const restPagesPromises = Array.from({ length: totalPages - 1 }, (_, i) =>
    getCoachesPage(i + 2)
  );

  const restPagesData = await Promise.all(restPagesPromises);
  const allCoaches = [firstPageData, ...restPagesData].flat();

  return allCoaches;
};

export const getCoachById = async (id: string): Promise<CoachApi> => {
  try {
    const response = await api.get(`/api/trainers/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      error.response.status === 401
    ) {
      try {
        const allCoaches = await getAllCoaches();
        const coach = allCoaches.find((c) => String(c.id) === id);
        if (coach) {
          return coach;
        }
      } catch {}
    }

    throw error;
  }
};

export const getCoachesFiltered = async (
  opts: {
    countries?: string[];
    cities?: string[];
    roles?: string[];
    page?: number;
    per_page?: number;
  } = {}
): Promise<{
  data: CoachApi[];
  totalPages: number;
}> => {
  const {
    countries = [],
    cities = [],
    roles = ["bfb_coach"],
    page = 1,
    per_page = 100,
  } = opts;

  const params = new URLSearchParams();
  params.set("per_page", String(per_page));
  params.set("page", String(page));
  if (roles.length > 0) params.set("roles", roles.join(","));

  countries.forEach((c) => params.append("countries[]", c));
  cities.forEach((c) => params.append("countries[]", c));

  const response = await api.get("/api/trainers", {
    params: {
      roles: roles.join(","),
      per_page: per_page,
      page: page,
      countries: countries,
      cities: cities,
      context: "edit", // Додаємо context=edit, щоб отримати first_name та last_name
    },
    headers: { "x-internal-admin": "1" },
  });
  const totalPages = Number(response.headers["x-wp-totalpages"]) || 1;

  return { data: response.data, totalPages };
};

export const mapCoachToUi = (item: CoachApi): CoachUiItem => {
  console.log("[mapCoachToUi] 🔄 Маплю тренера:", {
    id: item.id,
    name: item.name,
    location_city: item.location_city,
    location_country: item.location_country,
    avatar: item.avatar,
  });

  const topLevelAvatar = ensureString(
    (item as unknown as { img_link_data_avatar?: string })?.img_link_data_avatar
  ).trim();
  const metaAvatar = ensureString(
    (item.meta as { img_link_data_avatar?: string })?.img_link_data_avatar
  ).trim();
  const rawAvatar = ensureString(item.avatar).trim();
  const gravatar96 = ensureString(item.avatar_urls?.["96"]);
  const isLikelyImageUrl = (url: string): boolean => {
    if (!url) return false;
    if (url.includes("wp-admin")) return false; // це явно не картинка
    try {
      const u = new URL(
        url,
        typeof window === "undefined" ? "http://x" : undefined
      );
      const pathname = u.pathname.toLowerCase();
      return (
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".jpeg") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".webp") ||
        pathname.endsWith(".gif")
      );
    } catch {
      return false;
    }
  };

  const prioritized = [topLevelAvatar, metaAvatar, rawAvatar, gravatar96].find(
    (url) => url && isLikelyImageUrl(url)
  );
  const avatarValue = prioritized || "/placeholder.png";

  const city = joinToString(item.location_city);
  const country = joinToString(item.location_country);
  const locationsValue = [city, country].filter(Boolean).join(", ");

  const specializationValue = item.position
    ? item.position
    : joinToString(item.my_specialty);

  const workExperience = Array.isArray(item.my_experience)
    ? item.my_experience.map((exp) => ({
        gym: exp.hl_input_text_gym || "",
        startDate: exp.hl_input_date_date_start || "",
        endDate: exp.hl_input_date_date_end || "",
        description: exp.hl_textarea_ex_description || "",
      }))
    : [];

  const fullName = `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim();

  const mapped = {
    id: String(item.id),
    // SSOT: завжди віддаємо пріоритет first_name + last_name з user,
    // а title/name з CPT використовуємо лише як fallback
    name: fullName || item.name || "",
    location: locationsValue,
    specialization: specializationValue,
    image: avatarValue,
    experience: item.experience || "",
    superPower: item.super_power || "",
    favouriteExercise: joinToString(item.favourite_exercise),
    workExperience,
  };

  console.log("[mapCoachToUi] ✅ Результат мапінгу:", {
    id: mapped.id,
    name: mapped.name,
    location: mapped.location,
    image: mapped.image,
  });

  return mapped;
};
