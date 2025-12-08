"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./ProductsShowcase.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const ProductsShowcaseSkeleton: React.FC = () => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <Skeleton width={260} height={32} />
      </div>

      <div className={styles.scroller}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.thumb}>
              <Skeleton width="100%" height="100%" />
            </div>
            <div className={styles.caption}>
              <Skeleton width="70%" height={18} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductsShowcaseSkeleton;


