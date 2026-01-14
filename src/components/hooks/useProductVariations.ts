"use client";
import { useEffect, useState, useMemo } from "react";

export interface ProductVariation {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  attributes: Array<{
    id: number;
    name: string;
    slug: string;
    option: string;
  }>;
}

export interface ProductVariationAttribute {
  id: number;
  name: string;
  slug: string;
  options: string[];
}

export function useProductVariations(
  variationsData: ProductVariation[],
  productAttributes?: ProductVariationAttribute[]
) {
  // Ініціалізуємо з початковими значеннями як в оригінальному коді
  const [selectedSize, setSelectedSize] = useState<string>("Big");
  const [selectedColor, setSelectedColor] = useState<string>("Білий");
  const [variationsLoading, setVariationsLoading] = useState(true);

  // Знаходимо атрибути розміру та кольору з продукту
  const sizeAttribute = productAttributes?.find(
    (attr) => attr.slug === "pa_size" || attr.name.toLowerCase().includes("розмір")
  );

  const colorAttribute = productAttributes?.find(
    (attr) => attr.slug === "pa_color" || attr.name.toLowerCase().includes("колір")
  );

  // Доступні розміри з варіацій
  const availableSizes = useMemo(() => {
    if (!variationsData.length) return sizeAttribute?.options || [];

    const sizesFromVariations = Array.from(
      new Set(
        variationsData
          .flatMap((v) => v.attributes || [])
          .filter((attr) => attr.slug === "pa_size")
          .map((attr) => attr.option)
      )
    );

    return sizesFromVariations.length > 0 ? sizesFromVariations : (sizeAttribute?.options || []);
  }, [variationsData, sizeAttribute]);

  // Доступні кольори з варіацій або атрибутів
  const availableColors = useMemo(() => {
    if (!variationsData.length) return colorAttribute?.options || [];

    const colorsFromVariations = Array.from(
      new Set(
        variationsData
          .flatMap((v) => v.attributes || [])
          .filter((attr) => attr.slug === "pa_color")
          .map((attr) => attr.option)
      )
    );

    return colorsFromVariations.length > 0 ? colorsFromVariations : (colorAttribute?.options || []);
  }, [variationsData, colorAttribute]);

  // Знаходимо варіацію за точною комбінацією розмір + колір
  const selectedVariation = useMemo(() => {
    if (!variationsData.length) return null;

    // Якщо вибрано повну комбінацію - шукаємо точну варіацію
    if (selectedSize && selectedColor) {
      const exactMatch = variationsData.find((v) => {
        const hasSize = v.attributes?.some(
          (attr) => attr.slug === "pa_size" && attr.option === selectedSize
        );
        const hasColor = v.attributes?.some(
          (attr) => attr.slug === "pa_color" && attr.option === selectedColor
        );
        return hasSize && hasColor;
      });

      if (exactMatch) return exactMatch;
    }

    // Якщо вибрано тільки розмір - знаходимо варіацію з цим розміром
    if (selectedSize && !selectedColor) {
      const sizeMatch = variationsData.find((v) =>
        v.attributes?.some(
          (attr) => attr.slug === "pa_size" && attr.option === selectedSize
        )
      );
      if (sizeMatch) return sizeMatch;
    }

    // Якщо вибрано тільки колір - знаходимо варіацію з цим кольором
    if (!selectedSize && selectedColor) {
      const colorMatch = variationsData.find((v) =>
        v.attributes?.some(
          (attr) => attr.slug === "pa_color" && attr.option === selectedColor
        )
      );
      if (colorMatch) return colorMatch;
    }

    // За замовчуванням перша доступна варіація
    return variationsData[0];
  }, [variationsData, selectedSize, selectedColor]);

  // Оновлюємо стан завантаження варіацій
  useEffect(() => {
    setVariationsLoading(false);
  }, [variationsData]);

  // Встановлюємо варіацію за замовчуванням при завантаженні
  useEffect(() => {
    if (variationsData.length > 0) {
      // Перевіряємо чи існує варіація з поточними значеннями (Big + Білий)
      const defaultVariation = variationsData.find((variation) =>
        variation.attributes?.some((attr) =>
          attr.slug === "pa_size" && attr.option === selectedSize
        ) &&
        variation.attributes?.some((attr) =>
          attr.slug === "pa_color" && attr.option === selectedColor
        )
      );

      // Якщо не знайшли варіацію з Big + Білий, встановлюємо першу доступну
      if (!defaultVariation && variationsData[0]) {
        variationsData[0].attributes?.forEach((attr) => {
          if (attr.slug === "pa_size") {
            setSelectedSize(attr.option);
          } else if (attr.slug === "pa_color") {
            setSelectedColor(attr.option);
          }
        });
      }
    }
    setVariationsLoading(false);
  }, [variationsData]);

  return {
    selectedSize,
    selectedColor,
    selectedVariation,
    availableSizes,
    availableColors,
    variationsLoading,
    setSelectedSize,
    setSelectedColor,
  };
}
