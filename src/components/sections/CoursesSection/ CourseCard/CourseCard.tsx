"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ CourseCard.module.css";
import { FavoriteHeader, BasketHeader } from "../../../Icons/Icons";
import { FavoriteIcon } from "../../../Icons/Icons";
import Badge from "@/components/ui/Badge/Badge";
import BadgeContainer from "@/components/ui/Badge/BadgeContainer";
import SubscriptionBadge from "@/components/ui/SubscriptionBadge/SubscriptionBadge";
interface CourseCardProps {
  id: string;
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  isNew?: boolean;
  isHit?: boolean;
  isFavorite?: boolean;
  image?: string;
  category?: string;
  stockStatus?: string;
  rating?: number;
  reviewsCount?: number;
  requirements?: string;
}

const CourseCard = ({
  id,
  name,
  description = "Курс BFB — це сертифікаційна навчальна програма, яка дає не просто знання, а право стати частиною авторської системи тренувань.",
  price = 5000,
  originalPrice = 7000,
  discount = 5,
  isNew = true,
  isHit = true,
  isFavorite = false,
  image,
  rating = 3.5,
  reviewsCount = 235,
  requirements = "Для проходження потрібені гантелі",
}: CourseCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);

  const imageUrl = image || "/placeholder.svg";

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
  };

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const isOnSale = originalPrice && originalPrice > price;
  const finalDiscount =
    discount ||
    (isOnSale
      ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
      : 0);

  const formatPrice = (priceValue: number) => {
    return priceValue ? priceValue.toLocaleString() : "0";
  };

  const renderStars = (ratingValue: number) => {
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className={`${styles.star} ${styles.starFilled}`}>
            ★
          </span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className={`${styles.star} ${styles.starHalf}`}>
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className={`${styles.star} ${styles.starEmpty}`}>
            ★
          </span>
        );
      }
    }
    return stars;
  };

  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Link href={`/products/${id}`} className={styles.productCard}>
      <div className={styles.cardImage}>
        <Image
          src={imageUrl}
          alt={name}
          width={280}
          height={280}
          className={styles.productImage}
        />

        <BadgeContainer>
          {isNew && <Badge variant="new" />}
          {isHit && <Badge variant="hit" />}
          {finalDiscount > 0 && (
            <Badge variant="discount" text={`-${finalDiscount}%`} />
          )}
        </BadgeContainer>

        <button
          className={`${styles.favoriteBtn} ${
            favorite ? styles.favoriteActive : ""
          }`}
          onClick={toggleFavorite}
        >
          <FavoriteIcon />
        </button>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{name || "Товар без назви"}</h3>

          <p className={styles.productDescription}>
            {truncateDescription(description)}
          </p>

          <div className={styles.rating}>
            <div className={styles.stars}>{renderStars(rating)}</div>
            <span className={styles.reviewsCount}>({reviewsCount})</span>
          </div>

          <div className={styles.requirements}>
            <span className={styles.requirementsBadge}>{requirements}</span>
          </div>
        </div>

        <div className={styles.subscriptionBlock}>
          <div className={styles.subscriptionPrice}>
            {finalDiscount > 0 && (
              <div className={styles.subscriptionDiscountBlock}>
                <div className={styles.subscriptionDiscount}>
                  <SubscriptionBadge>
                    -{finalDiscount}% з підпискою
                  </SubscriptionBadge>
                </div>

                <div className={styles.pricing}>
                  <span className={styles.currentPrice}>
                    {formatPrice(price)} ₴
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className={styles.originalPrice}>
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            )}

            <button className={styles.cartBtn} onClick={addToCart}>
              <BasketHeader />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
