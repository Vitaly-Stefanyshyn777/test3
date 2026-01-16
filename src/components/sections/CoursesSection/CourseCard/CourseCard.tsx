"use client";
import React from "react";
import { useAuthStore } from "@/store/auth";
import Image from "next/image";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/imageUtils";
import styles from "./CourseCard.module.css";
import FavoriteButton from "@/components/ui/Buttons/FavoriteButton";
import CartButton from "@/components/ui/Buttons/CartButton";
import Badge from "@/components/ui/Badge/Badge";
import BadgeContainer from "@/components/ui/Badge/BadgeContainer";
import SubscriptionBadge from "@/components/ui/SubscriptionBadge/SubscriptionBadge";
import { calculatePrice, formatPrice, getPriceSellRegistry } from "@/lib/priceUtils";

interface CourseCardProps {
  id: string;
  slug?: string;
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
  allProducts?: Array<{ total_sales?: number }>;
  acf?: Record<string, unknown>;
  metaData?: Array<{ key: string; value: string }>;
}

const getHref = (id: string, slug?: string) => {
  if (slug && slug.trim() !== "" && !/^\d+$/.test(slug)) {
    let processedSlug = slug;
    if (slug.includes("%")) {
      try {
        processedSlug = decodeURIComponent(slug);
      } catch {
        processedSlug = slug;
      }
    }

    if (processedSlug.trim() !== "" && !/^\d+$/.test(processedSlug)) {
      return `/courses/${processedSlug}`;
    }
  }

  return `/courses/${id}`;
};

const CourseCard = ({
  id,
  slug,
  name,
  description,
  price = 0,
  originalPrice: propOriginalPrice = 0,
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
  acf,
  metaData,
}: CourseCardProps) => {
  const favoriteKey = `course-${id}`;
  const cartKey = `course-${id}`;
  const imageUrl = normalizeImageUrl(image);

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

  // Використовуємо уніфіковані функції з priceUtils

  const currentPrice =
    wcProduct?.prices?.price &&
    wcProduct.prices.price !== "0" &&
    wcProduct.prices.price !== "" &&
    wcProduct.prices.price.trim() !== ""
      ? wcProduct.prices.price
      : price !== undefined &&
        price !== null &&
        price.toString() !== "0" &&
        price.toString() !== "" &&
        price.toString().trim() !== ""
      ? price.toString()
      : "0";

  const regularPrice =
    wcProduct?.prices?.regular_price &&
    wcProduct.prices.regular_price !== "0" &&
    wcProduct.prices.regular_price !== "" &&
    wcProduct.prices.regular_price.trim() !== ""
      ? wcProduct.prices.regular_price
      : propOriginalPrice !== undefined &&
        propOriginalPrice !== null &&
        propOriginalPrice.toString() !== "0" &&
        propOriginalPrice.toString() !== "" &&
        propOriginalPrice.toString().trim() !== ""
      ? propOriginalPrice.toString()
      : "0";

  const salePrice =
    wcProduct?.prices?.sale_price &&
    wcProduct.prices.sale_price !== "0" &&
    wcProduct.prices.sale_price !== ""
      ? wcProduct.prices.sale_price
      : null;

  const isOnSale = wcProduct?.on_sale || false;

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const priceSellRegistry = getPriceSellRegistry({
    acf,
    metaData,
    meta_data: metaData,
  });

  const priceCalculation = calculatePrice({
    price: parseFloat(salePrice || currentPrice || "0"),
    regularPrice: regularPrice ? parseFloat(regularPrice) : undefined,
    isLoggedIn,
    priceSellRegistry,
  });

  const {
    finalPrice,
    originalPrice: calculatedOriginalPrice,
    totalDiscount,
    shouldShowOldPrice,
  } = priceCalculation;


  // Форматовані ціни для відображення
  const formattedCurrentPrice = formatPrice(currentPrice);
  const formattedRegularPrice = shouldShowOldPrice
    ? formatPrice(calculatedOriginalPrice)
    : null;
  const formattedSalePrice = salePrice ? formatPrice(salePrice) : null;
  const formattedFinalPrice = formatPrice(finalPrice);

  const isActuallyNew = isNewProduct(dateCreated) || isNew;
  const isActuallyHit =
    wcProduct && allProducts?.length
      ? isHitProduct(wcProduct, allProducts)
      : isHit;

  // Використовуємо стан авторизації для розрахунку цін (вже оголошений вище)

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
    <Link href={getHref(id, slug)} className={styles.productCard}>
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
          {totalDiscount > 0 && (
            <Badge
              variant="discount"
              text={`-${Math.round(totalDiscount)}%`}
            />
          )}
          {isActuallyHit && <Badge variant="hit" />}
        </BadgeContainer>

        <FavoriteButton
          id={favoriteKey}
          name={name}
          price={price || 0}
          originalPrice={
            regularPrice ? parseFloat(regularPrice) : calculatedOriginalPrice
          }
          image={image}
          className={styles.favoriteBtn}
          activeClassName={styles.favoriteActive}
          wcProduct={
            wcProduct
              ? {
                  prices: {
                    price: wcProduct.prices?.price || currentPrice || "0",
                    regular_price:
                      wcProduct.prices?.regular_price || regularPrice || "0",
                    sale_price:
                      wcProduct.prices?.sale_price || salePrice || "0",
                  },
                  on_sale: wcProduct.on_sale || isOnSale,
                }
              : undefined
          }
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
                (courseData?.excerpt?.rendered
                  ? stripTags(courseData.excerpt.rendered)
                  : null) ||
                  stripTags(description) ||
                  "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи"
              )}
            </p>
          </div>
          {/* <div className={styles.rating}>
            {renderStars(rating || 0)}
            <span className={styles.reviewsCount}>({reviewsCount || 0})</span>
          </div> */}
          <div className={styles.metaInfo}>
            {/* 1. requirementsBadge (order: 1 на мобільному) */}
            {(courseData?.Required_equipment || requirements) && (
              <div className={styles.requirements}>
                <span className={styles.requirementsBadge}>
                  {courseData?.Required_equipment || requirements}
                </span>
              </div>
            )}

            {/* 2. rating (order: 2 на мобільному) */}
            <div className={styles.rating}>
              {renderStars(rating || 0)}
              <span className={styles.reviewsCount}>({reviewsCount || 0})</span>
            </div>
          </div>{" "}
          {/* Кінець styles.metaInfo */}
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
                  <span className={styles.currentPrice}>
                    <span className={styles.currentPriceValue}>
                      {formattedFinalPrice}
                    </span>
                    <span className={styles.priceCurrency}></span>
                  </span>
                  {regularPrice &&
                    parseFloat(regularPrice) > 0 &&
                    totalDiscount > 0 && (
                      <span className={styles.originalPrice}>
                        <span className={styles.originalPriceValue}>
                          {formattedRegularPrice}
                        </span>
                      </span>
                    )}
                </>
              ) : (
                <>
                  <span className={styles.currentPrice}>
                    <span className={styles.currentPriceValue}>
                      {formattedSalePrice || formattedCurrentPrice || "0"}
                    </span>
                  </span>
                  {salePrice &&
                    regularPrice &&
                    parseFloat(regularPrice) > 0 && (
                      <span className={styles.originalPrice}>
                        <span className={styles.originalPriceValue}>
                          {formattedRegularPrice}
                        </span>
                      </span>
                    )}
                </>
              )}
            </div>
          </div>

          <CartButton
            id={cartKey}
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
                : propOriginalPrice
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
            className={styles.cartBtn}
            activeClassName={styles.cartBtnActive}
          />
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
