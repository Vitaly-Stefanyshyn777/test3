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
import {
  calculatePrice,
  formatPrice as formatPriceUtil,
  AUTH_DISCOUNT,
} from "@/lib/priceUtils";

// import { useProductPrices } from "@/lib/useProductPrices"; // Тимчасово закоментовано для спрощення

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
  stockQuantity?: number | null; // Кількість товару в наявності
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
  useRedGreenIconOnMobile?: boolean; // для використання червоно-зеленої іконки на мобільній версії в FavoritesModal
  removeFromFavoritesOnAddToCart?: boolean; // чи видаляти товар з favorites при додаванні в кошик
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
  stockStatus,
  stockQuantity,
  dateCreated,
  sku,
  wcProduct,
  allProducts,
  isNoCertificationFilter = false,
  isFluid = false,
  useRedGreenIconOnMobile = false,
  removeFromFavoritesOnAddToCart = false,
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

  // Спрощена логіка цін - використовуємо тільки передані пропси без API запитів
  const priceFromApi = price || 0;
  const originalPriceFromApi = originalPrice;
  const isPriceLoading = false;

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart) {
      removeItem(id);
    } else {
      // Спрощена логіка цін для додавання в кошик
      const priceToAdd = parseFloat(currentPrice);
      const finalOriginalPrice = hasRealDiscount
        ? parseFloat(regularPrice!)
        : undefined;

      try {
        await addItem(
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
            stockQuantity,
          },
          1
        );
      } catch (error) {
        alert((error as Error).message);
        return;
      }
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

  // Для основних товарів - тільки основна ціна, без знижок
  // Якщо є originalPrice > price, то це знижка, інакше - просто ціна
  const hasRealDiscount =
    originalPriceFromApi && originalPriceFromApi > priceFromApi;

  const currentPrice =
    priceFromApi > 0 ? priceFromApi.toString() : price?.toString() || "0";
  const regularPrice = hasRealDiscount ? originalPriceFromApi.toString() : null;
  const salePrice = hasRealDiscount ? currentPrice : null;

  // Спрощена логіка знижок
  const hasDiscount = salePrice && regularPrice && salePrice !== regularPrice;
  const finalDiscount =
    hasDiscount && salePrice && regularPrice
      ? calculateDiscount(salePrice, regularPrice)
      : discount || 0;

  // Логіка цін з урахуванням авторизації через priceUtils
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // Визначаємо базову ціну (пріоритет: salePrice -> currentPrice)
  const basePrice = salePrice || currentPrice || "0";
  const basePriceNum = parseFloat(basePrice) || 0;

  // Використовуємо calculatePrice з priceUtils
  const priceCalculation = calculatePrice({
    price: basePriceNum,
    regularPrice: regularPrice ? parseFloat(regularPrice) : undefined,
    isLoggedIn,
  });

  const {
    finalPrice,
    originalPrice: calculatedOriginalPrice,
    totalDiscount,
    shouldShowOldPrice,
  } = priceCalculation;

  // Форматуємо ціни для відображення
  const formattedFinalPrice = Number.isFinite(finalPrice)
    ? formatPriceUtil(finalPrice)
    : "0";
  const formattedRegularPrice =
    calculatedOriginalPrice > 0
      ? formatPriceUtil(calculatedOriginalPrice)
      : regularPrice
      ? formatPrice(regularPrice)
      : null;
  const formattedSalePrice = salePrice ? formatPrice(salePrice) : null;
  const formattedCurrentPrice = currentPrice ? formatPrice(currentPrice) : null;

  // Визначаємо, чи показувати знижку
  const showDiscount = totalDiscount > 0;

  // Логіка для підписки (якщо потрібно)
  const subscriptionPrice = isLoggedIn ? finalPrice : null;

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

  // Перевіряємо чи товар відсутній в наявності
  const isOutOfStock = stockStatus === "outofstock";

  return (
    <Link
      href={getHref()}
      className={`${styles.productCard} ${
        isFluid ? styles.productCardFluid : ""
      } ${isOutOfStock ? styles.productCardOutOfStock : ""}`}
      data-category={hasNoCertification ? "78" : undefined}
      data-outofstock={isOutOfStock ? "true" : undefined}
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
          {isActuallyNew && <Badge variant="new" />}
          {totalDiscount > 0 && (
            <Badge variant="discount" text={`-${Math.round(totalDiscount)}%`} />
          )}
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
          useRedGreenIconOnMobile={useRedGreenIconOnMobile}
          wcProduct={
            wcProduct
              ? {
                  prices: {
                    price: wcProduct.price || currentPrice || "0",
                    regular_price:
                      wcProduct.regular_price || regularPrice || "0",
                    sale_price: wcProduct.sale_price || salePrice || "0",
                  },
                  on_sale: wcProduct.on_sale,
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
                  -{Math.round(AUTH_DISCOUNT * 100)}% з підпискою
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
                    {/* <span className={styles.priceCurrency}>₴</span> */}
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
                    {/* <span className={styles.priceCurrency}>₴</span> */}
                  </span>
                  {formattedRegularPrice &&
                    totalDiscount > 0 &&
                    formattedCurrentPrice !== formattedRegularPrice && (
                      <span className={styles.originalPrice}>
                        <span className={styles.originalPriceValue}>
                          {formattedRegularPrice}
                        </span>
                        {/* <span className={styles.originalPriceCurrency}>₴</span> */}
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
            regularPrice={
              regularPrice && parseFloat(regularPrice) > 0
                ? parseFloat(regularPrice)
                : undefined
            }
            salePrice={
              salePrice && parseFloat(salePrice) > 0
                ? parseFloat(salePrice)
                : undefined
            }
            image={imageUrl}
            removeFromFavoritesOnAddToCart={removeFromFavoritesOnAddToCart}
            requireAuth={false} // Продукти не вимагають авторизації
            className={`${styles.cartBtn} ${
              isNoCertificationProduct ? styles.cartBtnNoCert : ""
            }`}
            activeClassName={styles.cartBtnActive}
          />
        </div>

        {/* Overlay для товарів, яких немає в наявності */}
        {isOutOfStock && (
          <div className={styles.outOfStockOverlay}>Немає в наявності</div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
