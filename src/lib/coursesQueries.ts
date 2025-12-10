import { useQuery } from "@tanstack/react-query";

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
  const metaData =
    (wcCourse.meta_data as Array<{ key: string; value: string }>) || [];

  const getMetaValue = (key: string): string | undefined => {
    return metaData.find((meta) => meta.key === key)?.value;
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

  // Очищаємо slug від ____full____
  const cleanSlug = ((wcCourse.slug as string) || "").replace(/____full____/g, '');
  
  return {
    id: (wcCourse.id as string).toString(),
    slug: cleanSlug,
    name: (wcCourse.name as string) || "Курс",
    description: (wcCourse.description as string) || "",
    price:
      (wcCourse.sale_price as string) ||
      (wcCourse.regular_price as string) ||
      "5000",
    originalPrice: (wcCourse.regular_price as string) || "7000",
    image:
      ((
        (wcCourse.images as Record<string, unknown>[])?.[0] as Record<
          string,
          unknown
        >
      )?.src as string) || "/placeholder.svg",
    categories: wcCategories,
    courseData: {
      Course_themes: courseThemes,
      What_learn: whatLearn,
      Course_include: courseInclude,
      Course_program: courseProgram,
      Date_start: dateStart,
      Duration: duration,
      Course_coach: courseCoachId ? { ID: parseInt(courseCoachId) } : null,
      Required_equipment: requiredEquipment || null,
      Blocks: null,
      Online_lessons: null,
    },
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
    const wcResponse = await fetch(`/api/wc/v3/products?${params.toString()}`);
    if (!wcResponse.ok) {
      throw new Error("Failed to fetch courses from WooCommerce");
    }
    const wcCourses = await wcResponse.json();
    return wcCourses.map(mapWcCourseToCourse);
  } catch (error) {
    throw error;
  }
};

export const coursesQuery = (filters: CourseFilters = {}) => ({
  queryKey: ["courses", filters] as const,
  queryFn: () => fetchCourses(filters),
  staleTime: 5 * 60 * 1000,
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
    
    const course = allCourses.find((c: ReturnType<typeof mapWcCourseToCourse>) => {
      // Якщо немає slug, перевіряємо тільки по ID
      if (!c.slug) {
        return c.id.toString() === String(courseIdOrSlug);
      }
      
      // Нормалізуємо slug з API
      const normalizedCourseSlug = normalizeSlug(c.slug);
      
      // Порівнюємо нормалізовані значення (case-insensitive)
      const slugMatch = 
        c.slug === String(courseIdOrSlug) || // Exact match (якщо обидва однаково)
        normalizedCourseSlug === normalizedSlug || // Нормалізовані значення
        c.slug.toLowerCase() === String(courseIdOrSlug).toLowerCase() || // Case-insensitive exact
        normalizedCourseSlug === String(courseIdOrSlug).toLowerCase(); // Нормалізований API slug === URL slug (lowercase)
      
      // Також перевіряємо ID як fallback
      const idMatch = c.id.toString() === String(courseIdOrSlug);
      
      return slugMatch || idMatch;
    });
    
    if (!course) {
      // Не логуємо помилку, якщо slug порожній (це очікувана поведінка)
      if (courseIdOrSlug && String(courseIdOrSlug).trim() !== "" && courseIdOrSlug !== "skip") {
        console.error("[courseQuery] Course not found:", {
          courseIdOrSlug,
          normalizedSlug,
          availableSlugs: allCourses.slice(0, 5).map((c: ReturnType<typeof mapWcCourseToCourse>) => ({ id: c.id, slug: c.slug })),
        });
      }
      throw new Error(`Course not found: ${courseIdOrSlug}`);
    }
    
    return course;
  } catch (error) {
    throw error;
  }
};

export const courseQuery = (courseIdOrSlug: string | number) => ({
  queryKey: ["course", courseIdOrSlug] as const,
  queryFn: () => fetchCourse(courseIdOrSlug),
  staleTime: 5 * 60 * 1000,
  retry: 1,
  enabled: !!courseIdOrSlug && String(courseIdOrSlug).trim() !== "" && courseIdOrSlug !== "skip", // Не виконуємо запит, якщо slug порожній
});

export const useCourseQuery = (courseIdOrSlug: string | number) => {
  return useQuery(courseQuery(courseIdOrSlug));
};
