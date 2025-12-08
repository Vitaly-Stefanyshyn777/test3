"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./PersonalData.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const ProfilePhotoSectionSkeleton: React.FC = () => {
  return (
    <div className={styles.section}>
      <div className={styles.profilePhotoSection}>
        <div className={styles.profilePhotoBlock}>
          <div className={styles.profilePhoto}>
            <Skeleton circle width={80} height={80} />
          </div>
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
  );
};

export default ProfilePhotoSectionSkeleton;

