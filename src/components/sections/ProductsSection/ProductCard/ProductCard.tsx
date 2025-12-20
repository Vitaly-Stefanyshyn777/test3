"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProductCard.module.css";
import { FavoriteHeader, BasketIcon, Smitnik2Icon } from "../../../Icons/Icons";
import FavoriteButton from "@/components/ui/Buttons/FavoriteButton";
import CartButton from "@/components/ui/Buttons/CartButton";
import Badge from "@/components/ui/Badge/Badge";
import BadgeContainer from "@/components/ui/Badge/BadgeContainer";
import SubscriptionBadge from "@/components/ui/SubscriptionBadge/SubscriptionBadge";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useFavoriteStore } from "@/store/favorites";
import { selectIsFavorite } from "@/store/favorites";
import { FavoriteIcon } from "../../../Icons/Icons";
import { normalizeImageUrl } from "@/lib/imageUtils";

import { useProductPrices } from "@/lib/useProductPrices";

interface ProductCardProps {
  id: string;
  slug?: string; // Slug для URL
  name: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  isNew?: boolean;
  isHit?: boolean;
  // isFavorite prop removed; we derive from store
  image?: string | string[] | Array<{ src: string }>;
  category?: string;
  categories?: Array<{ id: number; name: string; slug: string }>; // Категорії продукту
  stockStatus?: string;
  dateCreated?: string; // Дата створення продукту
  sku?: string; // Код товару (SKU)
  // WooCommerce v3 API data
  wcProduct?: {
    id: number;
    name: string;
    type: string;
    variations: number[];
    average_rating: string;
    rating_count: number;
    total_sales: number;
    featured: boolean;
    on_sale: boolean;
    price: string;
    regular_price: string;
    sale_price: string;
    images: Array<{ src: string; alt: string }>;
    sku?: string;
  };
  // All products for top 10 calculation
  allProducts?: Array<{ total_sales?: number }>;
  isNoCertificationFilter?: boolean; // Чи застосований фільтр "Немає сертифікації"
  isFluid?: boolean;
}

