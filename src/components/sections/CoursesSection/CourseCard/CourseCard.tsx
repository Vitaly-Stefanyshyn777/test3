"use client";
import React, { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useFavoriteStore, selectIsFavorite } from "@/store/favorites";
import Image from "next/image";
import Link from "next/link";
import styles from "./CourseCard.module.css";
import { FavoriteHeader, BasketIcon, SmitnikIcon } from "../../../Icons/Icons";
import FavoriteButton from "@/components/ui/Buttons/FavoriteButton";
import CartButton from "@/components/ui/Buttons/CartButton";
import Badge from "@/components/ui/Badge/Badge";
import BadgeContainer from "@/components/ui/Badge/BadgeContainer";
import SubscriptionBadge from "@/components/ui/SubscriptionBadge/SubscriptionBadge";
import { useCartStore } from "@/store/cart";
import { FavoriteIcon } from "../../../Icons/Icons";

interface CourseCardProps {
  id: string;
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  isNew?: boolean;
  isHit?: boolean;
  isFavorite?: boolean;
  image?: string;
  category?: string;
  stockStatus?: string;
  rating?: number;
  reviewsCount?: number;
  requirements?: string;
  subscriptionDiscount?: number;
  dateCreated?: string; // Дата створення для розрахунку "Новинка"
  courseData?: {
    excerpt?: { rendered: string };
    Required_equipment?: string;
    Course_coach?: {
      ID: number;
      title: string;
      input_text_experience?: string;
      input_text_status?: string;
      input_text_status_1?: string;
      input_text_status_2?: string;
      input_text_count_training?: string;
      input_text_history?: string;
      input_text_certificates?: string;
      input_text_link_instagram?: string;
      input_text_text_instagram?: string;
      textarea_description?: string;
      textarea_about_me?: string;
      textarea_my_mission?: string;
      img_link_avatar?: string;
      point_specialization?: string;
    };
    Course_themes?: string[];
    What_learn?: string[];
    Course_include?: string[];
    Course_program?: string[];
    Date_start?: string;
    Duration?: string;
    Blocks?: unknown;
    Online_lessons?: unknown;
  };
  wcProduct?: {
    prices?: {
      price: string;
      regular_price: string;
      sale_price: string;
    };
    on_sale?: boolean;
    average_rating?: string;
    rating_count?: number;
    total_sales?: number;
    featured?: boolean;
    is_purchasable?: boolean;
  };
  allProducts?: Array<{ total_sales?: number }>; // Для розрахунку топ продажів
}

