"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./CoursesGrid.module.css";
import courseCardStyles from "../CourseCard/CourseCard.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const CoursesGridSkeleton: React.FC = () => {
  const renderCourseCardSkeleton = () => (
    <div className={courseCardStyles.productCard}>
      <div className={courseCardStyles.cardImage}>
        <Skeleton height="100%" width="100%" />
      </div>
      <div className={courseCardStyles.cardContent}>
        <div className={courseCardStyles.productInfo}>
          <div className={courseCardStyles.productInfoName}>
            <Skeleton
              width="80%"
              height={24}
              style={{ marginBottom: "12px" }}
              className={courseCardStyles.productName}
            />
            <Skeleton
              width="100%"
              height={16}
              count={2}
              style={{ marginBottom: "12px" }}
              className={courseCardStyles.description}
            />
          </div>
          <div className={courseCardStyles.rating}>
            <Skeleton width={100} height={16} />
          </div>
        </div>
        <div className={courseCardStyles.subscriptionPriceBlock}>
          <div className={courseCardStyles.subscriptionBlock}>
            <Skeleton width={150} height={20} style={{ marginBottom: "12px" }} />
            <div className={courseCardStyles.pricing}>
              <Skeleton width={120} height={28} />
            </div>
          </div>
          <Skeleton width="100%" height={48} borderRadius={12} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.productsGridContainer}>
      <div className={styles.productsGrid}>
        {[...Array(8)].map((_, i) => (
          <React.Fragment key={i}>{renderCourseCardSkeleton()}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CoursesGridSkeleton;

