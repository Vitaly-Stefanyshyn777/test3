"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./ProductsFilter.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const ProductsFilterSkeleton: React.FC = () => {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterSidebar}>
        {/* RangeInput skeleton */}
        <div className={styles.filterSection}>
          <div className={styles.sectionTitleContainer} style={{ pointerEvents: "none" }}>
            <Skeleton width={180} height={20} />
            <Skeleton width={20} height={20} />
          </div>
          <div className={styles.sectionContent}>
            <div style={{ padding: "16px 0" }}>
              <Skeleton width="100%" height={40} borderRadius={8} />
              <Skeleton width="100%" height={6} borderRadius={3} style={{ marginTop: "16px" }} />
            </div>
          </div>
        </div>

        {/* ColorFilter skeleton */}
        <div className={styles.filterSection}>
          <div className={styles.sectionTitleContainer} style={{ pointerEvents: "none" }}>
            <Skeleton width={120} height={20} />
            <Skeleton width={20} height={20} />
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.checkboxGroup}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={styles.checkboxLabel}>
                  <Skeleton width={20} height={20} borderRadius={3} />
                  <Skeleton width={100 + Math.random() * 50} height={16} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SizeFilter skeleton */}
        <div className={styles.filterSection}>
          <div className={styles.sectionTitleContainer} style={{ pointerEvents: "none" }}>
            <Skeleton width={140} height={20} />
            <Skeleton width={20} height={20} />
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.checkboxGroup}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={styles.checkboxLabel}>
                  <Skeleton width={20} height={20} borderRadius={3} />
                  <Skeleton width={100 + Math.random() * 50} height={16} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CertificationFilter skeleton */}
        <div className={styles.filterSection}>
          <div className={styles.sectionTitleContainer} style={{ pointerEvents: "none" }}>
            <Skeleton width={150} height={20} />
            <Skeleton width={20} height={20} />
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.radioGroup}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className={styles.radioLabel}>
                  <Skeleton circle width={20} height={20} />
                  <Skeleton width={150 + Math.random() * 30} height={16} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ButtonFilter skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Skeleton width="100%" height={48} borderRadius={12} />
        <Skeleton width="100%" height={48} borderRadius={12} />
      </div>
    </div>
  );
};

export default ProductsFilterSkeleton;

