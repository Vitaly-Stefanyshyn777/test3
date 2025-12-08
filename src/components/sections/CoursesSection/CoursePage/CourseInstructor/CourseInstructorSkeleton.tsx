"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./CourseInstructor.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const CourseInstructorSkeleton: React.FC = () => {
  return (
    <section className={styles.instructor}>
      <div className={styles.container}>
        <Skeleton
          width={300}
          height={32}
          style={{ marginBottom: "32px", maxWidth: "100%" }}
        />
        <div className={styles.content}>
          <div className={styles.leftColumn}>
            <div className={styles.titleTextBlock}>
              <div className={styles.titleBlock}>
                <Skeleton
                  width="60%"
                  height={40}
                  style={{ marginBottom: "16px" }}
                />
                <Skeleton
                  width="100%"
                  height={16}
                  count={3}
                  style={{ marginBottom: "12px" }}
                />
              </div>

              <div className={styles.tagsBlock}>
                <Skeleton
                  width={150}
                  height={20}
                  style={{ marginBottom: "12px" }}
                />
                <div className={styles.tags}>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={i}
                      width={140}
                      height={36}
                      borderRadius={8}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.stats}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={styles.statCard}>
                  <Skeleton width={48} height={48} borderRadius={8} />
                  <div className={styles.statContent}>
                    <Skeleton
                      width={80}
                      height={28}
                      style={{ marginBottom: "8px" }}
                    />
                    <Skeleton width={120} height={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.imageContainer}>
              <Skeleton
                width="100%"
                height={600}
                borderRadius={16}
                style={{ maxHeight: 600 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseInstructorSkeleton;

