"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./TrainerProfile.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const TrainingLocationsSectionSkeleton: React.FC = () => {
  return (
    <div className={styles.section}>
      <Skeleton width={300} height={28} style={{ marginBottom: "24px" }} className={styles.sectionTitle} />

      <div className={styles.locationsContainer}>
        {[...Array(2)].map((_, i) => (
          <div key={i} className={styles.locationCard}>
            <div className={styles.locationHeader}>
              <Skeleton circle width={40} height={40} className={styles.locationIcon} />
              <Skeleton width={200} height={24} className={styles.locationTitle} />
            </div>
            <div className={styles.locationInfo}>
              <div className={styles.contactRowBlock}>
                <div className={styles.contactRow}>
                  <div className={styles.contactInfo}>
                    <Skeleton width={80} height={16} style={{ marginBottom: "4px" }} />
                    <Skeleton width={150} height={20} />
                  </div>
                  <div className={styles.contactInfo}>
                    <Skeleton width={80} height={16} style={{ marginBottom: "4px" }} />
                    <Skeleton width={180} height={20} />
                  </div>
                </div>
                <div className={styles.workingHours}>
                  <div className={styles.hoursRow}>
                    <div className={styles.hoursInfo}>
                      <Skeleton width={150} height={16} style={{ marginBottom: "4px" }} />
                      <Skeleton width={120} height={20} />
                    </div>
                    <div className={styles.hoursInfo}>
                      <Skeleton width={150} height={16} style={{ marginBottom: "4px" }} />
                      <Skeleton width={120} height={20} />
                    </div>
                  </div>
                </div>
                <div className={styles.address}>
                  <Skeleton width={80} height={16} style={{ marginBottom: "4px" }} />
                  <Skeleton width="90%" height={20} />
                </div>
              </div>
              <div className={styles.addressActionsContainer}>
                <Skeleton width="100%" height={1} style={{ marginBottom: "16px" }} />
                <div className={styles.locationActions}>
                  <Skeleton width={150} height={40} borderRadius={8} />
                  <Skeleton width={120} height={40} borderRadius={8} />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className={styles.addGymBtn}>
          <Skeleton circle width={48} height={48} className={styles.addGymButton} />
          <Skeleton width={100} height={20} className={styles.addGymLabel} />
        </div>
      </div>
    </div>
  );
};

export default TrainingLocationsSectionSkeleton;

