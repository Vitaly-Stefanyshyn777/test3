import {
  getAllProducts,
  getProductById,
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
    // Якщо slug порожній або "skip", не виконуємо запит
    if (!slugOrId || slugOrId.trim() === "" || slugOrId === "skip") {
      throw new Error("Product slug is empty");
    }

    // Спочатку спробуємо отримати продукт напряму по ID через WC API
    // Це працює для всіх продуктів, включаючи інвентар
    if (/^\d+$/.test(slugOrId)) {
      try {
        const product = await getProductById(slugOrId);
        return await mapProductToUi(product);
      } catch (error) {
        // Продовжуємо до пошуку по slug
      }
    }

    // Якщо slugOrId не є числом (тобто це slug), спробуємо знайти продукт через WC v3 API по slug'у
    try {
      // Використовуємо прямий fetch запит
      const response = await fetch(
        `/api/wc/v3/products?slug=${encodeURIComponent(slugOrId)}`
      );

      if (response.ok) {
        const products = await response.json();
        if (products && Array.isArray(products) && products.length > 0) {
          const product = products[0];
          return await mapProductToUi(product);
        }
      }
    } catch (error) {
      // Продовжуємо до fallback пошуку
    }

    // Fallback: шукаємо серед всіх продуктів по slug (старий спосіб)
    const products = await getAllProducts();

    // Next.js автоматично декодує slug з URL, тому slugOrId приходить декодованим
    // Але slug з API може бути в різних форматах (encoded або decoded)
    // Нормалізуємо обидва значення для порівняння
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

        // Нормалізуємо: приводимо до нижнього регістру та прибираємо зайві пробіли
        return decoded.toLowerCase().trim();
      } catch {
        // Якщо виникла помилка, повертаємо як є
        return slug.toLowerCase().trim();
      }
    };

    const normalizedSlugOrId = normalizeSlug(slugOrId);

    const product = products.find((p) => {
      // Спочатку перевіряємо по ID (як fallback)
      const idMatch = p.id.toString() === slugOrId;
      if (idMatch) {
        return true;
      }

      // Якщо у продукту немає slug, не перевіряємо по slug
      if (!p.slug) {
        return false;
      }

      // Нормалізуємо slug з API
      const normalizedApiSlug = normalizeSlug(p.slug);

      // Порівнюємо нормалізовані значення (case-insensitive)
      const slugMatch =
        p.slug === slugOrId || // Exact match (якщо обидва однаково)
        normalizedApiSlug === normalizedSlugOrId || // Нормалізовані значення
        p.slug.toLowerCase() === slugOrId.toLowerCase() || // Case-insensitive exact
        normalizedApiSlug === slugOrId.toLowerCase(); // Нормалізований API slug === URL slug (lowercase)

      return slugMatch;
    });

    if (!product) {
      throw new Error(`Product not found: ${slugOrId}`);
    }

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
      const categoryFilter = filters.category as string;
      // Перевіряємо, чи це ID (число) чи slug
      const isNumericId = /^\d+$/.test(categoryFilter);

      filteredProducts = filteredProducts.filter((product) =>
        product.categories.some(
          (cat) =>
            // Порівнюємо по slug або по ID
            cat.slug === categoryFilter ||
            (isNumericId && cat.id.toString() === categoryFilter)
        )
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
