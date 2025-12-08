import {
  getAllProducts,
  getProductsByCategory,
  mapProductToUi,
} from "./products";
import { fetchWcCategories } from "./bfbApi";

export const productsQuery = () => ({
  queryKey: ["products"] as const,
  queryFn: async () => {
    const products = await getAllProducts();
    const mapped = await Promise.all(products.map(mapProductToUi));

    return mapped;
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const productQuery = (slugOrId: string) => ({
  queryKey: ["product", slugOrId] as const,
  queryFn: async () => {
    const products = await getAllProducts();
    
    // Next.js автоматично декодує slug з URL, тому slugOrId приходить декодованим
    // Але slug з API може бути encoded, тому декодуємо обидва для порівняння
    const product = products.find((p) => {
      // Декодуємо slug з API для порівняння
      const apiSlugDecoded = decodeURIComponent(p.slug);
      
      return (
        p.slug === slugOrId || // Exact match (якщо обидва однаково)
        apiSlugDecoded === slugOrId || // Декодований slug з API === декодований slug з URL
        p.id.toString() === slugOrId // Fallback to ID
      );
    });
    
    if (!product) throw new Error("Product not found");
    return await mapProductToUi(product);
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const productsWithFiltersQuery = (filters: Record<string, unknown>) => ({
  queryKey: ["products", "filtered", filters] as const,
  queryFn: async () => {
    let products = await getAllProducts();

    // Якщо передано slug категорії, спробуємо знайти її ID і отримати товари одразу з BE
    if (filters.category && typeof filters.category === "string") {
      try {
        const categories = (await fetchWcCategories()) as Array<{
          id: number;
          slug: string;
        }>;
        const target = categories.find(
          (c) => c.slug === (filters.category as string)
        );
        if (target) {
          products = await getProductsByCategory(String(target.id));
        }
      } catch (e) {
        // Якщо не вдалось — залишаємо fallback на клієнтську фільтрацію нижче
        console.warn(
          "[productsWithFiltersQuery] Не вдалося отримати категорії або товари за категорією, використовую локальну фільтрацію",
          e
        );
      }
    }

    const mapped = products.map(mapProductToUi);

    let filteredProducts = mapped;

    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      filteredProducts = filteredProducts.filter((product) => {
        const price = parseFloat(product.price);
        return (
          price >= (filters.priceMin as number) &&
          price <= (filters.priceMax as number)
        );
      });
    }

    if (
      filters.colors &&
      Array.isArray(filters.colors) &&
      (filters.colors as string[]).length > 0
    ) {
      filteredProducts = filteredProducts.filter((product) => {
        return product.attributes.some((attr) =>
          (filters.colors as string[]).some((color) =>
            attr.options.includes(color)
          )
        );
      });
    }

    if (
      filters.sizes &&
      Array.isArray(filters.sizes) &&
      (filters.sizes as string[]).length > 0
    ) {
      filteredProducts = filteredProducts.filter((product) => {
        return product.attributes.some((attr) =>
          (filters.sizes as string[]).some((size) =>
            attr.options.includes(size)
          )
        );
      });
    }

    if (filters.category) {
      filteredProducts = filteredProducts.filter((product) =>
        product.categories.some((cat) => cat.slug === filters.category)
      );
    }

    if (filters.search) {
      const searchTerm = (filters.search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.shortDescription.toLowerCase().includes(searchTerm)
      );
    }

    return filteredProducts;
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const newProductsQuery = () => ({
  queryKey: ["products", "new"] as const,
  queryFn: async () => {
    const products = await getAllProducts();
    const mapped = products.map(mapProductToUi);
    // Mock logic for new products - products created in last 30 days
    return mapped.filter((product) => product.isNew);
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const bestSellingProductsQuery = () => ({
  queryKey: ["products", "bestselling"] as const,
  queryFn: async () => {
    const products = await getAllProducts();
    const mapped = products.map(mapProductToUi);
    // Mock logic for best selling - products with high sales
    return mapped.slice(0, 8); // Return first 8 products as mock
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const saleProductsQuery = () => ({
  queryKey: ["products", "sale"] as const,
  queryFn: async () => {
    const products = await getAllProducts();
    const mapped = products.map(mapProductToUi);
    return mapped.filter((product) => product.onSale);
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

// Fetch by numeric WC category id
export const productsByCategoryQuery = (categoryId: string) => ({
  queryKey: ["products", "category", categoryId] as const,
  queryFn: async () => {
    const products = await getProductsByCategory(categoryId);
    return products.map(mapProductToUi);
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

export const productCategoriesQuery = () => ({
  queryKey: ["product-categories"] as const,
  queryFn: async () => {
    const products = await getAllProducts();
    const mapped = products.map(mapProductToUi);
    const categories = new Map();

    mapped.forEach((product) => {
      product.categories.forEach((category) => {
        if (!categories.has(category.slug)) {
          categories.set(category.slug, category);
        }
      });
    });

    return Array.from(categories.values());
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,
});
