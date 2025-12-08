"use client";
import React from "react";
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
  const imageUrl = normalizeImageUrl(
    wcProduct?.images?.[0]?.src || image
  );
  
  // Обробка помилок завантаження зображення
  const [imageError, setImageError] = React.useState(false);
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Скидаємо помилку при зміні зображення
  React.useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart) {
      removeItem(id);
    } else {
      addItem({ 
        id, 
        name, 
        price: price || 0, 
        image: imageUrl,
        sku: sku || wcProduct?.sku,
      }, 1);
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

  // Визначаємо ціни та знижку з WooCommerce v3 API або fallback
  const currentPrice = wcProduct?.price || price.toString();
  const regularPrice = wcProduct?.regular_price || originalPrice?.toString();
  const salePrice = wcProduct?.sale_price;
  const isOnSale =
    wcProduct?.on_sale || (originalPrice && originalPrice > price);

  // Перевіряємо чи є знижка
  const hasDiscount =
    isOnSale && salePrice && regularPrice && salePrice !== regularPrice;
  const finalDiscount = hasDiscount
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
    allProducts?: Array<{ total_sales?: number }>
  ) => {
    if (!wcProduct || !allProducts || allProducts.length === 0) return false;

    const totalSales = parseInt(wcProduct.total_sales?.toString() || "0");
    const rating = parseFloat(wcProduct.average_rating?.toString() || "0");
    const isFeatured = wcProduct.featured;
    const isOnSaleFlag = wcProduct.on_sale;

    const salesValues = allProducts
      .map((p) => parseInt(p.total_sales?.toString() || "0"))
      .sort((a, b) => b - a)
      .slice(0, 10);
    const top10Sales = new Set(salesValues);
    const currentProductSales = parseInt(
      wcProduct.total_sales?.toString() || "0"
    );

    return (
      (totalSales >= 10 && rating >= 3.5) ||
      (isFeatured && rating >= 4.0) ||
      (isOnSaleFlag && totalSales >= 5) ||
      (isOnSaleFlag && rating >= 3.0) ||
      isOnSaleFlag ||
      top10Sales.has(currentProductSales) ||
      isHit
    );
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
    if (slug) {
      // Якщо slug вже містить повний шлях (наприклад, /courses/123), використовуємо його
      if (slug.startsWith("/")) {
        return slug;
      }
      return `/products/${slug}`;
    }
    return `/products/${id}`;
  };

  return (
    <Link
      href={getHref()}
      className={`${styles.productCard} ${isFluid ? styles.productCardFluid : ""}`}
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
              <Badge variant="discount" text={`-${Math.round(totalDiscount)}%`} />
            )
          ) : (
            // Неавторизований: показуємо лише акційну знижку (бейдж підписки перенесено до блоку ціни)
            <>
              {baseDiscount > 0 && (
                <Badge variant="discount" text={`-${Math.round(baseDiscount)}%`} />
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
          image={imageUrl}
          className={styles.favoriteBtn}
          activeClassName={styles.favoriteActive}
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
              {isLoggedIn ? (
                // Авторизовані: показуємо finalPrice та regularPrice (перекреслена)
                <div className={styles.subscriptionPriceAuth}>
                  {finalPrice > 0 && (
                    <span className={styles.subNewPrice}>
                      {formattedFinalPrice} ₴
                    </span>
                  )}
                  {regularPrice && parseFloat(regularPrice) > 0 && totalDiscount > 0 && (
                    <span className={styles.subOldPrice}>
                      {formattedRegularPrice} ₴
                    </span>
                  )}
                </div>
              ) : (
                // Неавторизовані: показуємо basePrice та regularPrice (якщо є знижка)
                <>
                  {(formattedSalePrice || formattedCurrentPrice || formattedRegularPrice) && (
                    parseFloat(salePrice || currentPrice || regularPrice || "0") > 0 && (
                      <span className={styles.currentPrice}>
                        {formattedSalePrice ||
                          formattedCurrentPrice ||
                          formattedRegularPrice} ₴
                      </span>
                    )
                  )}
                  {salePrice && regularPrice && parseFloat(regularPrice) > 0 && (
                    <span className={styles.originalPrice}>
                      {formattedRegularPrice} ₴
                    </span>
                  )}
                  {!hasDiscount && originalPrice && originalPrice > price && originalPrice > 0 && (
                    <span className={styles.originalPrice}>
                      {formatPriceFallback(originalPrice)} ₴
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <CartButton
            id={id}
            name={name}
            price={price || 0}
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
