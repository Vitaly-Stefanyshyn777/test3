"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./PersonalData.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const PersonalDataSkeleton: React.FC = () => {
  return (
    <div className={styles.personalData}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <Skeleton width={300} height={38} className={styles.title} />
        <Skeleton width="80%" height={22} count={2} className={styles.description} />
      </div>

      <div className={styles.divider}></div>

      <div className={styles.form}>
        {/* Profile Photo Section Skeleton */}
        <div className={styles.section}>
          <div className={styles.profilePhotoSection}>
            <div className={styles.profilePhotoBlock}>
              <Skeleton circle width={80} height={80} className={styles.profilePhoto} />
              <div className={styles.sectionHeader}>
                <Skeleton width={150} height={24} className={styles.sectionTitle} />
                <Skeleton width={120} height={20} className={styles.fileInfo} />
              </div>
            </div>
            <div className={styles.photoActions}>
              <Skeleton width={150} height={48} borderRadius={15} />
              <Skeleton width={140} height={48} borderRadius={15} />
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Username Section Skeleton */}
        <div className={styles.section}>
          <Skeleton width={200} height={24} style={{ marginBottom: "12px" }} className={styles.sectionTitle} />
          <div className={styles.inputGroup}>
            <Skeleton width="100%" height={48} borderRadius={8} />
            <Skeleton width="100%" height={48} borderRadius={8} />
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Contacts Section Skeleton */}
        <div className={styles.section}>
          <Skeleton width={200} height={24} style={{ marginBottom: "12px" }} className={styles.sectionTitle} />
          <div className={styles.inputGroup}>
            <Skeleton width="100%" height={48} borderRadius={8} />
            <Skeleton width="100%" height={48} borderRadius={8} />
          </div>
          <div className={styles.inputGroup} style={{ marginTop: "12px" }}>
            <Skeleton width="100%" height={48} borderRadius={8} />
            <Skeleton width="100%" height={48} borderRadius={8} />
          </div>
        </div>

        {/* Save Button Skeleton */}
        <div className={styles.saveSection}>
          <Skeleton width={200} height={48} borderRadius={8} className={styles.saveBtn} />
        </div>
      </div>
    </div>
  );
};

export default PersonalDataSkeleton;

