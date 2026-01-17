// price.ts

export interface PriceCalculationParams {
  price?: number | string | null;
  originalPrice?: number | string | null;
  regularPrice?: number | string | null;
  salePrice?: number | string | null;
  isLoggedIn: boolean;
  /**
   * Відсоток знижки з proce_sell_registry (наприклад, 20 означає 20%)
   * Якщо не вказано або дорівнює 0, знижка не застосовується
   */
  priceSellRegistry?: number | string | null;
}

export interface PriceCalculationResult {
  finalPrice: number;
  originalPrice: number;
  totalDiscount: number;
  shouldShowOldPrice: boolean;
}

/**
 * Безпечне перетворення в число
 */
const toNumber = (value?: number | string | null): number => {
  if (value === null || value === undefined || value === "") return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Конвертує відсоток з proce_sell_registry (наприклад, 20) в десятковий формат (0.2)
 * Якщо не вказано або дорівнює 0, повертає 0 (без знижки)
 */
const parseDiscountPercent = (
  priceSellRegistry?: number | string | null
): number => {
  // Якщо не вказано або порожнє - знижки немає
  if (
    priceSellRegistry === null ||
    priceSellRegistry === undefined ||
    priceSellRegistry === ""
  ) {
    return 0; // Без знижки
  }

  const num = toNumber(priceSellRegistry);

  // Якщо дорівнює 0 - знижки немає
  if (num === 0) {
    return 0; // Без знижки
  }

  // Якщо число більше 1, вважаємо що це відсоток (наприклад, 20 = 20%)
  // Якщо менше або дорівнює 1, вважаємо що це десятковий формат (наприклад, 0.2 = 20%)
  if (num > 1) {
    return num / 100; // Конвертуємо відсоток в десятковий формат
  }

  // Перевіряємо що значення в межах 0-1
  if (num > 0 && num <= 1) {
    return num;
  }

  // Якщо щось не так (негативне число або інше), знижки немає
  return 0;
};

/**
 * Безпечне парсування ціни з WooCommerce (видаляє символи валют, коми тощо)
 */
const parseWcPrice = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const str = String(value)
    .replace(/[₴$€£\s,]/g, "")
    .replace(",", ".");
  const num = parseFloat(str);
  return Number.isFinite(num) && num > 0 ? num : undefined;
};

/**
 * Нормалізує ціни з різних джерел до стандартного формату для calculatePrice
 *
 * Логіка (як в ProductCard):
 * - regularPrice = wcRegularPrice || regularPrice || originalPrice
 * - salePrice = wcSalePrice || (wcPrice < wcRegularPrice ? wcPrice : undefined)
 * - currentPrice = wcPrice || price || 0
 */
export interface NormalizedPriceParams {
  price: number;
  regularPrice?: number;
  salePrice?: number;
}

export interface PriceSource {
  // WooCommerce продукт (для ProductCard, CourseCard)
  wcProduct?: {
    price?: string | number;
    regular_price?: string | number;
    sale_price?: string | number;
    prices?: {
      price?: string | number;
      regular_price?: string | number;
      sale_price?: string | number;
    };
  };
  // Прямі значення (для CartItemsList, Checkout)
  wcPrice?: number;
  wcRegularPrice?: number;
  wcSalePrice?: number;
  // Fallback значення
  price?: number | string;
  originalPrice?: number | string;
  regularPrice?: number | string;
  salePrice?: number | string;
}

export function normalizePriceParams(
  source: PriceSource
): NormalizedPriceParams {
  // Парсуємо WooCommerce ціни (пріоритет: prices.price -> price)
  const wcPrice = source.wcProduct?.prices?.price
    ? parseWcPrice(source.wcProduct.prices.price)
    : source.wcPrice !== undefined
    ? source.wcPrice > 0
      ? source.wcPrice
      : undefined
    : source.wcProduct?.price
    ? parseWcPrice(source.wcProduct.price)
    : undefined;

  const wcRegularPrice = source.wcProduct?.prices?.regular_price
    ? parseWcPrice(source.wcProduct.prices.regular_price)
    : source.wcRegularPrice !== undefined
    ? source.wcRegularPrice > 0
      ? source.wcRegularPrice
      : undefined
    : source.wcProduct?.regular_price
    ? parseWcPrice(source.wcProduct.regular_price)
    : undefined;

  const wcSalePrice = source.wcProduct?.prices?.sale_price
    ? parseWcPrice(source.wcProduct.prices.sale_price)
    : source.wcSalePrice !== undefined
    ? source.wcSalePrice > 0
      ? source.wcSalePrice
      : undefined
    : source.wcProduct?.sale_price
    ? parseWcPrice(source.wcProduct.sale_price)
    : undefined;

  // Парсуємо fallback значення
  const fallbackPrice =
    source.price !== undefined ? toNumber(source.price) : undefined;
  const fallbackRegularPrice =
    source.regularPrice !== undefined
      ? toNumber(source.regularPrice)
      : undefined;
  const fallbackSalePrice =
    source.salePrice !== undefined ? toNumber(source.salePrice) : undefined;

  // Визначаємо regularPrice (wcRegularPrice або fallbackRegularPrice)
  const regularPrice = wcRegularPrice ?? fallbackRegularPrice;

  // Визначаємо salePrice (wcSalePrice або fallbackSalePrice, або якщо wcPrice < wcRegularPrice)
  const salePrice =
    wcSalePrice ??
    (fallbackSalePrice &&
    fallbackSalePrice > 0 &&
    (!regularPrice || fallbackSalePrice < regularPrice)
      ? fallbackSalePrice
      : undefined) ??
    (wcPrice && regularPrice && wcPrice < regularPrice ? wcPrice : undefined);

  // Визначаємо currentPrice (wcPrice або salePrice або fallbackPrice)
  // ВАЖЛИВО: wcPrice може бути sale_price, якщо товар на знижці
  const currentPrice =
    wcPrice ??
    (salePrice && salePrice > 0 ? salePrice : undefined) ??
    (fallbackPrice && fallbackPrice > 0 ? fallbackPrice : undefined);

  return {
    price: currentPrice ?? 0,
    regularPrice,
    salePrice,
  };
}

