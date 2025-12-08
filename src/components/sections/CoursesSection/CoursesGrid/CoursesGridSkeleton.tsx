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
        <Skeleton height={251} width="100%" />
        {/* Бейджі як у справжній картці */}
        <div
          className={courseCardStyles.badges}
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            gap: "6px",
          }}
        >
          <Skeleton width={75} height={36} borderRadius={10} />
          <Skeleton width={55} height={36} borderRadius={10} />
          <Skeleton width={55} height={36} borderRadius={10} />
        </div>
        {/* Кнопка обраного */}
        <Skeleton
          circle
          width={48}
          height={48}
          className={courseCardStyles.favoriteBtn}
          style={{ position: "absolute", top: "25px", right: "25px" }}
        />
      </div>
      <div className={courseCardStyles.cardContent}>
        <div className={courseCardStyles.productInfo}>
          <div className={courseCardStyles.productInfoName}>
            <Skeleton
              width="90%"
              height={40}
              className={courseCardStyles.productName}
            />
          </div>
          <div className={courseCardStyles.rating}>
            <Skeleton
              width={120}
              height={16}
              style={{ marginBottom: "60px" }}
            />
          </div>
        </div>
        <div className={courseCardStyles.subscriptionPriceBlock}>
          <div className={courseCardStyles.subscriptionBlock}>
            <Skeleton width={115} height={20} />
            <div className={courseCardStyles.pricing}>
              <Skeleton width={154} height={28} />
            </div>
          </div>
          <Skeleton
            width={56}
            height={56}
            borderRadius={12}
            className={courseCardStyles.cartBtn}
          />
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
