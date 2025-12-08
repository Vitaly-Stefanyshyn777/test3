"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./CourseInstructor.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const CourseInstructorSkeleton: React.FC = () => {
  return (
    <section className={styles.instructor}>
      <div className={styles.container}>
        {/* Заголовок секції */}
        <Skeleton
          width={400}
          height={38}
          className={styles.sliderTitle}
          style={{ marginBottom: "30px" }}
        />
        
        <div className={styles.content}>
          <div className={styles.leftColumn}>
            {/* Блок з заголовком та описом */}
            <div className={styles.titleTextBlock}>
              <div className={styles.titleBlock}>
                {/* Заголовок */}
                <Skeleton
                  width="70%"
                  height={45}
                  className={styles.title}
                  style={{ marginBottom: "16px" }}
                />
                {/* Опис */}
                <Skeleton
                  width="100%"
                  height={22}
                  count={2}
                  className={styles.description}
                  style={{ marginBottom: "0" }}
                />
              </div>

              {/* Блок тегів */}
              <div className={styles.tagsBlock}>
                <Skeleton
                  width={120}
                  height={17}
                  className={styles.tagsBlockTitle}
                  style={{ marginBottom: "16px" }}
                />
                <div className={styles.tags}>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={i}
                      width={140}
                      height={40}
                      borderRadius={8}
                      className={styles.tag}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className={styles.stats}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={styles.statCard}>
                  <Skeleton
                    width={40}
                    height={40}
                    borderRadius={65}
                    className={styles.statIcon}
                    style={{ marginBottom: "24px" }}
                  />
                  <div className={styles.statContent}>
                    <Skeleton
                      width={80}
                      height={29}
                      className={styles.statNumber}
                      style={{ marginBottom: "6px" }}
                    />
                    <Skeleton
                      width={120}
                      height={22}
                      className={styles.statLabel}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Права колонка з фото */}
          <div className={styles.rightColumn}>
            <div className={styles.imageContainer}>
              <Skeleton
                width={477}
                height={596}
                borderRadius={20}
                className={styles.instructorImage}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseInstructorSkeleton;

