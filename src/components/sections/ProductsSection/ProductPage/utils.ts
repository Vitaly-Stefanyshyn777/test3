import type { Product } from "@/lib/products";
import type { ProductLike, StockStatus } from "./types";

/**
 * Перевіряє чи є продукт новинкою (менше 30 днів)
 */
export function isNewProduct(dateCreated: string): boolean {
  if (!dateCreated) return false;

  try {
    const createdDate = new Date(dateCreated);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 30;
  } catch {
    return false;
  }
}

/**
 * Перевіряє чи є продукт хітом продажів
 */
export function isHitProduct(
  product: Product | null,
  relatedCategoryProducts: ProductLike[]
): boolean {
  if (!product || !relatedCategoryProducts) return false;

  const wcProducts = relatedCategoryProducts.filter(
    (p) => p.total_sales !== undefined
  );

  if (wcProducts.length === 0) return false;

  const salesValues = wcProducts
    .map((p) => parseInt(String(p.total_sales || "0")))
    .filter((sales) => sales > 0)
    .sort((a, b) => b - a);

  const top10Sales = salesValues.slice(0, 10);
  const currentProductSales = parseInt(String(product.wcProduct?.total_sales || "0"));

  return top10Sales.includes(currentProductSales);
}

/**
 * Перевіряє чи товар відноситься до бордів
 */
export function isBoardProduct(product: Product): boolean {
  if (!product?.categories || product.categories.length === 0) {
    return false;
  }

  return product.categories.some(
    (cat) =>
      cat.id === 71 || // Категорія "Борди" за ID
      cat.id === 30 || // Інша категорія бордів за ID
      cat.slug?.toLowerCase().includes("board") || // Slug містить "board"
      cat.slug?.toLowerCase().includes("борд") // Slug містить "борд"
  );
}

/**
 * Визначає категорію FAQ на основі категорій продукту
 */
export function getFaqCategoryId(product: Product): number | undefined {
  if (!product?.categories || product.categories.length === 0) {
    return undefined;
  }

  if (isBoardProduct(product)) {
    return 70; // Борди
  }

  return 70; // За замовчуванням для продуктів
}

/**
 * Повертає текст статусу наявності товару
 */
export function getStockStatusText(stockStatus: StockStatus | string): string {
  switch (stockStatus) {
    case "instock":
      return "В наявності";
    case "outofstock":
      return "Немає в наявності";
    case "onbackorder":
      return "Під замовлення";
    default:
      return "В наявності";
  }
}

/**
 * Перевіряє чи товар доступний для покупки
 */
export function isProductAvailable(product: Product): boolean {
  return typeof product?.stockQuantity === "number"
    ? product.stockQuantity > 0
    : product?.stockStatus !== "outofstock";
}
