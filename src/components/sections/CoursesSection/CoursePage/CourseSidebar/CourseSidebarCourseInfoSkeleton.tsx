"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./CourseSidebar.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const CourseSidebarCourseInfoSkeleton: React.FC = () => {
  return (
    <div className={styles.courseInfo}>
      <div className={styles.courseTitleBlock}>
        <div className={styles.categoryTagBlock}>
          <Skeleton width={80} height={20} className={styles.categoryTag} />
          <div className={styles.titleWithDateRow}>
            <div className={styles.titleWithBadges}>
              <Skeleton width={376} height={25} className={styles.courseTitle} />
            </div>
            <div className={styles.dateBlock}>
              <div className={styles.availability}>
                <Skeleton width={14} height={14} borderRadius="50%" />
                <Skeleton width={75} height={15} className={styles.inStock} />
              </div>
              <div className={styles.rating}>
                <Skeleton width={188} height={15} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.courseIncludes}>
        <Skeleton width={200} height={18} className={styles.courseIncludesTitle} />
        <ul className={styles.courseIncludesList}>
          {[...Array(5)].map((_, i) => (
            <li key={i} className={styles.courseIncludesItem}>
              <Skeleton width={20} height={20} borderRadius="50%" className={styles.courseIncludesIcon} />
              <Skeleton width={200} height={15} className={styles.courseIncludesText} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.pricingCartBlock}>
        <div className={styles.pricing}>
          <Skeleton width={200} height={30} />
        </div>
        <div className={styles.subscriptionOffer}>
          <Skeleton width={520} height={108} />
        </div>
        <div className={styles.registerCallout}>
          <Skeleton width={296} height={66} borderRadius={16} className={styles.registerBlock} />
          <Skeleton width={216} height={66} borderRadius={16} className={styles.registerBtn} />
        </div>
      </div>

      <div className={styles.pricingActionsBlock}>
        <div className={styles.actions}>
          <Skeleton width={446} height={66} borderRadius={16} className={styles.addToCartButtonDisabled} />
          <Skeleton width={66} height={66} borderRadius={15} className={styles.favoriteButtonDisabled} />
        </div>
      </div>
    </div>
  );
};

export default CourseSidebarCourseInfoSkeleton;

