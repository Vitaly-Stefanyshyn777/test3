"use client";
import React from "react";
import { useAuthStore } from "@/store/auth";
import Image from "next/image";
import Link from "next/link";
import styles from "./CourseCard.module.css";
import FavoriteButton from "@/components/ui/Buttons/FavoriteButton";
import CartButton from "@/components/ui/Buttons/CartButton";
import Badge from "@/components/ui/Badge/Badge";
import BadgeContainer from "@/components/ui/Badge/BadgeContainer";
import SubscriptionBadge from "@/components/ui/SubscriptionBadge/SubscriptionBadge";

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
  const favoriteKey = `course-${id}`;
  const cartKey = `course-${id}`;
  const imageUrl = image || "/placeholder.svg";

  const isNewProduct = (dateCreated?: string) => {
    if (!dateCreated) return false;
    const createdDate = new Date(dateCreated);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return createdDate > thirtyDaysAgo;
  };

  const isHitProduct = (
    wcProduct?: {
      total_sales?: number;
    },
    allProducts?: Array<{ total_sales?: number }>
  ) => {
    if (!wcProduct || !allProducts?.length) return false;

    const totalSales = parseInt(wcProduct.total_sales?.toString() || "0");
    if (totalSales === 0) return false;

    const salesValues = allProducts
      .map((p) => parseInt(p.total_sales?.toString() || "0"))
      .filter((sales) => sales > 0)
      .sort((a, b) => b - a);

    if (salesValues.length === 0) return false;

    const top10Index = Math.min(9, salesValues.length - 1);
    const topSalesThreshold = salesValues[top10Index];

    return totalSales >= topSalesThreshold;
  };

  // Функція для форматування ціни
  const formatPrice = (price: string | number | undefined): string => {
    if (!price) return "0";
    const priceValue = parseFloat(price.toString());
    if (isNaN(priceValue)) return "0";
    return priceValue.toLocaleString("uk-UA");
  };

  const currentPrice =
    wcProduct?.prices?.price &&
    wcProduct.prices.price !== "0" &&
    wcProduct.prices.price !== ""
      ? wcProduct.prices.price
      : price.toString();

  const regularPrice =
    wcProduct?.prices?.regular_price &&
    wcProduct.prices.regular_price !== "0" &&
    wcProduct.prices.regular_price !== ""
      ? wcProduct.prices.regular_price
      : originalPrice?.toString() || "0";

  const salePrice =
    wcProduct?.prices?.sale_price &&
    wcProduct.prices.sale_price !== "0" &&
    wcProduct.prices.sale_price !== ""
      ? wcProduct.prices.sale_price
      : null;

  const isOnSale = wcProduct?.on_sale || false;

  const formattedCurrentPrice = formatPrice(currentPrice);
  const formattedRegularPrice = formatPrice(regularPrice);
  const formattedSalePrice = salePrice ? formatPrice(salePrice) : null;

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const authDiscount = 0.2;

  const basePrice = salePrice || currentPrice || regularPrice;

  const baseDiscount =
    salePrice && regularPrice
      ? ((parseFloat(regularPrice) - parseFloat(salePrice)) /
          parseFloat(regularPrice)) *
        100
      : currentPrice &&
        regularPrice &&
        parseFloat(currentPrice) < parseFloat(regularPrice)
      ? ((parseFloat(regularPrice) - parseFloat(currentPrice)) /
          parseFloat(regularPrice)) *
        100
      : 0;

  const finalPrice = basePrice
    ? isLoggedIn
      ? parseFloat(basePrice) * (1 - authDiscount)
      : parseFloat(basePrice)
    : 0;

  const totalDiscount =
    regularPrice && finalPrice
      ? ((parseFloat(regularPrice) - finalPrice) / parseFloat(regularPrice)) *
        100
      : 0;

  const isActuallyNew = isNewProduct(dateCreated) || isNew;
  const isActuallyHit =
    wcProduct && allProducts?.length
      ? isHitProduct(wcProduct, allProducts)
      : isHit;

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
            ? totalDiscount > 0 && (
                <Badge
                  variant="discount"
                  text={`-${Math.round(totalDiscount)}%`}
                />
              )
            : baseDiscount > 0 && (
                <Badge
                  variant="discount"
                  text={`-${Math.round(baseDiscount)}%`}
                />
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
            <span className={styles.reviewsCount}>({reviewsCount || 0})</span>
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
                <>
                  {finalPrice > 0 && (
                    <span className={styles.currentPrice}>
                      <span className={styles.currentPriceValue}>
                        {formatPrice(finalPrice.toString())}
                      </span>
                      <span className={styles.priceCurrency}>₴</span>
                    </span>
                  )}
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
                  {salePrice &&
                    regularPrice &&
                    parseFloat(regularPrice) > 0 && (
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
