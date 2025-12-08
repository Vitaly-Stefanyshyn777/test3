"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./ProductsGrid.module.css";
import productCardStyles from "../ProductCard/ProductCard.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const ProductsGridSkeleton: React.FC = () => {
  const renderProductCardSkeleton = () => (
    <div className={productCardStyles.productCard}>
      <div className={productCardStyles.cardImage}>
        <Skeleton height={251} width="100%" />
        <div
          className={productCardStyles.badges}
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            gap: "6px",
          }}
        >
          <Skeleton width={70} height={36} borderRadius={10} />
        </div>
        <Skeleton
          circle
          width={48}
          height={48}
          className={productCardStyles.favoriteBtn}
          style={{ position: "absolute", top: "25px", right: "25px" }}
        />
      </div>
      <div className={productCardStyles.cardContent}>
        <Skeleton
          width="90%"
          height={24}
          style={{ marginBottom: "16px" }}
          className={productCardStyles.productName}
        />
        <div className={productCardStyles.subscriptionBlock}>
          <div className={productCardStyles.subscriptionPrice}>
            <div className={productCardStyles.subscriptionDiscount}>
              <Skeleton width={140} height={24} borderRadius={6} />
            </div>
            <div className={productCardStyles.pricing}>
              <Skeleton width={100} height={24} />
              <Skeleton width={80} height={20} />
            </div>
          </div>
          <Skeleton
            width={48}
            height={48}
            borderRadius={12}
            className={productCardStyles.cartBtn}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.productsGrid}>
      {[...Array(16)].map((_, i) => (
        <React.Fragment key={i}>{renderProductCardSkeleton()}</React.Fragment>
      ))}
    </div>
  );
};

export default ProductsGridSkeleton;
