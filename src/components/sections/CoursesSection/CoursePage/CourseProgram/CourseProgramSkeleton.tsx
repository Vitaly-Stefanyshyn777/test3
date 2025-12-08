"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./CourseProgram.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const CourseProgramSkeleton: React.FC = () => {
  return (
    <section className={styles.program}>
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <Skeleton width={250} height={32} style={{ marginBottom: "24px" }} />
          <div className={styles.modulesList}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.module}>
                <div className={styles.moduleButton} style={{ pointerEvents: "none" }}>
                  <div className={styles.moduleInfo}>
                    <Skeleton width="60%" height={24} />
                  </div>
                  <div className={styles.lessonsCountContainer}>
                    <Skeleton width={80} height={20} />
                    <Skeleton width={24} height={24} borderRadius="50%" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.statsCardBlock}>
            <div className={styles.statsCard}>
              <div className={styles.statBlock}>
                <Skeleton width={48} height={48} borderRadius={8} />
                <div className={styles.statItemBlock}>
                  <Skeleton width={80} height={20} style={{ marginBottom: "8px" }} />
                  <Skeleton width={120} height={32} />
                </div>
              </div>
            </div>
            <div className={styles.statsCardRight}>
              <div className={styles.statBlock}>
                <Skeleton width={48} height={48} borderRadius={8} />
                <div className={styles.statItemBlock}>
                  <Skeleton width={120} height={20} style={{ marginBottom: "8px" }} />
                  <Skeleton width={80} height={32} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.learningOutcomes}>
            <Skeleton width={200} height={24} style={{ marginBottom: "16px" }} />
            <ul className={styles.learningList}>
              {[...Array(5)].map((_, i) => (
                <li key={i} className={styles.learningItem}>
                  <Skeleton width={24} height={24} borderRadius={4} />
                  <Skeleton width="80%" height={16} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseProgramSkeleton;

