"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./TrainersShowcase.module.css";
import "react-loading-skeleton/dist/skeleton.css";

interface TrainersShowcaseSkeletonProps {
  title?: string;
  subtitle?: string;
  itemsPerPage?: number;
}

const TrainersShowcaseSkeleton: React.FC<TrainersShowcaseSkeletonProps> = ({
  title,
  subtitle,
  itemsPerPage = 4,
}) => {
  return (
    <section className={styles.trainersSection}>
      <div className={styles.container}>
        {(title || subtitle) && (
          <div className={styles.header}>
            {subtitle && (
              <Skeleton
                width={100}
                height={18}
                className={styles.badge}
              />
            )}
            {title && (
              <Skeleton
                width={400}
                height={68}
                style={{ lineHeight: "120%" }}
                className={styles.title}
              />
            )}
          </div>
        )}

        <div className={styles.trainersGrid}>
          {[...Array(itemsPerPage)].map((_, i) => (
            <article key={i} className={styles.trainerCard}>
              <div className={styles.imageContainer}>
                <Skeleton height="100%" width="100%" />
                {/* Instagram badge skeleton */}
                <div className={styles.instagramBadge}>
                  <Skeleton
                    width={16}
                    height={16}
                    borderRadius={4}
                    style={{ marginRight: "6px" }}
                  />
                  <Skeleton width={80} height={12} />
                </div>
              </div>
              <div className={styles.trainerInfo}>
                <Skeleton
                  width="80%"
                  height={20}
                  style={{ marginBottom: "8px" }}
                  className={styles.trainerName}
                />
                <Skeleton
                  count={2}
                  height={14}
                  className={styles.trainerDescription}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrainersShowcaseSkeleton;

