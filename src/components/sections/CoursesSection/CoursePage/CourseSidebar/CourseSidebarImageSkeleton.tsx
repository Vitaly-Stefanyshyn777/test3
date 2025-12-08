"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./CourseSidebar.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const CourseSidebarImageSkeleton: React.FC = () => {
  return (
    <div className={styles.imageContainer}>
      <Skeleton 
        width="100%" 
        height={300} 
        borderRadius={0}
        className={styles.courseImage}
      />
      <div className={styles.badges}>
        <Skeleton width={70} height={24} borderRadius={10} />
        <Skeleton width={70} height={24} borderRadius={10} />
      </div>
    </div>
  );
};

export default CourseSidebarImageSkeleton;

