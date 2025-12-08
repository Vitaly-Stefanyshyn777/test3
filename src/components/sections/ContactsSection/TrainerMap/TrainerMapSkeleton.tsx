"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./TrainerMap.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const ContactsTrainerMapSkeleton: React.FC = () => {
  return (
    <div className={styles.container}>
      <Skeleton width={260} height={40} style={{ marginBottom: 32 }} className={styles.title} />
      <div className={styles.mapContainer}>
        <Skeleton width="100%" height="100%" borderRadius={8} className={styles.map} />

        <div className={styles.locationCard}>
          <div className={styles.locationImages}>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                width={160}
                height={160}
                borderRadius={12}
                className={styles.locationImage}
              />
            ))}
          </div>

          <Skeleton width="80%" height={48} style={{ marginTop: 24, marginBottom: 24 }} />

          <div className={styles.locationInfoCont}>
            <div className={styles.locationInfo}>
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <Skeleton width={80} height={16} style={{ marginBottom: 4 }} />
                  <Skeleton width={150} height={20} />
                </div>
                <div className={styles.infoItem}>
                  <Skeleton width={140} height={16} style={{ marginBottom: 4 }} />
                  <Skeleton width={120} height={20} />
                </div>
              </div>
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <Skeleton width={80} height={16} style={{ marginBottom: 4 }} />
                  <Skeleton width={180} height={20} />
                </div>
                <div className={styles.infoItem}>
                  <Skeleton width={140} height={16} style={{ marginBottom: 4 }} />
                  <Skeleton width={120} height={20} />
                </div>
              </div>
            </div>

            <div className={styles.infoItemCenter}>
              <Skeleton width={90} height={16} style={{ marginBottom: 4 }} />
              <Skeleton width="90%" height={20} />
            </div>
          </div>

          <div className={styles.locationSocial}>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                circle
                width={58}
                height={58}
                className={styles.socialIcon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsTrainerMapSkeleton;


