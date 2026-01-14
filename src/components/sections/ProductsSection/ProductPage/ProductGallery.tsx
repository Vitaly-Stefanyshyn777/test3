"use client";
import React, { memo } from "react";
import Image from "next/image";
import { СhevronIcon } from "@/components/Icons/Icons";
import Badge from "@/components/ui/Badge/Badge";
import BadgeContainer from "@/components/ui/Badge/BadgeContainer";
import { normalizeImageUrl } from "@/lib/imageUtils";
import { useProductGallery } from "@/components/hooks/useProductGallery";
import styles from "./ProductPage.module.css";
import type { ProductGalleryProps } from "./types";

const ProductGallery = memo(function ProductGallery({
  images,
  productName,
  isMobile,
  isActuallyNew,
  hasDiscount,
  totalDiscount,
  isActuallyHit,
}: ProductGalleryProps) {
  const {
    selectedImageIndex,
    thumbsRef,
    shouldShowThumbNav,
    visibleThumbs,
    onThumbPrev,
    onThumbNext,
    selectImage,
  } = useProductGallery(images, isMobile);

  return (
    <div className={styles.imageSection}>
      <div
        className={`${styles.thumbnails} ${
          !shouldShowThumbNav ? styles.thumbnailsNoNav : ""
        }`}
        ref={thumbsRef}
      >
        {shouldShowThumbNav && (
          <button
            type="button"
            className={styles.thumbNavUp}
            onClick={onThumbPrev}
            aria-label="Попереднє зображення"
          >
            <СhevronIcon />
          </button>
        )}
        {visibleThumbs.map((globalIndex) => (
          <button
            key={`thumb-${globalIndex}`}
            className={`${styles.thumbnail} ${
              selectedImageIndex === globalIndex ? styles.active : ""
            }`}
            onClick={() => selectImage(globalIndex)}
          >
            <Image
              src={normalizeImageUrl(images[globalIndex]?.src)}
              alt={images[globalIndex]?.alt || productName}
              width={80}
              height={80}
              className={styles.thumbnailImage}
            />
          </button>
        ))}
        {shouldShowThumbNav && (
          <button
            type="button"
            className={styles.thumbNavDown}
            onClick={onThumbNext}
            aria-label="Наступне зображення"
          >
            <span className={styles.downRotate}>
              <СhevronIcon />
            </span>
          </button>
        )}
      </div>

      <div className={styles.mainImage}>
        <Image
          src={normalizeImageUrl(images[selectedImageIndex]?.src)}
          alt={productName}
          width={500}
          height={500}
          className={styles.productImage}
        />
        {/* Маркери на зображенні */}
        <BadgeContainer className={styles.imageBadges}>
          {isActuallyNew && (
            <Badge variant="new" className={styles.imageBadge} />
          )}
          {hasDiscount && (
            <Badge
              variant="discount"
              text={`-${Math.round(totalDiscount)}%`}
              className={styles.imageBadge}
            />
          )}
          {isActuallyHit && (
            <Badge variant="hit" className={styles.imageBadge} />
          )}
        </BadgeContainer>
      </div>
    </div>
  );
});

ProductGallery.displayName = "ProductGallery";

export default ProductGallery;
