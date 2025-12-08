import api from "./api";

// На клієнті використовуємо NEXT_PUBLIC_UPSTREAM_BASE, на сервері - UPSTREAM_BASE
const BASE_URL =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_UPSTREAM_BASE
    : process.env.UPSTREAM_BASE) || "";

export type FaqCategory = {
  id: number;
  name: string;
  slug: string;
};

export type FaqItem = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  acf?: {
    question?: string; // Питання
    answer?: string; // Відповідь
  };
  faq_category?: number[];
  faq_type?: number[]; // Альтернативна назва поля
};

export type EventPost = {
  id: number;
  date?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  // Нові поля з acf
  acf?: {
    // Нові поля
    city?: string;
    location?: string;
    description?: string;
    // image може бути рядком, масивом або об'єктом з desctop/mobile
    image?: string | string[] | {
      desctop?: string;
      mobile?: string;
    };
    photo?: string | string[];
    banner?: string | string[];
    img_link_data_banner?: string | string[]; // Поле для зображення (може бути JSON рядок або масив)
    // Старі поля (для fallback)
    input_text_city?: string;
    input_text_location?: string;
    textarea_description?: string;
    // hl_data_result - може бути масив або JSON-рядок (нова структура)
    hl_data_result?: Array<{
      title?: string;
      svg_code?: string;
      hl_input_text_text?: string;
      hl_img_svg_icon?: string;
    }> | string;
    // hl_data_schedule - може бути масив або JSON-рядок (нова структура)
    hl_data_schedule?: Array<{
      date?: string;
      time?: string;
      hl_input_date_date?: string;
      hl_input_time_time?: string;
    }> | string;
  };
};

export type MainCoursePost = {
  id: number;
  title?: { rendered?: string };
  // Деякі поля можуть приходити як на верхньому рівні, так і в ACF
  Is_online?: number | string;
  Price?: string | number;
  Price_old?: string | number;
  Discount?: string | number;
  Image?: string;
  featured_media?: number;
  About_course?: string[];
  Course_info?:
    | {
        опис?: string;
        description?: string;
      }
    | Record<string, unknown>;
  acf?: {
    Is_online?: number | string;
    Course_include?: string[];
    What_learn?: string[];
    Price?: string | number;
    Price_old?: string | number;
    About?: string;
    description?: string;
    Image?: string;
    Course_info?:
      | {
          опис?: string;
          description?: string;
        }
      | Record<string, unknown>;
  } & Record<string, unknown>;
};

export type CourseData = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  course_data: {
    Course_themes: string[];
    What_learn: string[];
    Course_include: string[];
    Course_program: Array<{
      hl_input_text_title: string;
      hl_input_text_lesson_count: string;
      hl_textarea_description: string;
      hl_textarea_themes: string;
    }>;
    Date_start: string | null;
    Duration: string | null;
    Blocks: string | null;
    Course_coach: {
      ID: number;
      title: string;
      input_text_experience: string;
      input_text_status: string;
      input_text_status_1: string;
      input_text_status_2: string;
      input_text_count_training: string;
      input_text_history: string;
      input_text_certificates: string;
      input_text_link_instagram: string;
      input_text_text_instagram: string;
      textarea_description: string;
      textarea_about_me: string;
      textarea_my_mission: string;
      img_link_avatar: string;
      point_specialization: string;
    } | null;
    Required_equipment: string | null;
    Online_lessons: string | null;
  };
};

