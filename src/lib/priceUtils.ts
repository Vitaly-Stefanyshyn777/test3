/**
 * Утиліти для розрахунку цін з урахуванням знижок та авторизації
 */

export const AUTH_DISCOUNT = 0.2; // 20% знижка для авторизованих користувачів

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
 * Розраховує фінальну ціну з урахуванням знижок та авторизації
 */
export function calculatePrice({
  price = 0,
  originalPrice,
  regularPrice,
  salePrice,
  isLoggedIn,
}: PriceCalculationParams): PriceCalculationResult {
  // Нормалізуємо ціни до чисел
  const currentPrice = price ? Number(price) : 0;
  const regularPriceNum = regularPrice ? Number(regularPrice) : 0;
  const salePriceNum = salePrice && Number(salePrice) > 0 ? Number(salePrice) : null;
  const originalPriceNum = originalPrice ? Number(originalPrice) : 0;

  // Визначаємо базову ціну (пріоритет: salePrice -> currentPrice -> regularPrice)
  const basePrice = salePriceNum || currentPrice || regularPriceNum;

  // Розраховуємо фінальну ціну з урахуванням авторизації
  const finalPrice = basePrice
    ? isLoggedIn
      ? basePrice * (1 - AUTH_DISCOUNT)
      : basePrice
    : 0;

  // Визначаємо originalPrice для відображення (пріоритет: regularPrice -> originalPrice)
  const displayOriginalPrice = regularPriceNum || originalPriceNum;

  // Розраховуємо загальну знижку
  const totalDiscount =
    displayOriginalPrice && finalPrice
      ? ((displayOriginalPrice - finalPrice) / displayOriginalPrice) * 100
      : 0;

  // Визначаємо чи показувати стару ціну
  const shouldShowOldPrice =
    displayOriginalPrice > 0 && totalDiscount > 0 && displayOriginalPrice > finalPrice;

  // Додаємо логування для діагностики
  if (process.env.NODE_ENV === 'development') {
    console.log('🧮 calculatePrice:', {
      input: { price, originalPrice, regularPrice, salePrice, isLoggedIn },
      normalized: { currentPrice, regularPriceNum, salePriceNum, originalPriceNum },
      calculated: { basePrice, finalPrice, displayOriginalPrice, totalDiscount, shouldShowOldPrice }
    });
  }

  return {
    finalPrice,
    originalPrice: displayOriginalPrice,
    totalDiscount,
    shouldShowOldPrice,
  };
}

/**
 * Розраховує ціну для додавання в кошик
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

