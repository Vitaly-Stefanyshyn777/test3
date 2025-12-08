"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./VideoInstruction.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const VideoInstructionSkeleton: React.FC = () => {
  return (
    <div className={styles.videoInstruction}>
      <div className={styles.header}>
        <div className={styles.textContent}>
          <Skeleton width={400} height={32} className={styles.title} />
          <Skeleton width="80%" height={20} count={2} className={styles.description} />
        </div>
        <div className={styles.statusContainer}>
          <Skeleton width={267} height={66} borderRadius={20} />
        </div>
      </div>

      <div className={styles.videoContainer}>
        <Skeleton width="100%" height={400} borderRadius={16} />
      </div>
    </div>
  );
};

export default VideoInstructionSkeleton;

