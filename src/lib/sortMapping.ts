import type { SortType } from "@/components/ui/FilterSortPanel/FilterSortPanel";

export interface SortParams {
  orderby: "date" | "price" | "popularity" | "rating" | "title";
  order: "asc" | "desc";
  on_sale?: boolean;
}

/**
 * Мапить наш тип сортування на параметри WooCommerce API
 */
export function mapSortTypeToWcParams(sortType: SortType): SortParams {
  switch (sortType) {
    case "popular":
      return {
        orderby: "popularity",
        order: "desc",
      };

    case "new":
      return {
        orderby: "date",
        order: "desc",
      };

    case "sale":
      return {
        orderby: "date",
        order: "desc",
        on_sale: true,
      };

    case "price_desc":
      return {
        orderby: "price",
        order: "desc",
      };

    case "price_asc":
      return {
        orderby: "price",
        order: "asc",
      };

    default:
      return {
        orderby: "popularity",
        order: "desc",
      };
  }
}

/**
 * Мапить наш тип сортування на параметри WordPress API (для інструкторів)
 */
export function mapSortTypeToWpParams(sortType: SortType): {
  orderby: "date" | "title" | "id";
  order: "asc" | "desc";
} {
  switch (sortType) {
    case "popular":
      // Для популярності використовуємо дату (новіші спочатку)
      return {
        orderby: "date",
        order: "desc",
      };

    case "new":
      return {
        orderby: "date",
        order: "desc",
      };

    case "sale":
      // Для sale не має сенсу для інструкторів, використовуємо дату
      return {
        orderby: "date",
        order: "desc",
      };

    case "price_desc":
      // Для ціни використовуємо title як fallback
      return {
        orderby: "title",
        order: "desc",
      };

    case "price_asc":
      return {
        orderby: "title",
        order: "asc",
      };

    default:
      return {
        orderby: "date",
        order: "desc",
      };
  }
}

