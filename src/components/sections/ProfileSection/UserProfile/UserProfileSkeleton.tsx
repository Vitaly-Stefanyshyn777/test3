"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./UserProfile.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const UserProfileSkeleton: React.FC = () => {
  return (
    <div className={styles.userProfile}>
      <div className={styles.avatarContainer}>
        <Skeleton circle width={80} height={80} />
      </div>

      <div className={styles.userInfo}>
        <Skeleton width={200} height={34} className={styles.greeting} />
        <div className={styles.emailContainer}>
          <Skeleton width={180} height={22} className={styles.email} />
        </div>
      </div>
    </div>
  );
};

export default UserProfileSkeleton;

