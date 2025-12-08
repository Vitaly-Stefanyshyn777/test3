"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./FAQSection.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const FAQSectionSkeleton: React.FC = () => {
  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.contentBlock}>
          <div className={styles.contentTextBlock}>
            <Skeleton
              width={200}
              height={22}
              style={{ marginBottom: "16px" }}
            />
            <Skeleton
              width={400}
              height={58}
              style={{ maxWidth: "100%" }}
            />
          </div>

          <div className={styles.content}>
            <div className={styles.leftColumn}>
              <div className={styles.imageContainer}>
                <Skeleton
                  width="100%"
                  height="100%"
                  borderRadius={16}
                  className={styles.heroImage}
                  style={{ maxWidth: 859, maxHeight: 555 }}
                />
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.faqList}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={styles.faqItem}>
                    <div
                      className={styles.faqButton}
                      style={{
                        pointerEvents: "none",
                        cursor: "default",
                        width: "100%",
                      }}
                    >
                      <Skeleton
                        width={`${70 + Math.random() * 20}%`}
                        height={24}
                        style={{ flex: 1, marginRight: "12px" }}
                      />
                      <Skeleton
                        width={60}
                        height={60}
                        borderRadius="50%"
                        style={{ flexShrink: 0 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSectionSkeleton;

