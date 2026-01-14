"use client";
import React from "react";
import styles from "./PurchasedCourses.module.css";

interface PurchasedCoursesSkeletonProps {
  title?: string;
}

const PurchasedCoursesSkeleton: React.FC<PurchasedCoursesSkeletonProps> = ({
  title = "Придбані курси",
}) => (
  <div className={styles.purchasedCourses}>
    <h2 className={styles.title}>{title}</h2>
    <div className={styles.divider}></div>
    <div className={styles.coursesList}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonImageContainer}></div>

          <div className={styles.skeletonInfo}>
            <div className={styles.skeletonType}></div>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonDescription}></div>
          </div>

          <div className={styles.skeletonActions}>
            <div className={styles.skeletonPrice}></div>
            <div className={styles.skeletonButtonContainer}>
              <div className={styles.skeletonButton}></div>
              <div className={styles.skeletonLine}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PurchasedCoursesSkeleton;