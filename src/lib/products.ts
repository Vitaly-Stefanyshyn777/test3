import api from "./api";

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: unknown[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  brands: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: unknown[];
  images: Array<{
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    slug: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }>;
  default_attributes: unknown[];
  variations: unknown[];
  grouped_products: unknown[];
  menu_order: number;
  price_html: string;
  related_ids: number[];
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
  }>;
  stock_status: string;
  has_options: boolean;
  post_password: string;
  global_unique_id: string;
  _links: unknown;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  description: string;
  shortDescription: string;
  sku: string;
  stockStatus: string;
  stockQuantity: number | null;
  image: string;
  color?: string;
  originalPrice?: string;
  // Нові поля для характеристик
  weight?: string;
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
  };
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  brands: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    slug: string;
    options: string[];
  }>;
  metaData: Array<{
    id: number;
    key: string;
    value: string;
  }>;
  permalink: string;
  averageRating: string;
  ratingCount: number;
  dateCreated?: string; // Дата створення з WooCommerce v3 API
  isNew?: boolean;
  courseData?: {
    Required_equipment?: string;
    Course_coach?: unknown;
    Course_themes?: string[];
    What_learn?: string[];
    Course_include?: string[];
    Course_program?: string[];
    Date_start?: string;
    Duration?: string;
    Blocks?: unknown;
    Online_lessons?: unknown;
  };
  wcProduct?: {
    prices?: {
      price: string;
      regular_price: string;
      sale_price: string;
    };
    on_sale?: boolean;
    average_rating?: string;
    rating_count?: number;
    total_sales?: number;
    featured?: boolean;
    images?: Array<{ src: string; alt: string }>;
    sku?: string;
    type?: string;
    variations?: number[];
    variationsData?: Record<
      number,
      {
        id: number;
        price: string;
        regular_price: string;
        sale_price: string;
        sku: string;
        attributes: Array<{
          id: number;
          name: string;
          slug: string;
          option: string;
        }>;
      }
    >;
  };
}

// Отримати всі товари
export const getAllProducts = async (): Promise<WooCommerceProduct[]> => {
  try {
    // Використовуємо WooCommerce v3 API для отримання повних даних з date_created
    const response = await api.get("/api/wc/v3/products");
    return response.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return [
      {
        id: 1,
        name: "BFB Balance Board | Original",
        slug: "bfb-balance-board-original",
        permalink: "/product/bfb-balance-board-original/",
        date_created: "2024-01-01T00:00:00",
        date_created_gmt: "2024-01-01T00:00:00",
        date_modified: "2024-01-01T00:00:00",
        date_modified_gmt: "2024-01-01T00:00:00",
        type: "simple",
        status: "publish",
        featured: true,
        catalog_visibility: "visible",
        description:
          "Balance Functional Board (BFB) - це інноваційний тренажер для функціонального тренування",
        short_description:
          "Інноваційний тренажер для функціонального тренування",
        sku: "BFB-001",
        price: "0",
        regular_price: "0",
        sale_price: "0",
        date_on_sale_from: null,
        date_on_sale_from_gmt: null,
        date_on_sale_to: null,
        date_on_sale_to_gmt: null,
        on_sale: true,
        purchasable: true,
        total_sales: 0,
        virtual: false,
        downloadable: false,
        downloads: [],
        download_limit: -1,
        download_expiry: -1,
        external_url: "",
        button_text: "",
        tax_status: "taxable",
        tax_class: "",
        manage_stock: false,
        stock_quantity: null,
        backorders: "no",
        backorders_allowed: false,
        backordered: false,
        low_stock_amount: null,
        sold_individually: false,
        weight: "5.2",
        dimensions: {
          length: "125",
          width: "30",
          height: "25",
        },
        shipping_required: true,
        shipping_taxable: true,
        shipping_class: "",
        shipping_class_id: 0,
        reviews_allowed: true,
        average_rating: "4.5",
        rating_count: 10,
        related_ids: [],
        upsell_ids: [],
        cross_sell_ids: [],
        parent_id: 0,
        purchase_note: "",
        categories: [
          {
            id: 1,
            name: "Тренажери",
            slug: "trenazhery",
          },
        ],
        brands: [],
        tags: [],
        images: [
          {
            id: 1,
            date_created: "2024-01-01T00:00:00",
            date_created_gmt: "2024-01-01T00:00:00",
            date_modified: "2024-01-01T00:00:00",
            date_modified_gmt: "2024-01-01T00:00:00",
            src: "/placeholder.svg",
            name: "bfb-balance-board",
            alt: "BFB Balance Board",
          },
        ],
        attributes: [],
        default_attributes: [],
        variations: [],
        grouped_products: [],
        menu_order: 0,
        price_html:
          '<span class="woocommerce-Price-amount amount"><bdi>5,000&nbsp;<span class="woocommerce-Price-currencySymbol">₴</span></bdi></span>',
        meta_data: [],
        stock_status: "instock",
        has_options: false,
        post_password: "",
        global_unique_id: "",
        _links: {
          self: [{ href: "/wp-json/wc/v3/products/1" }],
          collection: [{ href: "/wp-json/wc/v3/products" }],
        },
      },
    ];
  }
};

