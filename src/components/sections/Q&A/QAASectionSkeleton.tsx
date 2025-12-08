"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./QAASection.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const QAASectionSkeleton: React.FC = () => {
  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.contentBlock}>
          <div className={styles.contentTextBlock}>
            <Skeleton
              width={400}
              height={38}
              className={styles.title}
              style={{ maxWidth: "100%" }}
            />
          </div>

          <div className={styles.content}>
            <div className={styles.rightColumn}>
              <div className={styles.faqList}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={styles.faqItem}>
                    <div className={styles.faqButton} style={{ pointerEvents: "none", cursor: "default" }}>
                      <Skeleton 
                        width={408}
                        height={24}
                        className={styles.question}
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

export default QAASectionSkeleton;

