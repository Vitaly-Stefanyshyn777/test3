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
          <Skeleton width={80} height={20} style={{ marginBottom: "15px" }} />
          <div className={styles.titleWithDateRow}>
            <div className={styles.titleWithBadges}>
              <Skeleton width="70%" height={38} />
              <Skeleton width={60} height={24} borderRadius={6} />
            </div>
            <div className={styles.dateBlock}>
              <Skeleton width={100} height={20} />
              <Skeleton width={80} height={20} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.courseIncludes}>
        <Skeleton width={200} height={20} style={{ marginBottom: "16px" }} />
        <ul className={styles.courseIncludesList}>
          {[...Array(4)].map((_, i) => (
            <li key={i} className={styles.courseIncludesItem}>
              <Skeleton width={20} height={20} borderRadius="50%" />
              <Skeleton width="80%" height={16} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.topicsSection}>
        <Skeleton width={250} height={20} style={{ marginBottom: "16px" }} />
        <div className={styles.topicsGrid}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} width={140} height={36} borderRadius={8} />
          ))}
        </div>
      </div>

      <div className={styles.pricingCartBlock}>
        <div className={styles.pricing}>
          <Skeleton width={120} height={40} />
          <Skeleton width={100} height={24} style={{ marginTop: "8px" }} />
        </div>
        <div className={styles.subscriptionOffer}>
          <Skeleton width={30} height={30} borderRadius={4} />
          <Skeleton width="80%" height={16} count={2} />
        </div>
        <Skeleton width="100%" height={60} borderRadius={12} />
      </div>
    </div>
  );
};

export default CourseSidebarCourseInfoSkeleton;