/**
 * Витягує proce_sell_registry з продукту або курсу
 */
export const getPriceSellRegistry = (
  productOrCourse: {
    metaData?: Array<{ key: string; value: string }>;
    meta_data?: Array<{ key: string; value: string }>;
    acf?: Record<string, unknown>;
    wcProduct?: {
      meta_data?: Array<{ key: string; value: string }>;
    };
  } | null
): number | string | null | undefined => {
  if (!productOrCourse) return null;

  // Перевіряємо meta_data (для продуктів)
  const metaData =
    productOrCourse.metaData ||
    productOrCourse.meta_data ||
    productOrCourse.wcProduct?.meta_data ||
    [];

  const metaValue = metaData.find(
    (meta) => meta.key === "proce_sell_registry"
  )?.value;

  if (metaValue !== undefined && metaValue !== null && metaValue !== "") {
    return metaValue;
  }

  // Перевіряємо acf (для курсів)
  const acf = productOrCourse.acf;
  if (acf && typeof acf === "object" && "proce_sell_registry" in acf) {
    const acfValue = acf.proce_sell_registry;
    if (acfValue !== undefined && acfValue !== null && acfValue !== "") {
      return acfValue as string | number;
    }
  }

  return null;
};

/**
 * Основний розрахунок ціни
 */
export function calculatePrice({
  price,
  regularPrice,
  salePrice,
  isLoggedIn,
  priceSellRegistry,
}: PriceCalculationParams): PriceCalculationResult {
  const priceNum = toNumber(price);
  const regularPriceNum = toNumber(regularPrice);
  const salePriceNum = toNumber(salePrice);

  /**
   * Актуальна ціна з бекенду:
   * priority: price -> sale_price -> regular_price
   */
  const wooCommercePrice =
    priceNum > 0 ? priceNum : salePriceNum > 0 ? salePriceNum : regularPriceNum;

  /**
   * Звичайна ціна для відображення
   */
  const displayRegularPrice =
    regularPriceNum > 0 ? regularPriceNum : wooCommercePrice;

  /**
   * Якщо користувач НЕ авторизований - показуємо звичайну WooCommerce ціну
   */
  if (!isLoggedIn) {
    const finalPrice = wooCommercePrice;

    const hasWcDiscount =
      displayRegularPrice > 0 && wooCommercePrice < displayRegularPrice;

    const totalDiscount = hasWcDiscount
      ? ((displayRegularPrice - wooCommercePrice) / displayRegularPrice) * 100
      : 0;

    return {
      finalPrice,
      originalPrice: displayRegularPrice,
      totalDiscount,
      shouldShowOldPrice: hasWcDiscount,
    };
  }

  /**
   * Якщо користувач АВТОРИЗОВАНИЙ - застосовуємо динамічну знижку з priceSellRegistry
   */
  const discountPercent = parseDiscountPercent(priceSellRegistry);

  // Якщо знижки немає (discountPercent === 0), використовуємо оригінальну ціну
  const finalPrice =
    discountPercent > 0
      ? wooCommercePrice * (1 - discountPercent)
      : wooCommercePrice;

  // Загальний відсоток знижки від regularPrice (включає WooCommerce sale_price + priceSellRegistry)
  // Формула: (regular_price - finalPrice) / regular_price * 100
  const totalDiscount =
    displayRegularPrice > 0
      ? ((displayRegularPrice - finalPrice) / displayRegularPrice) * 100
      : discountPercent > 0
      ? discountPercent * 100
      : 0;

  return {
    finalPrice,
    originalPrice: displayRegularPrice,
    totalDiscount,
    shouldShowOldPrice: displayRegularPrice > finalPrice,
  };
}

/**
 * Для кошика
 */
export function calculateCartPrice({
  price,
  originalPrice,
  regularPrice,
  salePrice,
  isLoggedIn,
  priceSellRegistry,
}: PriceCalculationParams): {
  priceToAdd: number;
  originalPriceToAdd?: number;
} {
  const calculation = calculatePrice({
    price,
    originalPrice,
    regularPrice,
    salePrice,
    isLoggedIn,
    priceSellRegistry,
  });

  return {
    priceToAdd: calculation.finalPrice,
    originalPriceToAdd: calculation.shouldShowOldPrice
      ? calculation.originalPrice
      : undefined,
  };
}

/**
 * Формат ціни: 1200₴
 */
export const formatPrice = (amount: string | number): string => {
  const num = typeof amount === "string" ? toNumber(amount) : amount;
  return isNaN(num) ? "0₴" : `${num.toLocaleString("uk-UA")}₴`;
};

/**
 * Формат ціни з періодом: 1200₴/місяць
 */
export const formatPriceWithPeriod = (
  amount: string | number,
  period: string = "/місяць"
): string => {
  return `${formatPrice(amount)}${period}`;
};
