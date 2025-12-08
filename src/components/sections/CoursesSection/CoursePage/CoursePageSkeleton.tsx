"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./CoursePage.module.css";
import heroStyles from "./CourseHero/CourseHero.module.css";
import sidebarStyles from "./CourseSidebar/CourseSidebar.module.css";
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
                      <Skeleton key={i} width={120} height={40} borderRadius={8} />
                    ))}
                  </div>
                  <div className={heroStyles.courseCode}>
                    <Skeleton width={100} height={20} />
                  </div>
                </div>
                <Skeleton width="80%" height={48} style={{ marginBottom: "24px" }} />
                <Skeleton width="100%" height={120} count={2} />
                <div className={heroStyles.topicsSection}>
                  <Skeleton width={300} height={24} style={{ marginBottom: "16px" }} />
                  <div className={heroStyles.topicsGrid}>
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} width={180} height={40} borderRadius={8} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* CourseProgram skeleton */}
            <section style={{ background: "#fff", borderRadius: "16px", padding: "52px" }}>
              <Skeleton width={250} height={32} style={{ marginBottom: "24px" }} />
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ marginBottom: "16px" }}>
                  <Skeleton width="60%" height={24} style={{ marginBottom: "8px" }} />
                  <Skeleton width="40%" height={16} />
                </div>
              ))}
            </section>

            {/* CourseProcess skeleton */}
            <section style={{ background: "#fff", borderRadius: "16px", padding: "52px" }}>
              <Skeleton width={300} height={32} style={{ marginBottom: "32px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} width="100%" height={200} borderRadius={12} />
                ))}
              </div>
            </section>

            {/* CourseInstructor skeleton */}
            <section style={{ background: "#fff", borderRadius: "16px", padding: "52px" }}>
              <Skeleton width={250} height={32} style={{ marginBottom: "24px" }} />
              <div style={{ display: "flex", gap: "24px" }}>
                <Skeleton width={200} height={200} borderRadius={12} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="60%" height={24} style={{ marginBottom: "16px" }} />
                  <Skeleton width="100%" height={16} count={3} style={{ marginBottom: "12px" }} />
                  <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} width={80} height={32} borderRadius={8} />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.rightColumn}>
            {/* CourseSidebar skeleton */}
            <div className={sidebarStyles.sidebar}>
              <Skeleton width="100%" height={400} borderRadius={16} style={{ marginBottom: "24px" }} />
              <Skeleton width="100%" height={20} style={{ marginBottom: "12px" }} />
              <Skeleton width="80%" height={32} style={{ marginBottom: "16px" }} />
              <Skeleton width="100%" height={16} count={4} style={{ marginBottom: "12px" }} />
              <Skeleton width="100%" height={60} borderRadius={12} style={{ marginBottom: "16px" }} />
              <Skeleton width="100%" height={50} borderRadius={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePageSkeleton;

