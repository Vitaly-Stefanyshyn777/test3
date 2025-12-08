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
          {/* Заголовок */}
          <Skeleton
            width={250}
            height={43}
            style={{ marginBottom: "32px" }}
            className={styles.title}
          />
          
          {/* Список модулів */}
          <div className={styles.modulesList}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.module}>
                <div
                  className={styles.moduleButton}
                  style={{ pointerEvents: "none", cursor: "default" }}
                >
                  <div className={styles.moduleInfo}>
                    <Skeleton
                      width={186}
                      height={26}
                      className={styles.moduleTitle}
                      style={{ marginBottom: "0" }}
                    />
                  </div>
                  <div className={styles.lessonsCountContainer} style={{ justifyContent: "center", alignItems: "center" }}>
                    <Skeleton
                      width={90}
                      height={22}
                      className={styles.lessonsCount}
                      style={{ marginRight: "15px", textAlign: "center" }}
                    />
                    <Skeleton
                      width={24}
                      height={24}
                      borderRadius="50%"
                      className={styles.chevron}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Кнопка "Показати ще" */}
          <Skeleton
            width={180}
            height={60}
            borderRadius={16}
            className={styles.showAllButton}
          />
        </div>

        <div className={styles.rightColumn}>
          {/* Картки статистики */}
          <div className={styles.statsCardBlock} style={{ justifyContent: "center" }}>
            <div className={styles.statsCard} style={{ width: "202px", height: "286px" }}>
              <div className={styles.statBlock} style={{ gap: "40px" }}>
                <Skeleton
                  width={50}
                  height={50}
                  borderRadius={28}
                  className={styles.statIcon}
                />
                <div className={styles.statItemBlock}>
                  <div className={styles.statItem} style={{ gap: "8px" }}>
                    <Skeleton
                      width={60}
                      height={18}
                      className={styles.statLabel}
                    />
                    <Skeleton width={80} height={60} className={styles.statNumber} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.statsCardRight} style={{ width: "202px", height: "286px" }}>
              <div className={styles.statBlock} style={{ gap: "40px" }}>
                <Skeleton
                  width={50}
                  height={50}
                  borderRadius={28}
                  className={styles.statIcon}
                />
                <div className={styles.statItemBlock}>
                  <div className={styles.statItem} style={{ gap: "8px" }}>
                    <Skeleton
                      width={140}
                      height={18}
                      className={styles.statLabel}
                    />
                    <Skeleton width={50} height={60} className={styles.statNumber} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Секція "ЧОГО ВИ НАВЧИТЕСЬ" */}
          <div className={styles.learningOutcomes}>
            <Skeleton
              width={220}
              height={22}
              style={{ marginBottom: "20px" }}
            />
            <ul className={styles.learningList}>
              {[...Array(5)].map((_, i) => (
                <li key={i} className={styles.learningItem}>
                  <Skeleton
                    width={20}
                    height={20}
                    borderRadius="50%"
                    style={{ flexShrink: 0 }}
                  />
                  <Skeleton
                    width={320}
                    height={44}
                    className={styles.learningText}
                    style={{ flex: 1 }}
                  />
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

