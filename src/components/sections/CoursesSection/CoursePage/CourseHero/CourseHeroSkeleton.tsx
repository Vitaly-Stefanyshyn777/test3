"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./CourseHero.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const CourseHeroSkeleton: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.courseContentBlock}>
        <div className={styles.tagsCodeBlock}>
          <div className={styles.tags}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} width={120} height={40} borderRadius={8} />
            ))}
          </div>
          <div className={styles.courseCode}>
            <Skeleton width={100} height={20} />
          </div>
        </div>
        <Skeleton width="80%" height={48} style={{ marginBottom: "24px" }} />
        <Skeleton width="100%" height={16} count={4} style={{ marginBottom: "8px" }} />
        <div className={styles.topicsSection}>
          <Skeleton width={300} height={24} style={{ marginBottom: "16px" }} />
          <div className={styles.topicsGrid}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} width={180} height={40} borderRadius={8} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseHeroSkeleton;

