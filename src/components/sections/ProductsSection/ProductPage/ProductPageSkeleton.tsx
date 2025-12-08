"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./ProductPage.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const ProductPageSkeleton: React.FC = () => {
  return (
    <div className={styles.productPage}>
      <div className={styles.productContainer}>
        {/* Image Section Skeleton */}
        <div className={styles.imageSection}>
          <div className={styles.thumbnails}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} width={96} height={96} borderRadius={8} />
            ))}
          </div>
          <div className={styles.mainImage} style={{ position: "relative" }}>
            <Skeleton width="100%" height={800} borderRadius={12} style={{ maxWidth: "800px", minHeight: "600px" }} />
            <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px", zIndex: 2 }}>
              <Skeleton width={70} height={36} borderRadius={10} />
              <Skeleton width={70} height={36} borderRadius={10} />
            </div>
          </div>
        </div>

        {/* Product Info Section Skeleton */}
        <div className={styles.productInfo}>
          <div className={styles.productInfoBlock}>
            <div className={styles.categoryTagBlock}>
              <Skeleton width={80} height={20} style={{ marginBottom: "16px" }} />
              <div className={styles.titleWithBadges}>
                <Skeleton width="70%" height={48} style={{ marginBottom: "16px" }} />
                <Skeleton width={60} height={24} borderRadius={6} />
              </div>
              <Skeleton count={3} width="100%" style={{ marginBottom: "24px" }} />
            </div>

            <div className={styles.productDescriptionBlock}>
              {/* Color Section Skeleton */}
              <div className={styles.colorSection}>
                <Skeleton width={80} height={20} style={{ marginBottom: "12px" }} />
                <div className={styles.colorOptions}>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} width={80} height={80} borderRadius={8} />
                  ))}
                </div>
              </div>

              {/* Size Section Skeleton */}
              <div className={styles.sizeSection}>
                <Skeleton width={100} height={20} style={{ marginBottom: "12px" }} />
                <div className={styles.sizeOptions}>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} width={100} height={40} borderRadius={8} />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.currenInfoBlock}>
              {/* Price Section Skeleton */}
              <div className={styles.priceSection}>
                <Skeleton width={150} height={40} style={{ marginBottom: "8px" }} />
                <Skeleton width={120} height={24} />
              </div>

              {/* Subscription Offer Skeleton */}
              <div className={styles.subscriptionOffer}>
                <Skeleton width={30} height={30} borderRadius={4} style={{ marginRight: "8px" }} />
                <Skeleton width="80%" height={16} count={2} />
              </div>

              {/* Action Buttons Skeleton */}
              <div className={styles.actionButtons}>
                <div className={styles.quantitySection}>
                  <Skeleton width={120} height={48} borderRadius={8} />
                </div>
                <div className={styles.addToCartBtnWrapper}>
                  <Skeleton width={200} height={48} borderRadius={8} />
                  <Skeleton width={48} height={48} borderRadius={8} />
                </div>
              </div>

              {/* Details Row Skeleton */}
              <div className={styles.detailsRow}>
                <Skeleton width={120} height={20} />
                <Skeleton width={150} height={20} />
              </div>
            </div>
          </div>

          {/* Expandable Sections Skeleton */}
          <div className={styles.expandableSections}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Skeleton width={150} height={24} />
                </div>
                <div className={styles.sectionContent}>
                  <Skeleton count={3} width="100%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className={styles.relatedProducts}>
        <div className={styles.relatedProductsHeader}>
          <Skeleton width={100} height={20} style={{ marginBottom: "8px" }} />
          <Skeleton width={300} height={32} />
        </div>
        <div className={styles.relatedGrid}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
              <Skeleton width="100%" height={251} borderRadius={16} style={{ marginBottom: "12px" }} />
              <Skeleton width="80%" height={20} style={{ marginBottom: "8px" }} />
              <Skeleton width="60%" height={24} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPageSkeleton;