const CourseCard = ({
  id,
  name,
  description,
  price = 5000,
  originalPrice = 7000,
  isNew = false,
  isHit = false,
  isFavorite = false,
  image,
  rating = 0,
  reviewsCount = 0,
  requirements = "",
  subscriptionDiscount = 20,
  dateCreated,
  courseData,
  wcProduct,
  allProducts = [],
}: CourseCardProps) => {
  // const isLoggedIn = useAuthStore((s) => s.isLoggedIn); // moved below
  // concise debug only
  const [favorite, setFavorite] = useState(isFavorite);
  const favoriteKey = `course-${id}`;
  const isFav = useFavoriteStore(selectIsFavorite(favoriteKey));
  const toggleFav = useFavoriteStore((s) => s.toggleFavorite);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);
  const cartKey = `course-${id}`;
  const inCart = !!cartItems[cartKey] && cartItems[cartKey].quantity > 0;

  const imageUrl = image || "/placeholder.svg";

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    toggleFav({ id: favoriteKey, name, price: price || 0, image });
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      removeItem(cartKey);
    } else {
      addItem({ id: cartKey, name, price: price || 0, image }, 1);
    }
  };

  // Функція для розрахунку "Новинка" (30 днів)
  const isNewProduct = (dateCreated?: string) => {
    if (!dateCreated) return false;
    const createdDate = new Date(dateCreated);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return createdDate > thirtyDaysAgo;
  };

  // Функція для розрахунку "Хіт" на основі топ 10 продажів
  const isHitProduct = (
    wcProduct?: {
      total_sales?: number;
      average_rating?: string;
      featured?: boolean;
      on_sale?: boolean;
    },
    allProducts?: Array<{ total_sales?: number }>
  ) => {
    if (!wcProduct || !allProducts || allProducts.length === 0) return false;

    const totalSales = parseInt(wcProduct.total_sales?.toString() || "0");
    const rating = parseFloat(wcProduct.average_rating?.toString() || "0");
    const isFeatured = wcProduct.featured;
    const isOnSale = wcProduct.on_sale;

    // Отримуємо топ 10 продажів
    const salesValues = allProducts
      .map((p) => parseInt(p.total_sales?.toString() || "0"))
      .sort((a, b) => b - a)
      .slice(0, 10);

    const top10Sales = new Set(salesValues);
    const currentProductSales = parseInt(
      wcProduct.total_sales?.toString() || "0"
    );

    // Складна логіка для визначення хіта
    return (
      (totalSales >= 10 && rating >= 3.5) ||
      (isFeatured && rating >= 4.0) ||
      (isOnSale && totalSales >= 5) ||
      (isOnSale && rating >= 3.0) ||
      isOnSale ||
      top10Sales.has(currentProductSales)
    );
  };

  // Функція для форматування ціни
  const formatPrice = (
    price: string | number | undefined,
    isWcPrice: boolean = false
  ): string => {
    if (!price || isNaN(parseFloat(price.toString()))) return "0";
    const priceValue = parseFloat(price.toString());
    if (isNaN(priceValue)) return "0";
    // WooCommerce ціни в копійках, fallback ціни в гривнях
    return (isWcPrice ? priceValue / 100 : priceValue).toLocaleString("uk-UA");
  };

  // Функція для розрахунку знижки (як в ProductCard)
  const calculateDiscount = (salePrice: string, regularPrice: string) => {
    if (!salePrice || !regularPrice || salePrice === regularPrice) return 0;
    return Math.round(
      ((parseFloat(regularPrice) - parseFloat(salePrice)) /
        parseFloat(regularPrice)) *
        100
    );
  };

  // Визначаємо ціни та знижку з WooCommerce API або fallback
  const currentPrice = wcProduct?.prices?.price || price.toString();
  const regularPrice =
    wcProduct?.prices?.regular_price || originalPrice?.toString();
  const salePrice = wcProduct?.prices?.sale_price;
  const isOnSale =
    wcProduct?.on_sale || (originalPrice && originalPrice > price);

  // Форматуємо ціни (WooCommerce ціни в копійках)
  const formattedCurrentPrice = formatPrice(currentPrice, !!wcProduct);
  const formattedRegularPrice = formatPrice(regularPrice, !!wcProduct);
  const formattedSalePrice = salePrice
    ? formatPrice(salePrice, !!wcProduct)
    : null;

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

  // Перевіряємо чи є знижка (як в ProductCard)
  const hasDiscount =
    isOnSale && salePrice && regularPrice && salePrice !== regularPrice;

  // Додаткова перевірка для fallback цін
  const hasFallbackDiscount =
    !hasDiscount &&
    originalPrice &&
    price &&
    originalPrice > price &&
    price > 0;

  // Розраховуємо знижку на основі форматованих цін
  const finalDiscount = hasDiscount
    ? calculateDiscount(salePrice, regularPrice)
    : hasFallbackDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0; // Не показуємо знижку якщо немає реальних даних

  // Визначаємо чи є продукт новинкою
  const isActuallyNew = isNewProduct(dateCreated) || isNew;

  // Визначаємо чи є продукт хітом
  const isActuallyHit =
    wcProduct && allProducts ? isHitProduct(wcProduct, allProducts) : isHit;

  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trimEnd() + "..";
  };

  const stripTags = (html?: string | null) =>
    (html || "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${styles.star} ${
            i <= rating ? styles.starFilled : styles.starEmpty
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <Link href={`/courses/${id}`} className={styles.productCard}>
      <div className={styles.cardImage}>
        <Image
          src={imageUrl}
          alt={name}
          width={280}
          height={280}
          className={styles.productImage}
        />

        <BadgeContainer>
          {isActuallyNew && <Badge variant="new" />}
          {isLoggedIn
            ? // Авторизований: показуємо загальну знижку
              totalDiscount > 0 && (
                <Badge variant="discount" text={`-${Math.round(totalDiscount)}%`} />
              )
            : // Неавторизований: показуємо акційну знижку
              baseDiscount > 0 && (
                <Badge variant="discount" text={`-${Math.round(baseDiscount)}%`} />
              )}
          {isActuallyHit && <Badge variant="hit" />}
        </BadgeContainer>

        <FavoriteButton
          id={favoriteKey}
          name={name}
          price={price || 0}
          image={image}
          className={styles.favoriteBtn}
          activeClassName={styles.favoriteActive}
        />
      </div>

      <div className={styles.cardContent}>
        <div className={styles.productInfo}>
          <div className={styles.productInfoName}>
            <h3 className={styles.productName}>
              {name || "Тренер BFB: Базовий рівень"}
            </h3>

            <p className={styles.description}>
              {truncateDescription(
                stripTags(courseData?.excerpt?.rendered) ||
                  stripTags(description) ||
                  "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи"
              )}
            </p>
          </div>

          <div className={styles.rating}>
            {renderStars(rating || 0)}
            <span className={styles.reviewsCount}>
              ({reviewsCount || 0})
            </span>
          </div>

          {(courseData?.Required_equipment || requirements) && (
            <div className={styles.requirements}>
              <span className={styles.requirementsBadge}>
                {courseData?.Required_equipment || requirements}
              </span>
            </div>
          )}
        </div>
        <div className={styles.subscriptionPriceBlock}>
          <div className={styles.subscriptionBlock}>
            <div className={styles.subscriptionDiscount}>
              {!isLoggedIn && (
                <SubscriptionBadge>-20% з підпискою</SubscriptionBadge>
              )}
            </div>

            <div className={styles.pricing}>
              {isLoggedIn ? (
                // Авторизовані: показуємо finalPrice та regularPrice (перекреслена)
                <>
                  {finalPrice > 0 && (
                    <span className={styles.currentPrice}>
                      <span className={styles.currentPriceValue}>
                        {formatPrice(finalPrice.toString(), !!wcProduct)}
                      </span>
                      <span className={styles.priceCurrency}>₴</span>
                    </span>
                  )}
                  {regularPrice && parseFloat(regularPrice) > 0 && totalDiscount > 0 && (
                    <span className={styles.originalPrice}>
                      <span className={styles.originalPriceValue}>
                        {formattedRegularPrice}
                      </span>
                      <span className={styles.originalPriceCurrency}>₴</span>
                    </span>
                  )}
                </>
              ) : (
                // Неавторизовані: показуємо basePrice та regularPrice (якщо є знижка)
                <>
                  {(formattedSalePrice || formattedCurrentPrice) && 
                    parseFloat(salePrice || currentPrice || "0") > 0 && (
                    <span className={styles.currentPrice}>
                      <span className={styles.currentPriceValue}>
                        {formattedSalePrice || formattedCurrentPrice}
                      </span>
                      <span className={styles.priceCurrency}>₴</span>
                    </span>
                  )}
                  {salePrice && regularPrice && parseFloat(regularPrice) > 0 && (
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
            id={cartKey}
            name={name}
            price={price || 0}
            image={image}
            className={styles.cartBtn}
            activeClassName={styles.cartBtnActive}
          />
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
