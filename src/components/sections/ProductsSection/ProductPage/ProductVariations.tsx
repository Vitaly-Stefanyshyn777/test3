"use client";
import React, { memo } from "react";
import Image from "next/image";
import { useProductVariations } from "@/components/hooks/useProductVariations";
import styles from "./ProductPage.module.css";
import type { ProductVariationsProps } from "./types";

const ProductVariations = memo(function ProductVariations({
  productType,
  attributes,
  images,
  variationsData,
  selectedImageIndex,
  onImageSelect,
}: ProductVariationsProps) {
  const {
    selectedSize,
    selectedColor,
    availableSizes,
    availableColors,
    setSelectedSize,
    setSelectedColor,
  } = useProductVariations(variationsData, attributes);

  // Показуємо секцію варіацій тільки якщо є варіації або відповідні атрибути
  const shouldShowVariations =
    (productType === "variable" ||
      availableColors.length > 0 ||
      images.length > 1) &&
    (availableColors.length > 0 || images.length > 1);

  const shouldShowSizes =
    (productType === "variable" || availableSizes.length > 0) &&
    availableSizes.length > 0;

  if (!shouldShowVariations && !shouldShowSizes) {
    return null;
  }

  return (
    <div className={styles.productDescriptionBlock}>
      {/* Секція кольорів */}
      {shouldShowVariations && (
        <div className={styles.colorSection}>
          <h3>Колір:</h3>
          <div className={styles.colorOptions}>
            {availableColors.length > 0
              ? availableColors.map((color) => {
                  // Перевіряємо, чи це URL фото (починається з http)
                  const isImageUrl =
                    typeof color === "string" && color.startsWith("http");

                  if (isImageUrl) {
                    // Відображаємо як фото
                    return (
                      <button
                        key={`color-${color}`}
                        className={`${styles.colorImageOption} ${
                          selectedColor === color ? styles.selected : ""
                        }`}
                        onClick={() => setSelectedColor(color)}
                        title="Колір з фото"
                      >
                        <Image
                          src={color}
                          alt="Колір варіації"
                          width={80}
                          height={80}
                          className={styles.colorImage}
                        />
                      </button>
                    );
                  } else {
                    // Відображаємо як текст
                    return (
                      <button
                        key={`color-${color}`}
                        className={`${styles.colorButton} ${
                          selectedColor === color ? styles.selected : ""
                        }`}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                      >
                        {color}
                      </button>
                    );
                  }
                })
              : images.map((img, index) => (
                  <button
                    key={`color-thumb-${index}`}
                    className={`${styles.colorImageOption} ${
                      selectedImageIndex === index ? styles.selected : ""
                    }`}
                    onClick={() => onImageSelect(index)}
                    title={img.alt || `Колір ${index + 1}`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt || "color option"}
                      width={80}
                      height={80}
                      className={styles.colorImage}
                    />
                  </button>
                ))}
          </div>
        </div>
      )}

      {/* Секція розмірів */}
      {shouldShowSizes && (
        <div className={styles.sizeSection}>
          <h3>Розмір:</h3>
          <div className={styles.sizeOptions}>
            {availableSizes.map((size) => (
              <button
                key={size}
                className={`${styles.sizeButton} ${
                  selectedSize === size ? styles.selected : ""
                }`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ProductVariations.displayName = "ProductVariations";

export default ProductVariations;
