import { useQuery } from "@tanstack/react-query";
import React from "react";

interface CourseFilters {
  category?: string | string[];
  search?: string;
  min_price?: number;
  max_price?: number;
  on_sale?: boolean;
  featured?: boolean;
  orderby?: "date" | "price" | "popularity" | "rating" | "title";
  order?: "asc" | "desc";
  per_page?: number;
}

// Інтерфейси для типів даних WooCommerce API
interface WcCourseProgramItem {
  hl_input_text_title?: string;
  hl_input_text_lesson_count?: string;
  hl_textarea_description?: string;
  hl_textarea_themes?: string;
}

interface WcCourseProgramNestedItem {
  title?: string;
  count_lessons?: string;
  description?: string;
  themes?: Array<{ theme: string }>;
}

interface CourseCoachData {
  ID?: number | string;
  post_title?: string;
  title?: string;
  [key: string]: unknown;
}

// Функція для парсингу JSON рядків з meta_data
const parseMetaJson = <T>(jsonString: string | undefined, fallback: T): T => {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
};

// Функція для маппінгу курсу з WooCommerce API
const mapWcCourseToCourse = (wcCourse: Record<string, unknown>) => {
  const acf = (wcCourse.acf as Record<string, unknown>) || {};
  const metaData =
    (wcCourse.meta_data as Array<{ key: string; value: string }>) || [];

  const getMetaValue = (key: string): string | undefined => {
    return metaData.find((meta) => meta.key === key)?.value;
  };

  // Функція для отримання значення з ACF з fallback на meta_data
  const getAcfValue = (key: string) => {
    return acf[key] || getMetaValue(key);
  };

  // Функція для витягування масиву рядків з ACF (з fallback на meta_data)
  const extractStringArray = (acfData: unknown): string[] => {
    if (Array.isArray(acfData)) {
      // Якщо це ACF дані - витягуємо поле point з кожного об'єкта
      return acfData
        .map(
          (item: Record<string, unknown>) => item?.point || item?.theme || item
        )
        .filter(Boolean) as string[];
    }
    // Fallback на meta_data парсинг
    return parseMetaJson<string[]>(acfData as string, []);
  };

  // Парсимо course_data з ACF (з fallback на meta_data)
  const courseThemes = extractStringArray(getAcfValue("cource_themes"));
  const whatLearn = extractStringArray(
    getAcfValue("point_data_course_what_learn")
  );
  const courseInclude = extractStringArray(
    getAcfValue("point_data_course_include")
  );
  // Спробуємо отримати дані з point_data_course_themes
  let courseProgram: Array<{
    hl_input_text_title?: string;
    hl_input_text_lesson_count?: string;
    hl_textarea_description?: string;
    hl_textarea_themes?: string;
  }> = [];

  const courseProgramRaw = getAcfValue("point_data_course_themes");

  if (Array.isArray(courseProgramRaw) && courseProgramRaw.length > 0) {
    // Якщо це прямий масив модулів
    if (
      courseProgramRaw[0] &&
      typeof courseProgramRaw[0] === "object" &&
      courseProgramRaw[0].hl_input_text_title
    ) {
      courseProgram = courseProgramRaw.map((item: WcCourseProgramItem) => ({
        hl_input_text_title: item.hl_input_text_title,
        hl_input_text_lesson_count: item.hl_input_text_lesson_count,
        hl_textarea_description: item.hl_textarea_description,
        hl_textarea_themes: item.hl_textarea_themes,
      }));
    }
    // Якщо це вкладена структура з hl_data_course_program
    else if (
      courseProgramRaw[0] &&
      courseProgramRaw[0].hl_data_course_program &&
      Array.isArray(courseProgramRaw[0].hl_data_course_program)
    ) {
      console.log(
        "📚 Used hl_data_course_program format for course",
        wcCourse.id,
        { courseProgram }
      );
      courseProgram = courseProgramRaw[0].hl_data_course_program.map(
        (item: WcCourseProgramNestedItem) => ({
          hl_input_text_title: item.title,
          hl_input_text_lesson_count: item.count_lessons,
          hl_textarea_description: item.description,
          hl_textarea_themes:
            item.themes?.map((t: { theme: string }) => t.theme).join("|||") ||
            "",
        })
      );
    }
  }

  // Якщо не знайшли дані, спробуємо fallback
  if (courseProgram.length === 0) {
    courseProgram = parseMetaJson(courseProgramRaw as string, []);
  }

  const dateStart = (getAcfValue("input_date_date_start") as string) || null;
  const duration = (getAcfValue("input_text_duration") as string) || null;
  const blocks = (getAcfValue("input_text_blocks") as string) || null;
  const onlineLessons =
    (getAcfValue("input_text_online_lessons") as string) || null;

  const courseCoachData = getAcfValue("course_coach") as CourseCoachData | null;
  const courseCoachId =
    typeof courseCoachData === "object" && courseCoachData?.ID
      ? String(courseCoachData.ID)
      : typeof courseCoachData === "string"
      ? courseCoachData
      : null;
  const requiredEquipment =
    (getAcfValue("required_equipment") as string) ||
    (getAcfValue("input_required_equipment") as string) ||
    "";

  // Отримуємо рейтинг та кількість відгуків з API
  const averageRating = parseFloat((wcCourse.average_rating as string) || "0");
  const ratingCount = (wcCourse.rating_count as number) || 0;

  // Витягуємо категорії з WooCommerce API
  const wcCategories =
    (wcCourse.categories as Array<{
      id: number;
      name: string;
      slug: string;
    }>) || [];

  const courseName = String(wcCourse.name || "Курс");

  // Генеруємо slug з назви курсу
  const generateSlugFromName = (name: string, id: string | number): string => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-zа-яіїєґ0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return slug || `course-${Number(id)}`;
  };

  // Забезпечуємо що slug завжди існує, генеруємо з назви якщо потрібно
  const ensureSlug = (
    slug: string | undefined,
    name: string,
    id: string | number
  ): string => {
    if (!slug || slug.trim() === "") {
      return generateSlugFromName(name, id);
    }

    let processedSlug = slug;
    if (processedSlug.includes("%")) {
      try {
        processedSlug = decodeURIComponent(processedSlug);
      } catch {
        processedSlug = slug;
      }
    }

    const cleanedSlug = processedSlug
      .replace(/____full____/g, "")
      .replace(/-+$/, "");

    if (cleanedSlug && cleanedSlug.trim() !== "") {
      return cleanedSlug;
    }

    return generateSlugFromName(name, id);
  };

  // Забезпечуємо наявність ID (як fallback генеруємо випадковий)
  let courseId = wcCourse.id;
  if (!courseId) {
    courseId = Math.floor(Math.random() * 1000000); // Fallback ID
  }

  const courseIdStr = String(courseId);

  const cleanSlug = ensureSlug(
    wcCourse.slug as string,
    courseName,
    courseIdStr
  );

  const courseData = {
    Course_themes: courseThemes,
    What_learn: whatLearn,
    Course_include: courseInclude,
    Course_program: courseProgram,
    Date_start: dateStart,
    Duration: duration,
    Course_coach:
      typeof courseCoachData === "object" && courseCoachData?.ID
        ? {
            ...courseCoachData,
            title:
              (courseCoachData as CourseCoachData).post_title ||
              (courseCoachData as CourseCoachData).title ||
              "",
          }
        : courseCoachId
        ? { ID: parseInt(courseCoachId), title: "" }
        : null,
    Required_equipment: requiredEquipment || null,
    Blocks: blocks,
    Online_lessons: onlineLessons,
  };

  const resultCourse = {
    id: courseIdStr,
    slug: cleanSlug,
    name: courseName,
    description: (wcCourse.description as string) || "",
    price:
      (wcCourse.sale_price as string) ||
      (wcCourse.regular_price as string) ||
      "",
    originalPrice: (wcCourse.regular_price as string) || "",
    image:
      ((
        (wcCourse.images as Record<string, unknown>[])?.[0] as Record<
          string,
          unknown
        >
      )?.src as string) || "/placeholder.svg",
    categories: wcCategories,
    course_data: courseData,
    dateCreated: (wcCourse.date_created as string) || "",
    rating: Math.round(averageRating),
    reviewsCount: ratingCount,
    requirements: requiredEquipment,
    wcProduct: {
      prices: {
        // Якщо немає ціни (порожні рядки для курсів 173, 172) - ставимо "0"
        price: (() => {
          const salePrice = (wcCourse.sale_price as string)?.trim();
          const regularPrice = (wcCourse.regular_price as string)?.trim();
          if (salePrice && salePrice !== "") return salePrice;
          if (regularPrice && regularPrice !== "") return regularPrice;
          return "0"; // Якщо обидві порожні (курси 173, 172)
        })(),
        regular_price: (() => {
          const regularPrice = (wcCourse.regular_price as string)?.trim();
          return regularPrice && regularPrice !== "" ? regularPrice : "0";
        })(),
        sale_price: (() => {
          const salePrice = (wcCourse.sale_price as string)?.trim();
          return salePrice && salePrice !== "" ? salePrice : "0";
        })(),
      },
      on_sale: (wcCourse.on_sale as boolean) || false,
      total_sales: (wcCourse.total_sales as number) || 0,
      average_rating: (wcCourse.average_rating as string) || "0",
      rating_count: ratingCount,
      featured: (wcCourse.featured as boolean) || false,
    },
  };

  return resultCourse;
};

