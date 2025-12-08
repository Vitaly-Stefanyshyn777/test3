import type { SortType } from "@/components/ui/FilterSortPanel/FilterSortPanel";

export interface SortableItem {
  id: string | number;
  price?: number;
  regularPrice?: number;
  salePrice?: number;
  dateCreated?: string;
  date_created?: string;
  onSale?: boolean;
  featured?: boolean;
}

export function sortItems<T extends SortableItem>(
  items: T[],
  sortType: SortType
): T[] {
  const sorted = [...items];

  switch (sortType) {
    case "popular":
      // Популярні - можна сортувати за featured або залишити як є
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });

    case "new":
      // Новинки - за датою створення (новіші спочатку)
      return sorted.sort((a, b) => {
        const dateA = new Date(a.dateCreated || a.date_created || 0).getTime();
        const dateB = new Date(b.dateCreated || b.date_created || 0).getTime();
        return dateB - dateA;
      });

    case "sale":
      // Акційні товари - тільки ті що в sale
      return sorted.filter((item) => item.onSale);

    case "price_desc":
      // Ціна за зменшенням
      return sorted.sort((a, b) => {
        const priceA = a.salePrice || a.price || 0;
        const priceB = b.salePrice || b.price || 0;
        return priceB - priceA;
      });

    case "price_asc":
      // Ціна за зростанням
      return sorted.sort((a, b) => {
        const priceA = a.salePrice || a.price || 0;
        const priceB = b.salePrice || b.price || 0;
        return priceA - priceB;
      });

    default:
      return sorted;
  }
}

export function paginateItems<T>(
  items: T[],
  page: number,
  perPage: number
): T[] {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return items.slice(start, end);
}
