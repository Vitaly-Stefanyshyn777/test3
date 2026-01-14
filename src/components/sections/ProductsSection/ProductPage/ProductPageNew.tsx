"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useProductQuery } from "@/components/hooks/useProductsQuery";
import { useProductsByCategory } from "@/components/hooks/useFilteredProducts";
import { useProductGallery } from "@/components/hooks/useProductGallery";
import { useProductVariations } from "@/components/hooks/useProductVariations";
import { useProductActions } from "@/components/hooks/useProductActions";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import styles from "./ProductPage.module.css";
import FAQSection from "../../FAQSection/FAQSection";
import RegisterModal from "@/components/auth/RegisterModal/RegisterModal";
import { calculatePrice } from "@/lib/priceUtils";
import ProductPageSkeleton from "./ProductPageSkeleton";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import RelatedProducts from "./RelatedProducts";
import { СhevronIcon } from "@/components/Icons/Icons";
import {
  isNewProduct,
  isHitProduct,
  isBoardProduct,
  getFaqCategoryId,
  getStockStatusText,
  isProductAvailable,
} from "./utils";
import type { Product } from "@/lib/products";

export default function ProductPage({ productSlug }: { productSlug: string }) {
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useProductQuery(productSlug);

  const { data: relatedCategoryProducts = [] } = useProductsByCategory("30");
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Стан для розгорнутих секцій в ProductInfo
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    delivery: false,
    payment: false,
    return: false,
    characteristics: false,
  });
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Хук для галереї зображень
  const { selectedImageIndex, onThumbPrev, onThumbNext, selectImage } =
    useProductGallery(product?.images || [], isMobile || false);

  // Стан для варіацій продукту
  const [variationsData, setVariationsData] = useState<any[]>([]);
  const [variationsLoading, setVariationsLoading] = useState(false);

  // Завантаження варіацій продукту
  useEffect(() => {
    const loadVariations = async () => {
      if (!product?.wcProduct?.variations?.length) {
        setVariationsLoading(false);
        return;
      }

      setVariationsLoading(true);

      try {
        const variations = await Promise.all(
          product.wcProduct.variations
            .slice(0, 10)
            .map(async (variationId: number) => {
              const response = await fetch(
                `/api/wc/v3/products/${product.id}/variations/${variationId}`
              );
              if (!response.ok) return null;
              return response.json();
            })
        );

        const validVariations = variations.filter(Boolean);
        setVariationsData(validVariations);
      } catch (error) {
        console.warn("Не вдалося завантажити варіації продукту:", error);
      } finally {
        setVariationsLoading(false);
      }
    };

    if (product?.wcProduct?.variations?.length) {
      loadVariations();
    } else {
      setVariationsData([]);
      setVariationsLoading(false);
    }
  }, [product]);

  // Хук для варіацій продукту
  const {
    selectedVariation,
    availableSizes,
    availableColors,
    setSelectedSize,
    setSelectedColor,
  } = useProductVariations(variationsData, product?.attributes);

  // Хук для дій з товаром
  const { quantity, isAddingToCart, isFavorite, addToCart, toggleFavorite } =
    useProductActions(product || null, selectedVariation, isLoggedIn);

  const handleRegisterOpen = useCallback(() => {
    setIsRegisterOpen(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ВИКОРИСТОВУЄМО useMemo ЗАВЖДИ перед умовним return
  const isActuallyNew = useMemo(
    () => isNewProduct(product?.dateCreated || ""),
    [product?.dateCreated]
  );

  const isActuallyHit = useMemo(
    () => isHitProduct(product as any, relatedCategoryProducts as any),
    [product, relatedCategoryProducts]
  );

  const priceCalculation = useMemo(
    () =>
      calculatePrice({
        price: selectedVariation?.price || product?.price || 0,
        regularPrice:
          selectedVariation?.regular_price || product?.regularPrice || "",
        isLoggedIn,
      }),
    [
      selectedVariation?.price,
      selectedVariation?.regular_price,
      product?.price,
      product?.regularPrice,
      isLoggedIn,
    ]
  );

  const { finalPrice, originalPrice, totalDiscount, shouldShowOldPrice } =
    priceCalculation;
  const hasDiscount = totalDiscount > 0;

  const faqCategoryId = useMemo(
    () => (product ? getFaqCategoryId(product) : undefined),
    [product]
  );
  const isAvailable = useMemo(
    () => (product ? isProductAvailable(product) : false),
    [product]
  );
  const stockStatusText = useMemo(
    () => getStockStatusText(product?.stockStatus || "instock"),
    [product?.stockStatus]
  );
  const isControlsDisabled = !isAvailable;
  const isOutOfStock = product?.stockStatus === "outofstock";

  const cartItems = useCartStore((s) => s.items);
  const productId = product?.id?.toString() || productSlug;
  const cartQuantity = cartItems[productId]?.quantity || 0;

  // УМОВНИЙ РЕНДЕРИНГ ТІЛЬКИ В RETURN
  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className={`${styles.productPage} ${styles.error}`}>
        <div className={styles.loading}>
          {error ? "Помилка завантаження товару" : "Товар не знайдено"}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.productPage} ${
        isOutOfStock ? styles.productPageOutOfStock : ""
      }`}
    >
      <div className={styles.productContainer}>
        {/* Галерея зображень */}
        <ProductGallery
          images={product?.images || []}
          productName={product?.name || ""}
          isMobile={isMobile || false}
          isActuallyNew={isActuallyNew}
          hasDiscount={hasDiscount}
          totalDiscount={totalDiscount}
          isActuallyHit={isActuallyHit}
        />

        {/* Інформація про товар */}
        <ProductInfo
          product={product}
          variationsData={variationsData}
          attributes={product?.attributes}
          selectedVariation={selectedVariation}
          selectedImageIndex={selectedImageIndex}
          onImageSelect={selectImage}
          isActuallyHit={isActuallyHit}
          isMobile={isMobile || false}
          isLoggedIn={isLoggedIn}
          isBoardProduct={isBoardProduct(product)}
          isAvailable={isAvailable}
          stockStatusText={stockStatusText}
          isControlsDisabled={isControlsDisabled}
          cartQuantity={cartQuantity}
          variationsLoading={false}
          finalPrice={finalPrice}
          originalPrice={originalPrice}
          shouldShowOldPrice={shouldShowOldPrice}
          onRegisterOpen={handleRegisterOpen}
          expandedSections={expandedSections}
          onToggleSection={(section) => {
            setExpandedSections((prev) => ({
              ...prev,
              [section]: !prev[section],
            }));
          }}
        />
      </div>

      <FAQSection categoryId={faqCategoryId} />

      {/* Пов'язані товари */}
      <RelatedProducts
        relatedCategoryProducts={relatedCategoryProducts as any}
        isMobile={isMobile || false}
      />

      {!isLoggedIn && (
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />
      )}

      {/* Overlay для товарів, яких немає в наявності */}
      {isOutOfStock && (
        <div className={styles.outOfStockOverlay}>Немає в наявності</div>
      )}
    </div>
  );
}