// Функція для отримання курсів з WooCommerce API
export const fetchCourses = async (filters: CourseFilters = {}) => {
  try {
    // Формуємо параметри запиту
    const params = new URLSearchParams();

    // Завжди включаємо базову категорію курсів (72)
    params.append("category", "72");

    // Якщо є конкретні категорії з фільтрів, додаємо їх як додаткові фільтри
    // WooCommerce API підтримує кілька параметрів category для фільтрації по кількох категоріях
    if (filters.category) {
      if (Array.isArray(filters.category)) {
        filters.category.forEach((cat) => {
          // Не додаємо 72 знову, якщо вона вже є в списку
          if (cat !== "72") {
            params.append("category", cat);
          }
        });
      } else {
        // Не додаємо 72 знову, якщо вона вже є
        if (filters.category !== "72") {
          params.append("category", filters.category);
        }
      }
    }

    if (filters.per_page) {
      params.append("per_page", filters.per_page.toString());
    } else {
      params.append("per_page", "100");
    }

    if (filters.orderby) {
      params.append("orderby", filters.orderby);
    }

    if (filters.order) {
      params.append("order", filters.order);
    }

    if (filters.on_sale !== undefined) {
      params.append("on_sale", filters.on_sale.toString());
    }

    if (filters.featured !== undefined) {
      params.append("featured", filters.featured.toString());
    }

    if (filters.min_price) {
      params.append("min_price", filters.min_price.toString());
    }

    if (filters.max_price) {
      params.append("max_price", filters.max_price.toString());
    }

    if (filters.search) {
      params.append("search", filters.search);
    }

    // Отримуємо курси з WooCommerce API - фільтруємо тільки курси (категорія 72)
    const apiUrl = `/api/wc/v3/products?${params.toString()}`;

    const wcResponse = await fetch(apiUrl);

    if (!wcResponse.ok) {
      throw new Error(
        `Failed to fetch courses from WooCommerce: ${wcResponse.status}`
      );
    }
    const wcCourses = await wcResponse.json();

    const mappedCourses = wcCourses.map(mapWcCourseToCourse);

    return mappedCourses;
  } catch (error) {
    throw error;
  }
};

