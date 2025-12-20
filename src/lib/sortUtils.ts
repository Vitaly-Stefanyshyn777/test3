import type { SortType } from "@/components/ui/FilterSortPanel/FilterSortPanel";

export interface SortableItem {
  id: string | number;
  price?: number | string;
  regularPrice?: number | string;
  salePrice?: number | string;
  dateCreated?: string;
  date_created?: string;
  onSale?: boolean;
  featured?: boolean;
  total_sales?: number;
}

export function sortItems<T extends SortableItem>(
  items: T[],
  sortType: SortType
): T[] {
  const sorted = [...items];

  if (process.env.NODE_ENV !== "production") {
  }

  switch (sortType) {
    case "popular":
      // Популярні - сортуємо за загальною кількістю продажів (total_sales) або featured
      return sorted.sort((a, b) => {
        // Спочатку перевіряємо total_sales (для товарів)
        const salesA = a.total_sales || 0;
        const salesB = b.total_sales || 0;
        if (salesA !== salesB) {
          return salesB - salesA; // Більше продажів = вище в списку
        }
        // Якщо total_sales однакові або відсутні, сортуємо за featured
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
        const getPrice = (item: SortableItem) => {
          const price = item.salePrice || item.price || 0;
          return typeof price === 'string' ? parseFloat(price) || 0 : price;
        };
        const priceA = getPrice(a);
        const priceB = getPrice(b);
        return priceB - priceA;
      });

    case "price_asc":
      // Ціна за зростанням
      return sorted.sort((a, b) => {
        const getPrice = (item: SortableItem) => {
          const price = item.salePrice || item.price || 0;
          return typeof price === 'string' ? parseFloat(price) || 0 : price;
        };
        const priceA = getPrice(a);
        const priceB = getPrice(b);
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
