// price.ts

export const AUTH_DISCOUNT = 0.2; // 20%

export interface PriceCalculationParams {
  price?: number | string | null;
  originalPrice?: number | string | null;
  regularPrice?: number | string | null;
  salePrice?: number | string | null;
  isLoggedIn: boolean;
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
 * Основний розрахунок ціни
 */
export function calculatePrice({
  price = 0,
  regularPrice,
  salePrice,
  isLoggedIn,
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
   * Якщо користувач АВТОРИЗОВАНИЙ → мінус 20%
   */
  const finalPrice = actualPrice * (1 - AUTH_DISCOUNT);

  const hasWcDiscount =
    displayRegularPrice > 0 && actualPrice < displayRegularPrice;

  const totalDiscount =
    displayRegularPrice > 0
      ? ((displayRegularPrice - finalPrice) / displayRegularPrice) * 100
      : AUTH_DISCOUNT * 100;

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
