"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./CoursePage.module.css";
import heroStyles from "./CourseHero/CourseHero.module.css";
import sidebarStyles from "./CourseSidebar/CourseSidebar.module.css";
import instructorStyles from "./CourseInstructor/CourseInstructor.module.css";
import programStyles from "./CourseProgram/CourseProgram.module.css";
import processStyles from "./CourseProcess/CourseProcess.module.css";
import CourseSidebarImageSkeleton from "./CourseSidebar/CourseSidebarImageSkeleton";
import CourseSidebarCourseInfoSkeleton from "./CourseSidebar/CourseSidebarCourseInfoSkeleton";
import QAASectionSkeleton from "../../Q&A/QAASectionSkeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CoursePageSkeleton: React.FC = () => {
  return (
    <div className={styles.coursePage}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftColumn} data-main-content>
            {/* CourseHero skeleton */}
            <section className={heroStyles.hero}>
              <div className={heroStyles.courseContentBlock}>
                <div className={heroStyles.tagsCodeBlock}>
                  <div className={heroStyles.tags}>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton
                        key={i}
                        width={120}
                        height={40}
                        borderRadius={8}
                      />
                    ))}
                  </div>
                  <div className={heroStyles.courseCode}>
                    <Skeleton width={100} height={20} />
                  </div>
                </div>
                <Skeleton
                  width={400}
                  height={43}
                  className={heroStyles.title}
                  style={{ marginBottom: "24px" }}
                />
                <Skeleton
                  width={947}
                  height={70}
                  className={heroStyles.description}
                  style={{ marginBottom: "24px" }}
                />
                <div className={heroStyles.topicsSection}>
                  <Skeleton
                    width={300}
                    height={24}
                    style={{ marginBottom: "16px" }}
                  />
                  <div className={heroStyles.topicsGrid}>
                    {[...Array(6)].map((_, i) => (
                      <Skeleton
                        key={i}
                        width={180}
                        height={40}
                        borderRadius={8}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* CourseProgram skeleton */}
            <section className={programStyles.program}>
              <div className={programStyles.content}>
                <div className={programStyles.leftColumn}>
                  {/* Заголовок */}
                  <Skeleton
                    width={250}
                    height={43}
                    style={{ marginBottom: "32px" }}
                    className={programStyles.title}
                  />

                  {/* Список модулів */}
                  <div className={programStyles.modulesList}>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={programStyles.module}>
                        <div
                          className={programStyles.moduleButton}
                          style={{ pointerEvents: "none", cursor: "default" }}
                        >
                          <div className={programStyles.moduleInfo}>
                            <Skeleton
                              width={186}
                              height={26}
                              className={programStyles.moduleTitle}
                              style={{ marginBottom: "0" }}
                            />
                          </div>
                          <div
                            className={programStyles.lessonsCountContainer}
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Skeleton
                              width={90}
                              height={22}
                              className={programStyles.lessonsCount}
                              style={{
                                marginRight: "15px",
                                textAlign: "center",
                              }}
                            />
                            <Skeleton
                              width={24}
                              height={24}
                              borderRadius="50%"
                              className={programStyles.chevron}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
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
                    className={programStyles.showAllButton}
                  />
                </div>

                <div className={programStyles.rightColumn}>
                  {/* Картки статистики */}
                  <div
                    className={programStyles.statsCardBlock}
                    style={{ justifyContent: "center" }}
                  >
                    <div
                      className={programStyles.statsCard}
                      style={{ width: "202px", height: "286px" }}
                    >
                      <div
                        className={programStyles.statBlock}
                        style={{ gap: "40px" }}
                      >
                        <Skeleton
                          width={50}
                          height={50}
                          borderRadius={28}
                          className={programStyles.statIcon}
                        />
                        <div className={programStyles.statItemBlock}>
                          <div
                            className={programStyles.statItem}
                            style={{ gap: "8px" }}
                          >
                            <Skeleton
                              width={60}
                              height={18}
                              className={programStyles.statLabel}
                            />
                            <Skeleton
                              width={80}
                              height={60}
                              className={programStyles.statNumber}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={programStyles.statsCardRight}
                      style={{ width: "202px", height: "286px" }}
                    >
                      <div
                        className={programStyles.statBlock}
                        style={{ gap: "40px" }}
                      >
                        <Skeleton
                          width={50}
                          height={50}
                          borderRadius={28}
                          className={programStyles.statIcon}
                        />
                        <div className={programStyles.statItemBlock}>
                          <div
                            className={programStyles.statItem}
                            style={{ gap: "8px" }}
                          >
                            <Skeleton
                              width={140}
                              height={18}
                              className={programStyles.statLabel}
                            />
                            <Skeleton
                              width={50}
                              height={60}
                              className={programStyles.statNumber}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Секція "ЧОГО ВИ НАВЧИТЕСЬ" */}
                  <div className={programStyles.learningOutcomes}>
                    <Skeleton
                      width={220}
                      height={22}
                      style={{ marginBottom: "20px" }}
                    />
                    <ul className={programStyles.learningList}>
                      {[...Array(5)].map((_, i) => (
                        <li key={i} className={programStyles.learningItem}>
                          <Skeleton
                            width={20}
                            height={20}
                            borderRadius="50%"
                            className={programStyles.learningIcon}
                            style={{ flexShrink: 0 }}
                          />
                          <Skeleton
                            width={320}
                            height={44}
                            className={programStyles.learningText}
                            style={{ flex: 1 }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* CourseProcess skeleton */}
            <section className={processStyles.section}>
              <div className={processStyles.container}>
                <div className={processStyles.titleTextBlock}>
                  <Skeleton
                    width={300}
                    height={38}
                    className={processStyles.title}
                  />
                </div>
                <div className={processStyles.row}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={processStyles.item}>
                      <div className={processStyles.itemContent}>
                        <div style={{ position: "relative" }}>
                          <Skeleton
                            width={80}
                            height={80}
                            borderRadius={12}
                            className={processStyles.icon}
                          />
                          <Skeleton
                            width={28}
                            height={20}
                            borderRadius={8}
                            className={processStyles.number}
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "28px",
                            }}
                          />
                        </div>
                        <div className={processStyles.itemIconBlock}>
                          <Skeleton
                            width="80%"
                            height={29}
                            className={processStyles.itemTitle}
                          />
                          <Skeleton
                            width="100%"
                            height={22}
                            className={processStyles.itemText}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CourseInstructor skeleton */}
            <section className={instructorStyles.instructor}>
              <div className={instructorStyles.container}>
                {/* Заголовок секції */}
                <Skeleton
                  width={400}
                  height={38}
                  className={instructorStyles.sliderTitle}
                  style={{ marginBottom: "30px" }}
                />

                <div className={instructorStyles.content}>
                  <div className={instructorStyles.leftColumn}>
                    {/* Блок з заголовком та описом */}
                    <div className={instructorStyles.titleTextBlock}>
                      <div className={instructorStyles.titleBlock}>
                        {/* Заголовок */}
                        <Skeleton
                          width="70%"
                          height={45}
                          className={instructorStyles.title}
                          style={{ marginBottom: "16px" }}
                        />
                        {/* Опис */}
                        <Skeleton
                          width="100%"
                          height={22}
                          count={2}
                          className={instructorStyles.description}
                          style={{ marginBottom: "0" }}
                        />
                      </div>

                      {/* Блок тегів */}
                      <div className={instructorStyles.tagsBlock}>
                        <Skeleton
                          width={120}
                          height={17}
                          className={instructorStyles.tagsBlockTitle}
                          style={{ marginBottom: "16px" }}
                        />
                        <div className={instructorStyles.tags}>
                          {[...Array(4)].map((_, i) => (
                            <Skeleton
                              key={i}
                              width={140}
                              height={40}
                              borderRadius={8}
                              className={instructorStyles.tag}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Статистика */}
                    <div className={instructorStyles.stats}>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={instructorStyles.statCard}>
                          <Skeleton
                            width={40}
                            height={40}
                            borderRadius={65}
                            className={instructorStyles.statIcon}
                            // style={{ marginBottom: "24px" }}
                          />
                          <div className={instructorStyles.statContent}>
                            <Skeleton
                              width={80}
                              height={29}
                              className={instructorStyles.statNumber}
                              style={{ marginBottom: "6px" }}
                            />
                            <Skeleton
                              width={120}
                              height={22}
                              className={instructorStyles.statLabel}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Права колонка з фото */}
                  <div className={instructorStyles.rightColumn}>
                    <div className={instructorStyles.imageContainer}>
                      <Skeleton
                        width={477}
                        height={596}
                        borderRadius={20}
                        className={instructorStyles.instructorImage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* QAASection skeleton */}
            <QAASectionSkeleton />
          </div>

          <div className={styles.rightColumn}>
            {/* CourseSidebar skeleton */}
            <div className={sidebarStyles.sidebar}>
              <CourseSidebarImageSkeleton />
              <CourseSidebarCourseInfoSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePageSkeleton;