async function safeFetch<T>(url: string): Promise<T> {
  // Якщо URL вже повний (починається з http), використовуємо його як є
  // Якщо URL відносний і починається з /api/, це Next.js API роут - використовуємо як є
  // Інакше додаємо BASE_URL для зовнішніх API
  const fullUrl =
    url.startsWith("http") || url.startsWith("/api/")
      ? url
      : `${BASE_URL}${url}`;

  const res = await fetch(fullUrl, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export async function fetchFaqCategories(): Promise<FaqCategory[]> {
  return safeFetch<FaqCategory[]>(`/wp-json/wp/v2/faq_category`);
}

export async function fetchFaqByCategory(
  categoryId?: number
): Promise<FaqItem[]> {
  const qs = categoryId ? `?faq_category=${categoryId}` : "";
  return safeFetch<FaqItem[]>(`/api/faq${qs}`);
}

// Функція для парсингу JSON рядків з meta_data
function parseMetaJson<T>(jsonString: string | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function fetchCourse(courseIdOrSlug?: number | string): Promise<CourseData> {
  if (!courseIdOrSlug) {
    throw new Error("Course ID or slug is required");
  }

  // Якщо це число або числовий рядок, використовуємо як ID
  let wcCourse;
  if (typeof courseIdOrSlug === "number" || /^\d+$/.test(String(courseIdOrSlug))) {
    const wcResponse = await fetch(`/api/wc/v3/products/${courseIdOrSlug}`);
    if (!wcResponse.ok) {
      throw new Error(`Failed to fetch course: ${wcResponse.status}`);
    }
    wcCourse = await wcResponse.json();
  } else {
    // Якщо це slug, спочатку отримуємо всі курси та шукаємо за slug
    const allCoursesResponse = await fetch(`/api/wc/v3/products?category=72&per_page=100`);
    if (!allCoursesResponse.ok) {
      throw new Error(`Failed to fetch courses: ${allCoursesResponse.status}`);
    }
    const allCourses = await allCoursesResponse.json();
    
    // Нормалізуємо slug: декодуємо URL-encoded значення та очищаємо від ____full____
    const normalizeSlug = (slug: string): string => {
      if (!slug) return '';
      try {
        // Спробуємо декодувати, якщо це encoded
        let decoded = slug;
        try {
          decoded = decodeURIComponent(slug);
        } catch {
          // Якщо не вдалося декодувати, використовуємо оригінал
          decoded = slug;
        }
        
        // Очищаємо від ____full____
        decoded = decoded.replace(/____full____/g, '');
        
        // Нормалізуємо: приводимо до нижнього регістру та прибираємо зайві пробіли
        return decoded.toLowerCase().trim();
      } catch {
        // Якщо виникла помилка, повертаємо як є
        return slug.toLowerCase().trim();
      }
    };
    
    // Next.js автоматично декодує slug з URL, тому courseIdOrSlug приходить декодованим
    const normalizedSlug = normalizeSlug(String(courseIdOrSlug));
    
    const course = allCourses.find((c: { slug?: string; id: number }) => {
      if (!c.slug) return false;
      
      // Нормалізуємо slug з API
      const normalizedCourseSlug = normalizeSlug(c.slug);
      
      // Порівнюємо нормалізовані значення
      const slugMatch = 
        c.slug === String(courseIdOrSlug) || // Exact match
        normalizedCourseSlug === normalizedSlug || // Нормалізовані значення
        c.slug.toLowerCase() === String(courseIdOrSlug).toLowerCase() || // Case-insensitive
        normalizedCourseSlug === String(courseIdOrSlug).toLowerCase(); // Нормалізований API slug === URL slug
      
      return slugMatch;
    });
    
    if (!course) {
      throw new Error(`Course not found: ${courseIdOrSlug}`);
    }
    
    wcCourse = course;
  }

  // Витягуємо дані з meta_data
  const metaData = wcCourse.meta_data || [];

  const getMetaValue = (key: string): string | undefined => {
    return metaData.find(
      (meta: { key: string; value: string }) => meta.key === key
    )?.value;
  };

  // Парсимо course_data з meta_data
  const courseThemes = parseMetaJson<string[]>(
    getMetaValue("point_data_course_themes"),
    []
  );
  const whatLearn = parseMetaJson<string[]>(
    getMetaValue("point_data_course_what_learn"),
    []
  );
  const courseInclude = parseMetaJson<string[]>(
    getMetaValue("point_data_course_include"),
    []
  );
  const courseProgram = parseMetaJson<
    Array<{
      hl_input_text_title?: string;
      hl_input_text_lesson_count?: string;
      hl_textarea_description?: string;
      hl_textarea_themes?: string;
    }>
  >(getMetaValue("hl_data_course_program"), []);

  const dateStart = getMetaValue("input_date_date_start") || null;
  const duration = getMetaValue("input_text_duration") || null;
  const courseCoachId = getMetaValue("course_coach");
  const requiredEquipment =
    getMetaValue("required_equipment") ||
    getMetaValue("input_required_equipment") ||
    null;

  // Отримуємо дані інструктора, якщо є ID
  let courseCoach = null;
  if (courseCoachId) {
    try {
      const coachId = parseInt(courseCoachId);
      const coachResponse = await fetch(
        `/api/proxy?path=/wp-json/wp/v2/instructors/${coachId}`
      );
      if (coachResponse.ok) {
        const coachData = await coachResponse.json();
        const coachAcf = coachData.acf || {};
        courseCoach = {
          ID: coachId,
          title: coachData.title?.rendered || "",
          input_text_experience:
            (coachAcf.input_text_experience as string) || "",
          input_text_status: (coachAcf.input_text_status as string) || "",
          input_text_status_1: "",
          input_text_status_2: "",
          input_text_count_training:
            (coachAcf.input_text_count_training as string) || "",
          input_text_history: (coachAcf.input_text_history as string) || "",
          input_text_certificates:
            (coachAcf.input_text_certificates as string) || "",
          input_text_link_instagram:
            (coachAcf.instagram as { url?: string })?.url || "",
          input_text_text_instagram:
            (coachAcf.instagram as { title?: string })?.title || "",
          textarea_description: (coachAcf.textarea_description as string) || "",
          textarea_about_me: (coachAcf.textarea_about_me as string) || "",
          textarea_my_mission: (coachAcf.textarea_my_mission as string) || "",
          img_link_avatar: (coachAcf.img_link_data_avatar as string) || "",
          point_specialization: "",
        };
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[fetchCourse] Не вдалося завантажити дані інструктора:",
          error
        );
      }
    }
  }

  // Формуємо CourseData об'єкт
  const courseData: CourseData = {
    id: wcCourse.id,
    title: { rendered: wcCourse.name || "" },
    content: { rendered: wcCourse.description || "" },
    excerpt: { rendered: wcCourse.short_description || "" },
    featured_media: wcCourse.images?.[0]?.id || 0,
    course_data: {
      Course_themes: courseThemes,
      What_learn: whatLearn,
      Course_include: courseInclude,
      Course_program: courseProgram.map((p) => ({
        hl_input_text_title: p.hl_input_text_title || "",
        hl_input_text_lesson_count: p.hl_input_text_lesson_count || "",
        hl_textarea_description: p.hl_textarea_description || "",
        hl_textarea_themes: p.hl_textarea_themes || "",
      })),
      Date_start: dateStart,
      Duration: duration,
      Blocks: null,
      Course_coach: courseCoach,
      Required_equipment: requiredEquipment,
      Online_lessons: null,
    },
  };

  return courseData;
}

export async function fetchEvents(): Promise<EventPost[]> {
  return safeFetch<EventPost[]>(`/wp-json/wp/v2/events`);
}

export async function fetchMainCourses(): Promise<MainCoursePost[]> {
  // Використовуємо спеціальний API route, який правильно обробляє адмін-токен
  const res = await fetch("/api/main-courses", {
    cache: "no-store",
    credentials: "include", // Важливо для передачі cookie
  });
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as MainCoursePost[];
}

export type BannerPost = {
  id: number;
  title?: { rendered?: string };
  // Дозволяємо частину полів на верхньому рівні (WP ACF може віддавати їх саме так)
  Title?: string;
  Description?: string;
  Banner?: string;
  Banner_Mobile?: string;
  banner?: string;
  background?: string;
  Aside_video?: string | string[];
  Aside_photo?: string | string[];
  poster?: string | string[];
  video?: string | string[];
  video_url?: string | string[];
  image?: string | string[];
  acf?: {
    title?: string;
    title_sub?: string;
    description?: string;
    image?: {
      desctop?: string;
      mobile?: string;
    };
    video?:
      | {
          preview?: string;
          url?: string;
        }
      | string
      | string[];
    // Старі поля для зворотної сумісності
    Title?: string;
    Description?: string;
    Banner?: string;
    Banner_Mobile?: string;
    banner?: string;
    background?: string;
    Aside_video?: string | string[];
    Aside_photo?: string | string[];
    poster?: string | string[];
    video_url?: string | string[];
  } | null;
};

export async function fetchBanners(): Promise<BannerPost[]> {
  const res = await fetch("/api/banners", {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as BannerPost[];
}

// Видаляємо неіснуючі ендпоінти

export type ThemeSettingsPost = {
  id?: number;
  // Поля на верхньому рівні (згідно з API)
  input_text_phone?: string;
  input_text_schedule?: string;
  input_text_email?: string;
  input_text_address?: string;
  theme_video_url?: string;
  hl_data_contact?: Array<{
    hl_input_text_name?: string;
    hl_input_text_link?: string;
    hl_img_svg_icon?: string;
  }>;
  hl_data_gallery?: Array<{
    hl_img_link_photo?: string[];
  }>;
  map_markers?: Array<{
    title?: string;
    coordinates?: number[][];
  }>;
  user_city?: string[];
  user_country?: string[];
  // Fallback для старого формату (якщо дані в acf)
  acf?: {
    input_text_phone?: string;
    input_text_schedule?: string;
    input_text_email?: string;
    input_text_address?: string;
    theme_video_url?: string;
    hl_data_contact?: Array<{
      hl_input_text_name?: string;
      hl_input_text_link?: string;
      hl_img_svg_icon?: string;
    }>;
    hl_data_gallery?: Array<{
      hl_img_link_photo?: string[];
    }>;
    map_markers?: Array<{
      title?: string;
      coordinates?: number[][];
    }>;
    user_city?: string[];
    user_country?: string[];
  };
};

export async function fetchThemeSettings(): Promise<ThemeSettingsPost[]> {
  // Використовуємо проксі на клієнті, прямий запит на сервері
  const isClient = typeof window !== "undefined";
  const path = `/wp-json/wp/v2/theme_settings?hl_data_gallery=1`;
  
  let url: string;
  let options: RequestInit = {};
  
  if (isClient) {
    // На клієнті використовуємо проксі
    url = `/api/proxy?path=${encodeURIComponent(path)}`;
  } else {
    // На сервері використовуємо прямий запит
    url = `${BASE_URL}${path}`;
    options = { next: { revalidate: 60 } };
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();

  // Нормалізуємо відповідь до масиву для стабільної роботи хуків
  if (Array.isArray(data)) return data as ThemeSettingsPost[];
  return [data as ThemeSettingsPost];
}

// Отримати проксований URL відео з налаштувань теми
export async function fetchThemeVideoUrl(): Promise<string | null> {
  try {
    const settings = await fetchThemeSettings();
    const firstSetting = settings[0];
    
    // Перевіряємо спочатку в корені об'єкта, потім в acf (для fallback)
    const videoUrl = (firstSetting?.theme_video_url || firstSetting?.acf?.theme_video_url) as string | undefined;

    if (!videoUrl) {
      return null;
    }

    // Повертаємо проксований URL для уникнення CORS проблем
    const proxiedUrl = `/api/video-proxy?url=${encodeURIComponent(videoUrl)}`;
    return proxiedUrl;
  } catch (error) {
    return null;
  }
}

// Допоміжна функція для створення проксованого URL
export function createProxiedVideoUrl(originalUrl: string): string {
  return `/api/video-proxy?url=${encodeURIComponent(originalUrl)}`;
}

// Видаляємо неіснуючі ендпоінти calculator та board

export type CoursePost = {
  id: number;
  title: { rendered: string };
  acf?: {
    course_data?: {
      Course_themes?: string[];
      What_learn?: string[];
      Course_include?: string[];
      Course_program?: Array<{
        hl_input_text_title?: string;
        hl_input_text_lesson_count?: string;
        hl_textarea_description?: string;
        hl_textarea_themes?: string;
      }>;
      Date_start?: string;
      Duration?: string;
      Blocks?: string;
      Course_coach?: {
        ID?: number;
        first_name?: string;
        last_name?: string;
        avatar?: string;
        Experience?: string;
        Super_power?: string;
        Training_conducted?: string;
        Stories_of_transformations?: string;
        Social_media?: {
          telegram?: string;
          phone?: string;
          instagram?: string;
        };
      };
      Required_equipment?: string;
      Online_lessons?: string;
    };
    Is_online?: number;
  };
};

export async function fetchCourses(): Promise<CoursePost[]> {
  return safeFetch<CoursePost[]>(`/wp-json/wp/v2/main_courses`);
}

export type InstructorPost = {
  id: number;
  title: { rendered: string };
  acf?: {
    // Поля для тренерів (з профілю)
    position?: string;
    experience?: string;
    location_city?: string;
    location_country?: string;
    social_phone?: string;
    social_telegram?: string;
    social_instagram?: string;
    boards?: string;
    super_power?: string;
    gallery?: string;
    certificate?: string[];
    avatar?: string;
    favourite_exercise?: string[];
    my_specialty?: string[];
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
    // Нові поля для інструкторів (Засновниця BFB, Люди які створюють BFB)
    input_text_status?: string;
    img_link_data_avatar?: string;
    input_text_experience?: string;
    input_text_count_training?: string;
    input_text_certificates?: string;
    input_text_history?: string;
    textarea_about_me?: string;
    textarea_description?: string;
    textarea_my_mission?: string;
    instagram?: {
      title?: string;
      url?: string;
      target?: string;
    };
    point_data_specialization?: Array<{
      specialization?: string;
    }>;
    points?: Array<{
      point?: string;
    }>;
  };
};

export async function fetchInstructor(id: number): Promise<InstructorPost> {
  return safeFetch<InstructorPost>(`/wp-json/wp/v2/instructors/${id}`);
}

export type CasePost = {
  id: number;
  title?: { rendered?: string };
  acf?: {
    img_link_data_avatar?: string;
    instagram?: {
      title?: string;
      url?: string;
      target?: string;
    };
    textarea_description?: string;
  };
  // Старі поля для сумісності
  Avatar?: string;
  Text_instagram?: string;
  Description?: string;
};

export async function fetchCases(): Promise<CasePost[]> {
  return safeFetch<CasePost[]>(`/wp-json/wp/v2/casec`);
}

export type TariffPost = {
  id: number;
  title: { rendered: string };
  acf?: {
    tariff_name?: string;
    tariff_price?: string;
    tariff_discount?: string;
    tariff_period?: string;
    tariff_features?: string[];
    tariff_popular?: boolean;
    tariff_popular_text?: string;
  };
};

export type UserCategoryPost = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
};

export async function fetchUserCategories(): Promise<UserCategoryPost[]> {
  return safeFetch<UserCategoryPost[]>(`/wp-json/wp/v2/user_category`);
}

export type ApplicationData = {
  name: string;
  email: string;
  phone: string;
  message: string;
  type: "question" | "training";
};

export async function submitApplication(
  data: ApplicationData
): Promise<{ success: boolean; message: string }> {
  try {
    const endpoint =
      data.type === "question"
        ? "/api/applications/question"
        : "/api/applications/training";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await response.json();
    return { success: true, message: "Заявка успішно відправлена" };
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося відправити заявку");
  }
}

export async function submitContactQuestion(payload: {
  name: string;
  email?: string;
  phone?: string;
  nickname?: string;
  question?: string;
}) {
  const endpoint = `/api/applications/question`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export type PurchasedProduct = {
  id: number;
  name: string;
  price: string;
  image: string;
  purchase_date: string;
  status: string;
};

export type Tariff = {
  id: number;
  title: { rendered: string };
  Price: string;
  Time: string;
  Points: Array<{
    Статус: string;
    Текст: string;
  }>;
};

export async function fetchTariffs(): Promise<Tariff[]> {
  try {
    const response = await fetch(`${BASE_URL}/wp-json/wp/v2/tariff`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити тарифи");
  }
}

export async function fetchPurchasedProducts(
  userId: number,
  token?: string
): Promise<PurchasedProduct[]> {
  try {
    if (!Number.isFinite(userId) || userId <= 0) {
      return [];
    }
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BASE_URL}/wp-json/custom/v1/purchased-products?user_id=${userId}&product_list=true`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити придбані курси");
  }
}

export type InstructorAdvantagePost = {
  id: number;
  title: { rendered: string };
  acf?: {
    advantage_title?: string;
    advantage_description?: string;
    advantage_icons?: string[];
    advantage_images?: string[];
    advantage_has_icons?: boolean;
    advantage_has_images?: boolean;
    advantage_visual_type?: string;
  };
};

export async function fetchInstructorAdvantages(): Promise<
  InstructorAdvantagePost[]
> {
  try {
    const fullUrl = `${BASE_URL}/wp-json/wp/v2/instructor_advantages`;
    const res = await fetch(fullUrl, { next: { revalidate: 60 } });
    
    // Якщо ендпоінт не існує (404), повертаємо порожній масив без помилки
    if (res.status === 404) {
      return [];
    }
    
    if (!res.ok) {
      throw new Error(`Request failed ${res.status}: ${await res.text()}`);
    }
    
    return (await res.json()) as InstructorAdvantagePost[];
  } catch (error) {
    // Ендпоінт може не існувати, повертаємо порожній масив
    // Не логуємо помилку для 404, оскільки це очікувана поведінка
    if (error instanceof Error && error.message.includes('404')) {
      return [];
    }
    // Для інших помилок також повертаємо порожній масив, але можна додати логування
    return [];
  }
}

export type WooCommerceCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
  } | null;
  menu_order: number;
  count: number;
};

export async function fetchProductCategories(): Promise<WooCommerceCategory[]> {
  try {
    // Отримуємо категорії товарів (фізичні товари) з батьківською категорією 77
    const response = await fetch(
      "/api/wc/products/categories?parent=77&per_page=100"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити категорії товарів");
  }
}

// Отримання категорій тренувань (батьківська категорія 55)
export async function fetchTrainingCategories(): Promise<
  WooCommerceCategory[]
> {
  try {
    const response = await fetch(
      "/api/wc/products/categories?parent=55&per_page=100"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити категорії тренувань");
  }
}

// Отримання категорій курсів (батьківська категорія 72)
export async function fetchCourseCategories(): Promise<WooCommerceCategory[]> {
  try {
    const response = await fetch(
      "/api/wc/products/categories?parent=72&per_page=100"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Silent logging
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити категорії курсів");
  }
}

// Отримання категорій FAQ
export async function fetchFAQCategories(): Promise<unknown[]> {
  try {
    const response = await fetch(`${BASE_URL}/wp-json/wp/v2/faq_category`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Silent logging
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити категорії FAQ");
  }
}

// Отримання FAQ з фільтрацією за категорією
export async function fetchFilteredFAQ(
  categoryId?: string
): Promise<unknown[]> {
  try {
    const url = categoryId
      ? `${BASE_URL}/wp-json/wp/v2/faq?faq_category=${categoryId}`
      : `${BASE_URL}/wp-json/wp/v2/faq`;

    // Silent logging

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Silent logging
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити FAQ");
  }
}

// Отримання атрибутів товарів (колір, розмір, тощо)
export async function fetchProductAttributes(): Promise<
  WooCommerceAttribute[]
> {
  try {
    const response = await fetch("/api/wc/products/attributes");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити атрибути товарів");
  }
}

// Отримання термінів (опцій) атрибуту
export async function fetchAttributeTerms(
  attributeId: number
): Promise<WooCommerceAttributeTerm[]> {
  try {
    const response = await fetch(
      `/api/wc/products/attributes/${attributeId}/terms`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити опції атрибуту");
  }
}

export type WooCommerceAttribute = {
  id: number;
  name: string;
  slug: string;
  type: string;
  order_by: string;
  has_archives: boolean;
};

export type WooCommerceAttributeTerm = {
  id: number;
  name: string;
  slug: string;
  description: string;
  menu_order: number;
  count: number;
};

export type PasswordResetData = {
  email: string;
};

export type PasswordResetResponse = {
  success: boolean;
  message: string;
};

export async function requestPasswordReset(
  data: PasswordResetData
): Promise<PasswordResetResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}/wp-json/bdpwr/v1/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Silent logging
    return { success: true, message: "Код відновлення відправлено на email" };
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося відправити код відновлення");
  }
}

export type ValidateCodeData = {
  email: string;
  code: string;
};

export async function validateResetCode(
  data: ValidateCodeData
): Promise<PasswordResetResponse> {
  try {
    const response = await fetch(`${BASE_URL}/wp-json/bdpwr/v1/validate-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Silent logging
    return { success: true, message: "Код підтверджено" };
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося підтвердити код");
  }
}

export type SetPasswordData = {
  email: string;
  code: string;
  password: string;
};

export async function setNewPassword(
  data: SetPasswordData
): Promise<PasswordResetResponse> {
  try {
    const response = await fetch(`${BASE_URL}/wp-json/bdpwr/v1/set-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Silent logging
    return { success: true, message: "Пароль успішно змінено" };
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося встановити новий пароль");
  }
}

export type WooCommerceOrder = {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone?: string;
  };
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: string | null;
  date_paid: string | null;
  cart_hash: string;
  number: string;
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
  }>;
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: Array<{
      id: number;
      total: string;
      subtotal: string;
    }>;
    meta_data: Array<{
      id: number;
      key: string;
      value: string;
    }>;
    sku: string;
    price: number;
  }>;
  tax_lines: Array<{
    id: number;
    rate_code: string;
    rate_id: number;
    label: string;
    compound: boolean;
    tax_total: string;
    shipping_tax_total: string;
    meta_data: Array<{
      id: number;
      key: string;
      value: string;
    }>;
  }>;
  shipping_lines: Array<{
    id: number;
    method_title: string;
    method_id: string;
    total: string;
    total_tax: string;
    taxes: Array<{
      id: number;
      total: string;
      subtotal: string;
    }>;
    meta_data: Array<{
      id: number;
      key: string;
      value: string;
    }>;
  }>;
  fee_lines: Array<{
    id: number;
    name: string;
    tax_class: string;
    tax_status: string;
    total: string;
    total_tax: string;
    taxes: Array<{
      id: number;
      total: string;
      subtotal: string;
    }>;
    meta_data: Array<{
      id: number;
      key: string;
      value: string;
    }>;
  }>;
  coupon_lines: Array<{
    id: number;
    code: string;
    discount: string;
    discount_tax: string;
    meta_data: Array<{
      id: number;
      key: string;
      value: string;
    }>;
  }>;
  refunds: Array<{
    id: number;
    reason: string;
    total: string;
  }>;
  payment_url: string;
  is_editable: boolean;
  needs_payment: boolean;
  needs_processing: boolean;
  date_created_gmt: string;
  date_modified_gmt: string;
  date_completed_gmt: string | null;
  date_paid_gmt: string | null;
  currency_symbol: string;
};

export async function fetchUserOrders(
  userId: number
): Promise<WooCommerceOrder[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/wp-json/wc/v3/orders?customer=${userId}`,
      {
        headers: {
          Authorization: "Bearer " + "your-jwt-token", // JWT token
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Silent logging
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити історію замовлень");
  }
}

export type MediaUploadData = {
  file: File;
  fieldType:
    | "img_link_data_avatar"
    | "img_link_data_gallery_"
    | "img_link_data_certificate_"
    | "img_link_data_personal_gallery_";
  token: string;
};

export type MediaUploadResponse = {
  success: boolean;
  message: string;
  url?: string;
  id?: number;
};

export async function uploadMedia(
  data: MediaUploadData
): Promise<MediaUploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", data.file);
    // field_type та token не потрібні для стандартного WordPress media endpoint
    // але залишаємо для сумісності

    // На клієнті використовуємо публічний базовий URL
    const browserBaseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE as string;
    if (!browserBaseUrl) {
      throw new Error("NEXT_PUBLIC_UPSTREAM_BASE не встановлено");
    }

    const mediaUrl = `${browserBaseUrl}/wp-json/wp/v2/media`;

    if (process.env.NODE_ENV !== "production") {
      console.log("[uploadMedia] Завантаження файлу:", {
        url: mediaUrl,
        fileName: data.file.name,
        fileSize: data.file.size,
      });
    }

    const response = await fetch(mediaUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.token}`,
        // Не встановлюємо Content-Type, браузер сам встановить з multipart/form-data boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV !== "production") {
        console.error("[uploadMedia] Помилка завантаження:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: mediaUrl,
        });
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (process.env.NODE_ENV !== "production") {
      console.log("[uploadMedia] Файл завантажено:", {
        id: result.id,
        url: result.source_url,
      });
    }

    return {
      success: true,
      message: "Файл успішно завантажено",
      url: result.source_url,
      id: result.id,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[uploadMedia] Помилка:", error);
    }
    throw new Error("Не вдалося завантажити файл");
  }
}

// Custom media upload for coach fields (avatar/gallery/certificate)
export async function uploadCoachMedia(params: {
  token: string;
  fieldType:
    | "img_link_data_avatar"
    | "img_link_data_gallery_"
    | "img_link_data_certificate_"
    | "img_link_data_personal_gallery_";
  files: File[];
}): Promise<{
  success: boolean;
  field_type?: string;
  processed_count?: number;
  files?: Array<{ id: string | number; url: string; filename?: string }>;
  current_field_value?: string;
}> {
  const form = new FormData();
  form.append("token", params.token);
  form.append("field_type", params.fieldType);
  for (const f of params.files) form.append("files", f);

  // На клієнті використовуємо тільки публічний базовий URL
  const browserBaseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE as string;

  const res = await fetch(`${browserBaseUrl}/wp-json/custom/v1/upload-media`, {
    method: "POST",
    body: form,
  });
  
  let data: {
    success?: boolean;
    field_type?: string;
    processed_count?: number;
    files?: Array<{ id: string | number; url: string; filename?: string }>;
    current_field_value?: string;
    message?: string;
    error?: string;
  };
  
  try {
    data = await res.json();
  } catch {
    // Якщо не вдалося розпарсити JSON, спробуємо отримати текст
    const text = await res.text();
    throw new Error(text || `uploadCoachMedia failed with status ${res.status}`);
  }
  
  if (!res.ok) {
    // Пріоритет: error > message > загальне повідомлення
    const errorMessage = data?.error || data?.message || `uploadCoachMedia failed with status ${res.status}`;
    throw new Error(errorMessage);
  }
  return data as {
    success: boolean;
    field_type?: string;
    processed_count?: number;
    files?: Array<{ id: string | number; url: string; filename?: string }>;
    current_field_value?: string;
  };
}

export type ProductFilters = {
  category?: string | string[];
  attribute?: string | string[];
  attribute_term?: string | string[];
  min_price?: number;
  max_price?: number;
  on_sale?: boolean;
  featured?: boolean;
  status?: string;
  search?: string;
  orderby?: "date" | "price" | "popularity" | "rating" | "title";
  order?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

// Функція для отримання категорій товару з WordPress API
export async function fetchProductCategoriesFromWp(
  productId: number
): Promise<Array<{ id: number; name: string; slug: string }>> {
  try {
    const response = await fetch(`/api/wp/products/${productId}`);
    if (!response.ok) return [];
    const product = await response.json();
    return product.categories || [];
  } catch (error) {
    // Silent error handling
    return [];
  }
}

export async function fetchFilteredProducts(
  filters: ProductFilters = {}
): Promise<unknown[]> {
  try {
    const params = new URLSearchParams();

    // Додаємо параметри фільтрації
    if (filters.category) {
      if (Array.isArray(filters.category)) {
        filters.category.forEach((cat) => params.append("category", cat));
      } else {
        params.append("category", filters.category);
      }
    }
    if (filters.attribute) {
      if (Array.isArray(filters.attribute)) {
        filters.attribute.forEach((attr) => params.append("attribute", attr));
      } else {
        params.append("attribute", filters.attribute);
      }
    }
    if (filters.attribute_term) {
      if (Array.isArray(filters.attribute_term)) {
        filters.attribute_term.forEach((term) =>
          params.append("attribute_term", term)
        );
      } else {
        params.append("attribute_term", filters.attribute_term);
      }
    }
    if (filters.min_price)
      params.append("min_price", filters.min_price.toString());
    if (filters.max_price)
      params.append("max_price", filters.max_price.toString());
    if (filters.on_sale !== undefined)
      params.append("on_sale", filters.on_sale.toString());
    if (filters.featured !== undefined)
      params.append("featured", filters.featured.toString());
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.orderby) params.append("orderby", filters.orderby);
    if (filters.order) params.append("order", filters.order);
    if (filters.per_page)
      params.append("per_page", filters.per_page.toString());
    if (filters.page) params.append("page", filters.page.toString());

    const queryString = params.toString();

    // Використовуємо WooCommerce v3 API для всіх запитів
    const url = `/api/wc/v3/products${queryString ? `?${queryString}` : ""}`;

    const extraHeaders: Record<string, string> = {};
    // Forward JWT to proxy if available
    try {
      if (typeof window !== "undefined") {
        const jwt = localStorage.getItem("wp_jwt");
        if (jwt) {
          extraHeaders["x-wp-jwt"] = jwt; // for our proxy convenience
          extraHeaders["Authorization"] = `Bearer ${jwt}`; // proxy prioritizes Authorization
        }
      }
    } catch {}

    const response = await fetch(url, { headers: extraHeaders });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Додаємо mapProductToUi для отримання dateCreated
    const { mapProductToUi } = await import("./products");
    return data.map(mapProductToUi);
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити відфільтровані товари");
  }
}

// Trainer profile update
export interface TrainerProfileUpdatePayload {
  id?: string | number;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  acf?: Record<string, unknown>;
}

// Функція для очищення control characters з об'єкта перед серіалізацією
function cleanControlCharacters(obj: unknown): unknown {
  if (typeof obj === "string") {
    // Видаляємо некоректні control characters, залишаємо тільки стандартні (\n, \r, \t)
    return obj.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanControlCharacters);
  }
  if (obj && typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanControlCharacters(value);
    }
    return cleaned;
  }
  return obj;
}

export async function updateTrainerProfile(
  payload: TrainerProfileUpdatePayload,
  bearerToken?: string
) {
  // Очищаємо дані від некоректних control characters перед серіалізацією
  const cleanedPayload = cleanControlCharacters(
    payload
  ) as TrainerProfileUpdatePayload;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
  const res = await fetch("/api/profile/trainer", {
    method: "PATCH",
    headers,
    body: JSON.stringify(cleanedPayload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update trainer profile");
  }
  return res.json();
}

// WooCommerce product reviews
export interface WcReview {
  id: number;
  product_id: number | string;
  review: string;
  reviewer_name?: string;
  reviewer?: string;
  date_created?: string;
  date_created_gmt?: string;
  rating?: number;
}

export async function fetchWcReviews(params?: Record<string, string | number>) {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()
    : "";
  const res = await fetch(`/api/wc/reviews${qs}`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function createWcReview(body: {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
}) {
  const res = await fetch(`/api/wc/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create review");
  return res.json();
}

// WooCommerce products and categories (proxying our API routes)
export async function fetchWcProducts(
  params?: Record<string, string | number>
) {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()
    : "";
  const res = await fetch(`/api/wc/products${qs}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchWcCategories(
  params?: Record<string, string | number>
) {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString()
    : "";
  const res = await fetch(`/api/wc/products/categories${qs}`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

// FAQ Functions with logging
export async function fetchFAQCategoriesWithLogging(): Promise<FaqCategory[]> {
  try {
    const data = await fetchFaqCategories();
    return data;
  } catch (error) {
    throw new Error("Не вдалося завантажити категорії FAQ");
  }
}

export async function fetchFAQByCategoryWithLogging(
  categoryId?: number
): Promise<FaqItem[]> {
  try {
    const data = await fetchFaqByCategory(categoryId);
    return data;
  } catch (error) {
    throw new Error("Не вдалося завантажити FAQ");
  }
}

// Trainer Types
export interface Trainer {
  id: number;
  name: string;
  slug: string;
  description?: string;
  avatar_urls?: {
    "24": string;
    "48": string;
    "96": string;
  };
  acf?: {
    full_name?: string;
    bio?: string;
    avatar?: {
      url: string;
      alt: string;
    };
    location_city?: string;
    location_country?: string;
    experience?: string;
    position?: string;
    social_instagram?: string;
    social_telegram?: string;
    social_phone?: string;
    certificate?: string;
    clients_count?: string;
    my_wlocation?: Array<{
      city: string;
      country: string;
    }>;
  };
}

export interface TrainerFilters {
  countries?: string[];
  cities?: string[];
  roles?: string[];
  categories?: number[];
}

// Trainer Functions
export async function fetchTrainersWithLogging(
  filters: TrainerFilters = {}
): Promise<Trainer[]> {
  try {
    const params = new URLSearchParams();

    // Додаємо фільтри до параметрів
    if (filters.countries && filters.countries.length > 0) {
      filters.countries.forEach((country) => {
        params.append("countries[]", country);
      });
    }

    if (filters.cities && filters.cities.length > 0) {
      filters.cities.forEach((city) => {
        params.append("cities[]", city);
      });
    }

    if (filters.roles && filters.roles.length > 0) {
      filters.roles.forEach((role) => {
        params.append("roles[]", role);
      });
    }

    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((category) => {
        params.append("categories[]", category.toString());
      });
    }

    const queryString = params.toString();
    // За замовчуванням додаємо роль тренера
    const roleSuffix = queryString ? `&roles=bfb_coach` : `?roles=bfb_coach`;
    const url = `/api/trainers${
      queryString ? `?${queryString}` : ""
    }${roleSuffix}`;

    const data = await safeFetch<Trainer[]>(url);

    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити тренерів");
  }
}

// (duplicated CasePost removed)

// WooCommerce Orders API
export const createWcOrder = async (orderData: {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    address_1?: string;
    city: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1?: string;
    city: string;
    country: string;
  };
  line_items: Array<{
    product_id: number;
    quantity: number;
  }>;
  shipping_lines?: Array<{
    method_id: string;
    method_title: string;
    total: string;
  }>;
  customer_note?: string;
}): Promise<unknown> => {
  try {
    const response = await api.post("/api/wc/orders", orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchWcPaymentGateways = async (): Promise<unknown[]> => {
  try {
    const response = await api.get("/api/wc/payment-gateways");
    return response.data;
  } catch (error) {
    throw error;
  }
};