export const getProductById = async (
  id: string
): Promise<WooCommerceProduct> => {
  try {
    const response = await api.get(`/api/wc/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Product not found");
  }
};

export const fetchProductVariation = async (
  variationId: number,
  parentId: number
) => {
  const response = await fetch(
    `/api/wc/v3/products/${parentId}/variations/${variationId}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch variation: ${response.status}`);
  }
  return response.json();
};

export const mapProductToUi = (wcProduct: WooCommerceProduct): Product => {
  // Забезпечуємо що slug завжди існує, генеруємо з назви якщо потрібно
  const ensureSlug = (
    slug: string | undefined,
    name: string,
    id: number
  ): string => {
    let processedSlug = slug;

    // Декодуємо slug тільки якщо він містить URL-encoded символи
    if (processedSlug && processedSlug.includes("%")) {
      try {
        processedSlug = decodeURIComponent(processedSlug);
      } catch {
        // Якщо декодування не вдалося, використовуємо оригінал
        processedSlug = slug;
      }
    }

    if (
      processedSlug &&
      processedSlug.trim() !== "" &&
      !/^\d+$/.test(processedSlug)
    ) {
      return processedSlug;
    }

    // Генеруємо slug з назви: lowercase, заміняємо пробіли на дефіси, видаляємо спецсимволи
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-zа-яіїєґ0-9\s-]/g, "") // видаляємо спецсимволи окрім пробілів та дефісів
      .replace(/\s+/g, "-") // заміняємо пробіли на дефіси
      .replace(/-+/g, "-") // заміняємо множинні дефіси на один
      .replace(/^-|-$/g, ""); // видаляємо дефіси на початку та кінці

    return generatedSlug || `product-${id}`;
  };

  const mapped = {
    id: wcProduct.id.toString(),
    name: wcProduct.name,
    slug: ensureSlug(wcProduct.slug, wcProduct.name, wcProduct.id),
    price: wcProduct.price,
    regularPrice: wcProduct.regular_price,
    salePrice: wcProduct.sale_price,
    onSale: wcProduct.on_sale,
    description: wcProduct.description,
    shortDescription: wcProduct.short_description,
    sku: wcProduct.sku,
    stockStatus: wcProduct.stock_status,
    stockQuantity: wcProduct.stock_quantity,
    image: wcProduct.images?.[0]?.src || "/placeholder.svg",
    weight: wcProduct.weight,
    dimensions: {
      length: wcProduct.dimensions?.length,
      width: wcProduct.dimensions?.width,
      height: wcProduct.dimensions?.height,
    },
    images:
      wcProduct.images?.map((img) => ({
        id: img.id,
        src: img.src,
        name: img.name,
        alt: img.alt,
      })) || [],
    categories:
      wcProduct.categories?.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })) || [],
    brands:
      wcProduct.brands?.map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
      })) || [],
    attributes:
      wcProduct.attributes?.map((attr) => ({
        id: attr.id,
        name: attr.name,
        slug: attr.slug,
        options: attr.options,
      })) || [],
    metaData:
      wcProduct.meta_data?.map((meta) => ({
        id: meta.id,
        key: meta.key,
        value: meta.value,
      })) || [],
    permalink: wcProduct.permalink,
    averageRating: wcProduct.average_rating,
    ratingCount: wcProduct.rating_count,
    dateCreated: wcProduct.date_created, // Додаємо дату створення
    isNew: (() => {
      // Визначаємо чи товар новий (30 днів)
      if (!wcProduct.date_created) return false;
      try {
        const createdDate = new Date(wcProduct.date_created);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return createdDate > thirtyDaysAgo;
      } catch {
        return false;
      }
    })(),
    wcProduct: {
      id: wcProduct.id,
      name: wcProduct.name,
      prices: {
        price: wcProduct.price,
        regular_price: wcProduct.regular_price,
        sale_price: wcProduct.sale_price,
      },
      on_sale: wcProduct.on_sale,
      total_sales: wcProduct.total_sales,
      average_rating: wcProduct.average_rating,
      rating_count: wcProduct.rating_count,
      featured: wcProduct.featured,
      images: wcProduct.images,
      sku: wcProduct.sku,
      type: wcProduct.type,
      variations: (wcProduct.variations as number[]) || [],
    },
  };

  return mapped;
};

// Отримати товари за категорією
export const getProductsByCategory = async (
  categoryId: string
): Promise<WooCommerceProduct[]> => {
  try {
    const response = await api.get("/api/wc/products", {
      params: { category: categoryId },
    });
    return response.data;
  } catch (error) {
    // Fallback to mock data if API fails
    const allProducts = await getAllProducts();
    return allProducts.filter((product) =>
      product.categories.some((cat) => cat.id.toString() === categoryId)
    );
  }
};

export async function checkProductsWithImageColors() {
  try {
    const allProducts = await getAllProducts();
    const productsWithImageColors = allProducts.filter((wcProduct) => {
      // Перевіряємо чи продукт має атрибути кольору
      if (wcProduct.attributes && Array.isArray(wcProduct.attributes)) {
        const colorAttribute = wcProduct.attributes.find(
          (attr) => attr.name === 'pa_color' || attr.slug === 'pa_color'
        );

        if (colorAttribute && colorAttribute.options && Array.isArray(colorAttribute.options)) {
          // Перевіряємо чи будь-який варіант кольору є URL
          const hasImageColor = colorAttribute.options.some((option) =>
            typeof option === 'string' && (
              option.startsWith('http') ||
              option.includes('.jpg') ||
              option.includes('.png') ||
              option.includes('.webp') ||
              option.includes('.jpeg') ||
              option.includes('.gif')
            )
          );

          if (hasImageColor) {
            return true;
          }
        }
      }

      return false;
    });

    return productsWithImageColors.map(wcProduct => ({
      id: wcProduct.id.toString(),
      name: wcProduct.name,
      slug: wcProduct.slug,
      hasImageColors: true
    }));

  } catch (error) {
    console.error('Error checking products with image colors:', error);
    return [];
  }
};
