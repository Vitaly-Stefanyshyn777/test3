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
 * Основний розрахунок ціни
 */
export function calculatePrice({
  price = 0,
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
  const actualPrice =
    priceNum > 0 ? priceNum : salePriceNum > 0 ? salePriceNum : regularPriceNum;

  /**
   * Базова ціна для перекреслення
   */
  const displayRegularPrice =
    regularPriceNum > 0 ? regularPriceNum : actualPrice;

  /**
   * Якщо користувач НЕ авторизований
   */
  if (!isLoggedIn) {
    const finalPrice = actualPrice;

    const hasWcDiscount =
      displayRegularPrice > 0 && actualPrice < displayRegularPrice;

    const totalDiscount = hasWcDiscount
      ? ((displayRegularPrice - actualPrice) / displayRegularPrice) * 100
      : 0;

    return {
      finalPrice,
      originalPrice: displayRegularPrice,
      totalDiscount,
      shouldShowOldPrice: hasWcDiscount,
    };
  }

  /**
   * Якщо користувач АВТОРИЗОВАНИЙ → застосовуємо знижку з proce_sell_registry
   * Якщо proce_sell_registry не вказано або дорівнює 0, знижки немає
   */
  const discountPercent = parseDiscountPercent(priceSellRegistry);

  // Якщо знижки немає (discountPercent === 0), використовуємо оригінальну ціну
  const finalPrice =
    discountPercent > 0 ? actualPrice * (1 - discountPercent) : actualPrice;

  const hasWcDiscount =
    displayRegularPrice > 0 && actualPrice < displayRegularPrice;

  // Розраховуємо загальну знижку (включаючи знижку з proce_sell_registry)
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
    shouldShowOldPrice: hasWcDiscount,
  };
}

/**
 * Для кошика
 */
export function calculateCartPrice({
  price = 0,
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
  return isNaN(num) ? "0₴" : `${Math.round(num)}₴`;
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
