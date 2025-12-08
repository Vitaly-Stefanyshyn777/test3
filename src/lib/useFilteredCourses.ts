import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "./coursesQueries";

interface Course {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  image?: string;
  dateCreated?: string;
  rating?: number;
  reviewsCount?: number;
  categories?: Array<{ id: number; name: string; slug: string }>;
  wcProduct?: {
    prices?: {
      price?: string;
      regular_price?: string;
      sale_price?: string;
    };
    on_sale?: boolean;
    total_sales?: number;
    average_rating?: string;
    featured?: boolean;
  };
  courseData?: unknown;
}

export interface CourseFilters {
  category?: string | string[];
  min_price?: number;
  max_price?: number;
  on_sale?: boolean;
  featured?: boolean;
  search?: string;
  orderby?: "date" | "price" | "popularity" | "rating" | "title";
  order?: "asc" | "desc";
  per_page?: number;
}

export function useFilteredCourses(filters: CourseFilters = {}) {
  const stableKey = JSON.stringify(filters);
  const queryKey = ["filteredCourses", stableKey];

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Якщо є конкретні категорії для фільтрації, отримуємо всі курси з базової категорії
        // і фільтруємо на клієнті, бо WooCommerce API з кількома category працює як OR, а не AND
        // Видаляємо category з фільтрів для API, щоб отримати всі курси з категорії 72
        const { category, ...filtersForApi } = filters;

        const courses = (await fetchCourses(filtersForApi)) as Course[];

        // Застосовуємо фільтри на клієнті
        let filteredCourses: Course[] = courses;

        // Фільтруємо по категоріях на клієнті (якщо є вибрані категорії)
        // Проста OR логіка: курс має мати хоча б одну з вибраних категорій
        if (filters.category) {
          const categoryIds = Array.isArray(filters.category)
            ? filters.category.map((c) => Number(c))
            : [Number(filters.category)];

          filteredCourses = filteredCourses.filter((course: Course) => {
            if (!course.categories || course.categories.length === 0) {
              return false;
            }

            const courseCategoryIds = course.categories.map((cat) => cat.id);

            // Курс має мати хоча б одну з вибраних категорій
            return courseCategoryIds.some((catId) =>
              categoryIds.includes(catId)
            );
          });
        }

        if (
          filters.min_price !== undefined &&
          filters.max_price !== undefined
        ) {
          filteredCourses = filteredCourses.filter(
            (course: { price: string }) => {
              const price = parseFloat(course.price);
              return (
                price >= (filters.min_price as number) &&
                price <= (filters.max_price as number)
              );
            }
          );
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredCourses = filteredCourses.filter(
            (course: Course) =>
              course.name.toLowerCase().includes(searchTerm) ||
              course.description.toLowerCase().includes(searchTerm)
          );
        }

        if (filters.on_sale !== undefined) {
          filteredCourses = filteredCourses.filter((course: Course) => {
            return course.wcProduct?.on_sale === filters.on_sale;
          });
        }

        if (filters.featured !== undefined) {
          filteredCourses = filteredCourses.filter((course: Course) => {
            return course.wcProduct?.featured === filters.featured;
          });
        }

        return filteredCourses;
      } catch (error) {
        throw error;
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
