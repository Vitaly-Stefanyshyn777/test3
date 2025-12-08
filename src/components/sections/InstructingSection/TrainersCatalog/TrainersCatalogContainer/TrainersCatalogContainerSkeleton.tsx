"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./TrainersCatalogContainer.module.css";
import trainerCardStyles from "../TrainerCard/TrainerCard.module.css";
import trainersGridStyles from "../TrainersGrid/TrainersGrid.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const TrainersCatalogContainerSkeleton: React.FC = () => {
  return (
    <div className={styles.catalogContainer}>
      <div className={styles.mainContent}>
        <div className={trainersGridStyles.trainersGridContainer}>
          <div className={trainersGridStyles.trainersGrid}>
            {[...Array(16)].map((_, i) => (
              <div key={i} className={trainerCardStyles.trainerCard}>
                <div className={trainerCardStyles.cardImage}>
                  <Skeleton height="100%" width="100%" />
                </div>
                <div className={trainerCardStyles.cardContent}>
                  <Skeleton
                    width={120}
                    height={14}
                    style={{ marginBottom: "8px" }}
                    className={trainerCardStyles.location}
                  />
                  <Skeleton
                    width="80%"
                    height={20}
                    style={{ marginBottom: "8px" }}
                    className={trainerCardStyles.trainerName}
                  />
                  <Skeleton
                    width="60%"
                    height={16}
                    className={trainerCardStyles.specialization}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainersCatalogContainerSkeleton;

