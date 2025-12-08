import { useQuery } from "@tanstack/react-query";

interface CourseFilters {
  category?: string | string[];
  search?: string;
  min_price?: number;
  max_price?: number;
  on_sale?: boolean;
  featured?: boolean;
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

// Функція для отримання курсів з WooCommerce API
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchCourses = async (filters: CourseFilters = {}) => {
  // filters поки що не використовується, але може бути додано в майбутньому
  try {
    // Отримуємо курси з WooCommerce API - фільтруємо тільки курси (категорія 72)
    const wcResponse = await fetch(
      "/api/wc/v3/products?category=72&per_page=100"
    );
    if (!wcResponse.ok) {
      throw new Error("Failed to fetch courses from WooCommerce");
    }
    const wcCourses = await wcResponse.json();

    // Показуємо всі курси з WooCommerce (без залежності від WordPress)
    const coursesWithData = wcCourses;

    // Мапимо курси з WooCommerce API
    const mappedCourses = coursesWithData.map(
      (wcCourse: Record<string, unknown>) => {
        // Витягуємо дані з meta_data
        const metaData = (wcCourse.meta_data as Array<{ key: string; value: string }>) || [];
        
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
        const courseProgram = parseMetaJson<Array<{
          hl_input_text_title?: string;
          hl_input_text_lesson_count?: string;
          hl_textarea_description?: string;
          hl_textarea_themes?: string;
        }>>(
          getMetaValue("hl_data_course_program"),
          []
        );

        const dateStart = getMetaValue("input_date_date_start") || null;
        const duration = getMetaValue("input_text_duration") || null;
        const courseCoachId = getMetaValue("course_coach");
        const requiredEquipment = getMetaValue("required_equipment") || 
          getMetaValue("input_required_equipment") || "";

        // Отримуємо рейтинг та кількість відгуків з API
        const averageRating = parseFloat((wcCourse.average_rating as string) || "0");
        const ratingCount = (wcCourse.rating_count as number) || 0;

        return {
          id: (wcCourse.id as string).toString(),
          name: (wcCourse.name as string) || "Курс",
          description: (wcCourse.description as string) || "",
          // Використовуємо ціни з WooCommerce API (в копійках)
          price:
            (wcCourse.sale_price as string) ||
            (wcCourse.regular_price as string) ||
            "5000",
          originalPrice: (wcCourse.regular_price as string) || "7000",
          // Використовуємо зображення з WooCommerce API
          image:
            ((
              (wcCourse.images as Record<string, unknown>[])?.[0] as Record<
                string,
                unknown
              >
            )?.src as string) || "/placeholder.svg",
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
          rating: Math.round(averageRating), // Динамічний рейтинг з API
          reviewsCount: ratingCount, // Динамічна кількість відгуків з API
          requirements: requiredEquipment, // Динамічне required_equipment з meta_data
          // Додаємо WooCommerce дані для динамічної логіки
          wcProduct: {
            prices: {
              price:
                (wcCourse.sale_price as string) ||
                (wcCourse.regular_price as string),
              regular_price: wcCourse.regular_price as string,
              sale_price: wcCourse.sale_price as string,
            },
            on_sale: (wcCourse.on_sale as boolean) || false,
            total_sales: (wcCourse.total_sales as number) || 0,
            average_rating: (wcCourse.average_rating as string) || "0",
            rating_count: ratingCount,
            featured: (wcCourse.featured as boolean) || false,
          },
        };
      }
    );

    return mappedCourses;
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

// Функція для отримання конкретного курсу
export const fetchCourse = async (courseId: number) => {
  try {
    // Отримуємо курс з WooCommerce API
    const wcResponse = await fetch(`/api/wc/v3/products/${courseId}`);
    if (!wcResponse.ok) {
      throw new Error("Failed to fetch course from WooCommerce");
    }
    const wcCourse = await wcResponse.json();

    // Витягуємо дані з meta_data
    const metaData = wcCourse.meta_data || [];
    
    const getMetaValue = (key: string): string | undefined => {
      return metaData.find((meta: { key: string; value: string }) => meta.key === key)?.value;
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
    const courseProgram = parseMetaJson<Array<{
      hl_input_text_title?: string;
      hl_input_text_lesson_count?: string;
      hl_textarea_description?: string;
      hl_textarea_themes?: string;
    }>>(
      getMetaValue("hl_data_course_program"),
      []
    );

    const dateStart = getMetaValue("input_date_date_start") || null;
    const duration = getMetaValue("input_text_duration") || null;
    const courseCoachId = getMetaValue("course_coach");
    const requiredEquipment = getMetaValue("required_equipment") || 
      getMetaValue("input_required_equipment") || "";

    // Отримуємо рейтинг та кількість відгуків з API
    const averageRating = parseFloat(wcCourse.average_rating || "0");
    const ratingCount = wcCourse.rating_count || 0;

    // Мапимо курс з WooCommerce API
    const mappedCourse = {
      id: wcCourse.id.toString(),
      name: wcCourse.name || "Курс",
      description: wcCourse.description || "",
      // Використовуємо ціни з WooCommerce API (в копійках)
      price: wcCourse.sale_price || wcCourse.regular_price || "5000",
      originalPrice: wcCourse.regular_price || "7000",
      // Використовуємо зображення з WooCommerce API
      image: wcCourse.images?.[0]?.src || "/placeholder.svg",
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
      dateCreated: wcCourse.date_created || "",
      rating: Math.round(averageRating), // Динамічний рейтинг з API
      reviewsCount: ratingCount, // Динамічна кількість відгуків з API
      requirements: requiredEquipment, // Динамічне required_equipment з meta_data
      // Додаємо WooCommerce дані для динамічної логіки
      wcProduct: {
        prices: {
          price: wcCourse.sale_price || wcCourse.regular_price,
          regular_price: wcCourse.regular_price,
          sale_price: wcCourse.sale_price,
        },
        on_sale: wcCourse.on_sale || false,
        total_sales: wcCourse.total_sales || 0,
        average_rating: wcCourse.average_rating || "0",
        rating_count: ratingCount,
        featured: wcCourse.featured || false,
      },
    };

    return mappedCourse;
  } catch (error) {
    throw error;
  }
};

export const courseQuery = (courseId: number) => ({
  queryKey: ["course", courseId] as const,
  queryFn: () => fetchCourse(courseId),
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const useCourseQuery = (courseId: number) => {
  return useQuery(courseQuery(courseId));
};