const ProductCard = ({
  id,
  slug,
  name,
  price = 0,
  originalPrice,
  discount,
  isNew = false,
  isHit = false,
  // remove isFavorite prop, derive below
  image,
  categories,
  dateCreated,
  sku,
  wcProduct,
  allProducts,
  isNoCertificationFilter = false,
  isFluid = false,
}: ProductCardProps) => {
  // const isLoggedIn = useAuthStore((s) => s.isLoggedIn); // moved below
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);
  const isInCart = cartItems[id] && cartItems[id].quantity > 0;
  const favorite = useFavoriteStore(selectIsFavorite(id));

  // Перевіряємо, чи продукт належить до категорії "НЕМАЄ СЕРТИФІКАЦІЇ" (78)
  const isNoCertificationProduct = categories?.some((cat) => cat.id === 78);

  // Отримуємо URL зображення з нормалізацією
  const imageUrl = normalizeImageUrl(wcProduct?.images?.[0]?.src || image);

  // Обробка помилок завантаження зображення
  const [imageError, setImageError] = React.useState(false);
  const handleImageError = () => {
    setImageError(true);
  };

  // Скидаємо помилку при зміні зображення
  React.useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  // Отримуємо ціни товару (з урахуванням варіацій)
  const {
    currentPrice: priceFromApi,
    originalPrice: originalPriceFromApi,
    isLoading: isPriceLoading,
  } = useProductPrices(id, wcProduct);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart) {
      removeItem(id);
    } else {
      // Зберігаємо базову ціну (без знижки авторизації), знижка застосовується при відображенні
      const priceToAdd = parseFloat(
        salePrice || currentPrice || regularPrice || price?.toString() || "0"
      );
      const finalOriginalPrice =
        regularPrice && parseFloat(regularPrice) > 0
          ? parseFloat(regularPrice)
          : originalPrice;

      addItem(
        {
          id,
          name,
          price: priceToAdd,
          originalPrice:
            finalOriginalPrice && finalOriginalPrice > priceToAdd
              ? finalOriginalPrice
              : undefined,
          image: imageUrl,
          sku: sku || wcProduct?.sku,
        },
        1
      );
    }
  };

  // Функція для форматування ціни (WooCommerce v3 повертає ціни у гривнях як рядок)
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (!price || Number.isNaN(num) || !Number.isFinite(num)) return "0";
    return num.toLocaleString("uk-UA");
  };

  // Функція для розрахунку знижки
  const calculateDiscount = (salePrice: string, regularPrice: string) => {
    if (!salePrice || !regularPrice || salePrice === regularPrice) return 0;
    return Math.round(
      ((parseFloat(regularPrice) - parseFloat(salePrice)) /
        parseFloat(regularPrice)) *
        100
    );
  };

  // Визначаємо ціни залежно від типу товару
  let currentPrice = "0";
  let regularPrice = "0";
  let salePrice: string | null = null;

  // Якщо ціни завантажені з API, використовуємо їх
  if (!isPriceLoading && priceFromApi > 0) {
    currentPrice = priceFromApi.toString();
    regularPrice = (originalPriceFromApi || priceFromApi).toString();
    salePrice =
      originalPriceFromApi && originalPriceFromApi > priceFromApi
        ? null
        : currentPrice;
  } else {
    // Fallback на стару логіку
    currentPrice =
      wcProduct?.price &&
      wcProduct.price !== "0" &&
      wcProduct.price !== "" &&
      wcProduct.price.trim() !== ""
        ? wcProduct.price
        : price !== undefined &&
          price !== null &&
          price.toString() !== "0" &&
          price.toString() !== "" &&
          price.toString().trim() !== ""
        ? price.toString()
        : "0";

    regularPrice =
      wcProduct?.regular_price &&
      wcProduct.regular_price !== "0" &&
      wcProduct.regular_price !== "" &&
      wcProduct.regular_price.trim() !== ""
        ? wcProduct.regular_price
        : originalPrice !== undefined &&
          originalPrice !== null &&
          originalPrice.toString() !== "0" &&
          originalPrice.toString() !== "" &&
          originalPrice.toString().trim() !== ""
        ? originalPrice.toString()
        : currentPrice;

    salePrice =
      wcProduct?.sale_price &&
      wcProduct.sale_price !== "0" &&
      wcProduct.sale_price !== ""
        ? wcProduct.sale_price
        : null;
  }

  const isOnSale = wcProduct?.on_sale || false;

  // Перевіряємо чи є знижка
  const hasDiscount =
    isOnSale && salePrice && regularPrice && salePrice !== regularPrice;
  const finalDiscount =
    hasDiscount && salePrice
      ? calculateDiscount(salePrice, regularPrice)
      : discount ||
        (isOnSale && originalPrice && price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0);

  // Логіка цін з урахуванням авторизації (відповідно до детального алгоритму)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const authDiscount = 0.2; // 20% знижка для авторизованих

  // 1. Обираємо базову ціну (пріоритет: salePrice -> currentPrice -> regularPrice)
  const basePrice = salePrice || currentPrice || regularPrice;

  // 2. Розраховуємо відсоток акційної знижки
  const baseDiscount = (() => {
    if (salePrice && regularPrice) {
      return (
        ((parseFloat(regularPrice) - parseFloat(salePrice)) /
          parseFloat(regularPrice)) *
        100
      );
    }
    if (currentPrice && regularPrice && currentPrice < regularPrice) {
      return (
        ((parseFloat(regularPrice) - parseFloat(currentPrice)) /
          parseFloat(regularPrice)) *
        100
      );
    }
    return 0;
  })();

  // 3. Якщо користувач авторизований - від базової ціни віднімаємо ще 20%
  const finalPrice = (() => {
    if (!basePrice) return 0;

    const basePriceNum = parseFloat(basePrice);
    if (isLoggedIn) {
      // Для авторизованих: від basePrice віднімаємо 20%
      return basePriceNum * (1 - authDiscount);
    } else {
      // Для неавторизованих: показуємо basePrice
      return basePriceNum;
    }
  })();

  // 4. Загальна знижка для бейджа (від regular_price до finalPrice)
  const totalDiscount =
    regularPrice && finalPrice
      ? ((parseFloat(regularPrice) - finalPrice) / parseFloat(regularPrice)) *
        100
      : 0;

  // Форматуємо ціни для відображення
  const formattedFinalPrice = Number.isFinite(finalPrice)
    ? formatPrice(finalPrice.toString())
    : "0";
  const formattedRegularPrice = regularPrice ? formatPrice(regularPrice) : null;
  const formattedSalePrice = salePrice ? formatPrice(salePrice) : null;
  const formattedCurrentPrice = currentPrice ? formatPrice(currentPrice) : null;

  // Визначаємо, чи показувати знижку
  const showDiscount = totalDiscount > 0;

  // Логіка для підписки (якщо потрібно)
  const subscriptionPrice =
    isLoggedIn && basePrice ? Math.round(parseFloat(basePrice) * 0.8) : null;
  const baseNumeric = salePrice || regularPrice;
  const authFinalDiscount =
    salePrice && regularPrice
      ? Math.round((1 - parseFloat(salePrice) / parseFloat(regularPrice)) * 100)
      : 0;
  const combinedDiscountPercent = isLoggedIn
    ? authFinalDiscount + 20
    : authFinalDiscount;

  // Безпечне форматування ціни (fallback)
  const formatPriceFallback = (priceValue: number) => {
    return priceValue ? priceValue.toLocaleString() : "0";
  };

  // Функція для розрахунку "Новинка" (30 днів – як у CourseCard)
  const isNewProduct = (dateCreated?: string) => {
    if (!dateCreated) return false;
    const createdDate = new Date(dateCreated);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return createdDate > thirtyDaysAgo;
  };

  // Визначаємо чи є продукт новинкою
  const isActuallyNew = isNewProduct(dateCreated) || isNew;

  // Функція для розрахунку "Хіт" на основі топ 10 продажів
  const isHitProduct = (
    wcProduct?: {
      average_rating?: string;
      rating_count?: number;
      total_sales?: number;
      featured?: boolean;
      on_sale?: boolean;
    },
    allProducts?: Array<{
      total_sales?: number;
      average_rating?: string;
      rating_count?: number;
      featured?: boolean;
      on_sale?: boolean;
    }>
  ) => {
    if (!wcProduct || !allProducts || allProducts.length === 0) return false;

    const totalSales = parseInt(wcProduct.total_sales?.toString() || "0");
    const rating = parseFloat(wcProduct.average_rating?.toString() || "0");
    const ratingCount = parseInt(wcProduct.rating_count?.toString() || "0");
    const isFeatured = wcProduct.featured;
    const isOnSaleFlag = wcProduct.on_sale;

    // Якщо немає продажів або рейтингів, не показуємо як хіт
    if (totalSales === 0) return false;

    // Визначаємо топ продукти за продажами (топ 20% або мінімум 3 продукти)
    const minTopProducts = Math.max(3, Math.floor(allProducts.length * 0.2));
    const salesValues = allProducts
      .map((p) => parseInt(p.total_sales?.toString() || "0"))
      .filter((sales) => sales > 0)
      .sort((a, b) => b - a)
      .slice(0, minTopProducts);

    const topSalesThreshold =
      salesValues.length > 0 ? Math.min(...salesValues) : 0;
    const currentProductSales = totalSales;

    // Визначаємо топ продукти за рейтингом (рейтинг >= 4.0 з мінімум 5 відгуками)
    const topRatingProducts = allProducts.filter((p) => {
      const prodRating = parseFloat(p.average_rating?.toString() || "0");
      const prodRatingCount = parseInt(p.rating_count?.toString() || "0");
      return prodRating >= 4.0 && prodRatingCount >= 5;
    });

    // Логіка визначення хіт продуктів:
    // 1. Топ за продажами (входить в топ 20% за продажами)
    const isTopBySales =
      currentProductSales >= topSalesThreshold && salesValues.length > 0;

    // 2. Високий рейтинг (рейтинг >= 4.0 з мінімум 5 відгуками)
    const isTopByRating = rating >= 4.0 && ratingCount >= 5;

    // 3. Featured продукти з хорошим рейтингом
    const isFeaturedHit = isFeatured && rating >= 3.5;

    // 4. Продукти зі знижкою, які мають хороші продажі або рейтинг
    const isSaleHit = isOnSaleFlag && (totalSales >= 10 || rating >= 3.5);

    const isHitResult =
      isTopBySales || isTopByRating || isFeaturedHit || isSaleHit || isHit;

    return isHitResult;
  };

  // Визначаємо чи є продукт хітом
  const isActuallyHit = isHitProduct(wcProduct, allProducts);

  // Перевіряємо чи є продукт в категорії "Немає сертифікату" (ID: 78)
  const hasNoCertification = categories?.some((cat) => cat.id === 78);

  // Визначаємо, чи показувати сіру кнопку
  const shouldShowDisabledButton =
    hasNoCertification || isNoCertificationFilter;

  // Визначаємо правильний URL для переходу
  const getHref = () => {
    if (slug && slug.trim() !== "" && !/^\d+$/.test(slug)) {
      // Якщо slug вже містить повний шлях (наприклад, /courses/123), використовуємо його
      if (slug.startsWith("/")) {
        return slug;
      }

      // Якщо slug містить URL-encoded символи, декодуємо його
      let processedSlug = slug;
      if (slug.includes("%")) {
        try {
          processedSlug = decodeURIComponent(slug);
        } catch {
          // Якщо декодування не вдалося, використовуємо оригінал
          processedSlug = slug;
        }
      }

      // Якщо оброблений slug не є числом (ID) і не порожній, використовуємо його
      if (processedSlug.trim() !== "" && !/^\d+$/.test(processedSlug)) {
        return `/products/${processedSlug}`;
      }
    }

    // Fallback до ID, якщо slug порожній, містить тільки цифри або відсутній
    return `/products/${id}`;
  };

  return (
    <Link
      href={getHref()}
      className={`${styles.productCard} ${
        isFluid ? styles.productCardFluid : ""
      }`}
      data-category={hasNoCertification ? "78" : undefined}
    >
      <div className={styles.cardImage}>
        <Image
          src={imageError ? "/placeholder.svg" : imageUrl}
          alt={name || "Товар без назви"}
          width={280}
          height={280}
          className={styles.productImage}
          onError={handleImageError}
        />

        <BadgeContainer>
          {isLoggedIn ? (
            // Авторизований: показуємо загальну знижку
            totalDiscount > 0 && (
              <Badge
                variant="discount"
                text={`-${Math.round(totalDiscount)}%`}
              />
            )
          ) : (
            // Неавторизований: показуємо лише акційну знижку (бейдж підписки перенесено до блоку ціни)
            <>
              {baseDiscount > 0 && (
                <Badge
                  variant="discount"
                  text={`-${Math.round(baseDiscount)}%`}
                />
              )}
            </>
          )}
          {isActuallyNew && <Badge variant="new" />}
          {isActuallyHit && <Badge variant="hit" />}
        </BadgeContainer>

        {/* Кнопка "Немає сертифікації" для категорії 78 */}
        {/* {hasNoCertification && (
          <div className={styles.noCertificationButton}>НЕМАЄ СЕРТИФІКАЦІЇ</div>
        )} */}

        <FavoriteButton
          id={id}
          slug={slug}
          name={name}
          price={price || 0}
          originalPrice={
            regularPrice ? parseFloat(regularPrice) : originalPrice
          }
          image={imageUrl}
          className={styles.favoriteBtn}
          activeClassName={styles.favoriteActive}
          wcProduct={
            wcProduct
              ? {
                  prices: {
                    price: wcProduct.price || currentPrice || "0",
                    regular_price:
                      wcProduct.regular_price || regularPrice || "0",
                    sale_price: wcProduct.sale_price || salePrice || "0",
                  },
                  on_sale: wcProduct.on_sale || isOnSale,
                }
              : undefined
          }
        />
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.productName}>{name || "Товар без назви"}</h3>
        <div className={styles.subscriptionBlock}>
          <div className={styles.subscriptionPrice}>
            {!isLoggedIn && (
              <div className={styles.subscriptionDiscount}>
                <SubscriptionBadge>
                  -{Math.round(authDiscount * 100)}% з підпискою
                </SubscriptionBadge>
              </div>
            )}

            <div className={styles.pricing}>
              {isPriceLoading ? (
                <>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonPrice}`}
                  ></div>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonOriginalPrice}`}
                  ></div>
                </>
              ) : isLoggedIn ? (
                <>
                  <span className={styles.currentPrice}>
                    <span className={styles.currentPriceValue}>
                      {formattedFinalPrice}
                    </span>
                    <span className={styles.priceCurrency}>₴</span>
                  </span>
                  {regularPrice &&
                    parseFloat(regularPrice) > 0 &&
                    totalDiscount > 0 && (
                      <span className={styles.originalPrice}>
                        <span className={styles.originalPriceValue}>
                          {formattedRegularPrice}
                        </span>
                        <span className={styles.originalPriceCurrency}>₴</span>
                      </span>
                    )}
                </>
              ) : (
                // Неавторизовані: показуємо нову ціну та стару ціну (якщо є різниця)
                <>
                  <span className={styles.currentPrice}>
                    <span className={styles.currentPriceValue}>
                      {formattedCurrentPrice || formattedFinalPrice}
                    </span>
                    <span className={styles.priceCurrency}>₴</span>
                  </span>
                  {formattedRegularPrice &&
                    totalDiscount > 0 &&
                    formattedCurrentPrice !== formattedRegularPrice && (
                      <span className={styles.originalPrice}>
                        <span className={styles.originalPriceValue}>
                          {formattedRegularPrice}
                        </span>
                        <span className={styles.originalPriceCurrency}>₴</span>
                      </span>
                    )}
                </>
              )}
            </div>
          </div>
          <CartButton
            id={id}
            name={name}
            price={
              // Зберігаємо базову ціну (без знижки авторизації), знижка застосовується при відображенні
              parseFloat(
                salePrice ||
                  currentPrice ||
                  regularPrice ||
                  price?.toString() ||
                  "0"
              )
            }
            originalPrice={
              regularPrice && parseFloat(regularPrice) > 0
                ? parseFloat(regularPrice)
                : originalPrice
            }
            image={imageUrl}
            className={`${styles.cartBtn} ${
              isNoCertificationProduct ? styles.cartBtnNoCert : ""
            }`}
            activeClassName={styles.cartBtnActive}
          />
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