export const coursesQuery = (filters: CourseFilters = {}) => ({
  queryKey: ["courses", "v4", filters] as const,
  queryFn: () => fetchCourses(filters),
  staleTime: 5 * 60 * 1000, // 5 хвилин
  cacheTime: 10 * 60 * 1000, // 10 хвилин
  retry: 1,
});

export const useCoursesQuery = (filters: CourseFilters = {}) => {
  return useQuery(coursesQuery(filters));
};

// Функція для отримання конкретного курсу за ID або slug
export const fetchCourse = async (courseIdOrSlug: string | number) => {
  try {
    // Отримуємо всі курси та шукаємо за slug або ID (як у продуктів)
    const allCourses = await fetchCourses({ per_page: 100 });

    // Нормалізуємо slug: декодуємо URL-encoded значення та очищаємо від ____full____
    const normalizeSlug = (slug: string): string => {
      if (!slug) return "";
      try {
        // Спробуємо декодувати, якщо це encoded
        let decoded = slug;
        try {
          decoded = decodeURIComponent(slug);
        } catch {
          // Якщо не вдалося декодувати, використовуємо оригінал
          decoded = slug;
        }

        // Очищаємо від ____full____ та зайвих дефісів
        decoded = decoded.replace(/____full____/g, "").replace(/-+$/, "");

        // Нормалізуємо: приводимо до нижнього регістру та прибираємо зайві пробіли
        return decoded.toLowerCase().trim();
      } catch {
        // Якщо виникла помилка, повертаємо як є
        return slug.toLowerCase().trim();
      }
    };

    // Next.js автоматично декодує slug з URL, тому courseIdOrSlug приходить декодованим
    const normalizedSlug = normalizeSlug(String(courseIdOrSlug));

    const course = allCourses.find(
      (c: ReturnType<typeof mapWcCourseToCourse>) => {
        // Спочатку перевіряємо ID
        const idMatch = c.id.toString() === String(courseIdOrSlug);
        if (idMatch) {
          return true;
        }

        // Якщо немає slug, пропускаємо
        if (!c.slug) {
          return false;
        }

        // Порівнюємо slug (case-insensitive, з нормалізацією)
        const normalizedCourseSlug = normalizeSlug(c.slug);
        const matchesSlug =
          normalizedCourseSlug === normalizedSlug ||
          c.slug.toLowerCase() === String(courseIdOrSlug).toLowerCase();

        if (matchesSlug) {
          return true;
        }

        return false;
      }
    );

    if (!course) {
      throw new Error(`Course not found: ${courseIdOrSlug}`);
    }

    return course;
  } catch (error) {
    throw error;
  }
};

export const courseQuery = (courseIdOrSlug: string | number) => ({
  queryKey: ["course", courseIdOrSlug, "v2"] as const, // Додаємо версію для очищення кешу
  queryFn: () => fetchCourse(courseIdOrSlug),
  staleTime: 0, // Вимикаємо кешування
  gcTime: 0, // Вимикаємо кешування
  retry: 1,
  enabled:
    !!courseIdOrSlug &&
    String(courseIdOrSlug).trim() !== "" &&
    courseIdOrSlug !== "skip", // Не виконуємо запит, якщо slug порожній
});

export const useCourseQuery = (courseIdOrSlug: string | number) => {
  return useQuery(courseQuery(courseIdOrSlug));
};
