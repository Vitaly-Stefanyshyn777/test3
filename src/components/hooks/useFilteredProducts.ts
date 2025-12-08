import { useQuery } from "@tanstack/react-query";
import { fetchFilteredProducts } from "../../lib/bfbApi";

export interface ProductFilters {
  category?: string | string[];
  attribute?: string | string[];
  attribute_term?: string | string[];
  min_price?: number;
  max_price?: number;
  on_sale?: boolean;
  featured?: boolean;
  search?: string;
}

export function useFilteredProducts(filters: ProductFilters = {}) {
  const stableKey = JSON.stringify(filters);
  const queryKey = ["filteredProducts", stableKey];

  // debug logs removed

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const products = (await fetchFilteredProducts(filters)) as Array<{
          name?: string;
          dateCreated?: string;
          categories?: Array<{ name: string }>;
        }>;

        // логування вимкнено
        const newProducts = products.filter((p) => {
          if (!p.dateCreated) return false;
          const createdDate = new Date(p.dateCreated);
          const today = new Date();

          // Нормалізуємо дати до початку дня для правильної різниці
          const createdDateNormalized = new Date(
            createdDate.getFullYear(),
            createdDate.getMonth(),
            createdDate.getDate()
          );
          const todayNormalized = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          const daysDiff = Math.floor(
            (todayNormalized.getTime() - createdDateNormalized.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          return daysDiff <= 30;
        });

        // debug logs removed

        return products;
      } catch (error) {
        throw error;
      }
    },
    enabled: true, // Завжди активний, щоб показувати всі продукти коли фільтри порожні
    staleTime: 5 * 60 * 1000, // 5 хвилин
    gcTime: 10 * 60 * 1000, // 10 хвилин
  });
}

// Спеціалізовані хуки для різних типів фільтрації
export function useProductsByCategory(categorySlug: string) {
  return useFilteredProducts({ category: categorySlug });
}

export function useProductsByPriceRange(minPrice: number, maxPrice: number) {
  return useFilteredProducts({ min_price: minPrice, max_price: maxPrice });
}

export function useFeaturedProducts() {
  return useFilteredProducts({ featured: true });
}

export function useOnSaleProducts() {
  return useFilteredProducts({ on_sale: true });
}

export function useSearchProducts(searchTerm: string) {
  return useFilteredProducts({ search: searchTerm });
}
