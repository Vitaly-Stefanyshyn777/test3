import { useState, useEffect } from "react";
import { fetchProductVariation } from "./products";

export interface ProductPrices {
  currentPrice: number;
  originalPrice?: number;
  isLoading: boolean;
}

export interface WooCommerceProductBasic {
  id: number;
  type: string;
  variations: number[];
  price: string;
  regular_price: string;
  sale_price: string;
}

// Функція для отримання ціни товару за його ID (асинхронна)
export const getProductPriceAsync = async (
  productId: string
): Promise<{ currentPrice: number; originalPrice?: number }> => {
  try {
    // Якщо це курс у форматі "course-{id}", витягуємо числовий ID
    let actualProductId = productId;
    if (productId.startsWith("course-")) {
      actualProductId = productId.replace("course-", "");
    }

    // Спробуємо отримати продукт з WooCommerce API
    const response = await fetch(`/api/wc/products/${actualProductId}`);

    if (response.ok) {
      const wcProduct = await response.json();

      // Якщо це варіативний товар, отримуємо дані першої варіації
      if (wcProduct.type === "variable" && wcProduct.variations?.[0]) {
        const firstVariationId = wcProduct.variations[0];
        const variation = await fetchProductVariation(
          firstVariationId,
          wcProduct.id
        );

        const currentPrice = parseFloat(
          variation.price ||
            variation.sale_price ||
            variation.regular_price ||
            "0"
        );
        const regularPrice = variation.regular_price
          ? parseFloat(variation.regular_price)
          : undefined;

        return {
          currentPrice,
          originalPrice:
            regularPrice && regularPrice > currentPrice
              ? regularPrice
              : undefined,
        };
      } else {
        // Для звичайних товарів
        const currentPrice = parseFloat(wcProduct.price || "0");
        const originalPrice = wcProduct.regular_price
          ? parseFloat(wcProduct.regular_price)
          : undefined;

        return {
          currentPrice,
          originalPrice:
            originalPrice && originalPrice > currentPrice
              ? originalPrice
              : undefined,
        };
      }
    } else {
      // Якщо це 404, можливо продукт не існує або видалений
      if (response.status === 404) {
        console.warn(`Product ${actualProductId} not found in WooCommerce`);
      }
    }

    return { currentPrice: 0 };
  } catch (error) {
    return { currentPrice: 0 };
  }
};

// Хук для отримання цін товару (з урахуванням варіацій)
export const useProductPrices = (
  productId: string,
  wcProduct?: WooCommerceProductBasic
): ProductPrices => {
  const [prices, setPrices] = useState<ProductPrices>({
    currentPrice: 0,
    originalPrice: undefined,
    isLoading: true,
  });

  useEffect(() => {
    const loadPrices = async () => {
      try {
        setPrices((prev) => ({ ...prev, isLoading: true }));

        // Якщо у нас є wcProduct, використовуємо його
        if (wcProduct) {
          // Якщо це не варіативний товар, повертаємо звичайні ціни
          if (wcProduct.type !== "variable") {
            const currentPrice = parseFloat(wcProduct.price || "0");
            const originalPrice = wcProduct.regular_price
              ? parseFloat(wcProduct.regular_price)
              : undefined;

            setPrices({
              currentPrice,
              originalPrice:
                originalPrice && originalPrice > currentPrice
                  ? originalPrice
                  : undefined,
              isLoading: false,
            });
            return;
          }

          // Для варіативних товарів отримуємо дані першої варіації
          if (wcProduct.variations?.[0]) {
            const firstVariationId = wcProduct.variations[0];
            const variation = await fetchProductVariation(
              firstVariationId,
              wcProduct.id
            );

            const currentPrice = parseFloat(
              variation.price ||
                variation.sale_price ||
                variation.regular_price ||
                "0"
            );
            const regularPrice = variation.regular_price
              ? parseFloat(variation.regular_price)
              : undefined;

            setPrices({
              currentPrice,
              originalPrice:
                regularPrice && regularPrice > currentPrice
                  ? regularPrice
                  : undefined,
              isLoading: false,
            });
            return;
          }

          // Fallback для варіативних товарів без варіацій
          setPrices({
            currentPrice: parseFloat(wcProduct.price || "0"),
            originalPrice: undefined,
            isLoading: false,
          });
        } else {
          // Якщо wcProduct не передано, отримуємо його з API
          const result = await getProductPriceAsync(productId);
          setPrices({
            currentPrice: result.currentPrice,
            originalPrice: result.originalPrice,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching product prices:", error);
        setPrices({
          currentPrice: 0,
          originalPrice: undefined,
          isLoading: false,
        });
      }
    };

    loadPrices();
  }, [productId, wcProduct]);

  return prices;
};
