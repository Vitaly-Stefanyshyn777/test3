"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./TrainerProfile.module.css";
import mapStyles from "./TrainerMap/TrainerMap.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const TrainerProfileSkeleton: React.FC = () => {
  return (
    <div className={styles.trainerProfileWrapper}>
      {/* Breadcrumbs skeleton */}
      <div style={{ padding: "20px 40px" }}>
        <Skeleton width={200} height={20} />
      </div>

      <div className={styles.trainerProfile}>
        <div className={styles.sidebar}>
          {/* Navigation skeleton */}
          <div className={styles.navigation}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.navItem}>
                <Skeleton width={24} height={24} borderRadius={4} />
                <Skeleton width={120} height={20} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.mainContent}>
          <div id="overview" className={styles.overview}>
            <div className={styles.profileInfo}>
              <div className={styles.superPowerContainer}>
                {/* Avatar skeleton */}
                <div className={styles.profileImage}>
                  <Skeleton width={337} height={309} borderRadius={12} />
                </div>

                {/* Super power skeleton */}
                <div className={styles.superPowerBlock}>
                  <div className={styles.superPower}>
                    <Skeleton width={150} height={24} style={{ marginBottom: "16px" }} />
                    <Skeleton width="100%" height={80} borderRadius={8} />
                  </div>

                  {/* Favorite exercise skeleton */}
                  <div className={styles.favoriteExercise}>
                    <Skeleton width={140} height={24} style={{ marginBottom: "16px" }} />
                    <Skeleton width={180} height={40} borderRadius={8} />
                  </div>
                </div>

                {/* Contacts skeleton */}
                <div className={styles.ContactsContainer}>
                  <Skeleton width={120} height={24} style={{ marginBottom: "12px" }} />
                  <div className={styles.IconsContainer}>
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} width={58} height={58} borderRadius={16} />
                    ))}
                  </div>
                  <Skeleton width="100%" height={60} borderRadius={20} />
                </div>
              </div>

              <div className={styles.headerContainer}>
                {/* Header block skeleton */}
                <div className={styles.headerBlock}>
                  <div className={styles.header}>
                    <Skeleton width={200} height={20} style={{ marginBottom: "10px" }} />
                    <Skeleton width={300} height={40} />
                  </div>

                  {/* Info skeleton */}
                  <div className={styles.info}>
                    <Skeleton width={150} height={20} />
                    <Skeleton width={120} height={20} />
                  </div>
                </div>

                {/* Specializations skeleton */}
                <div className={styles.specializationsContainer}>
                  <div className={styles.specializations}>
                    <Skeleton width={180} height={24} style={{ marginBottom: "16px" }} />
                    <div className={styles.tags}>
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} width={120} height={40} borderRadius={8} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Work experience skeleton */}
                <div className={styles.workExperienceContainer}>
                  <Skeleton width={180} height={24} style={{ marginBottom: "24px" }} />
                  <div className={styles.experienceEntry}>
                    <div className={styles.experienceEntryBlock}>
                      <div className={styles.workExperienceBlock}>
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className={styles.experienceItem}>
                            <div className={styles.experienceRow}>
                              <div className={styles.experienceHeader}>
                                <Skeleton width={200} height={20} />
                                <Skeleton width={120} height={20} />
                              </div>
                            </div>
                            <Skeleton width="100%" height={60} style={{ marginTop: "20px" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery skeleton */}
                <div id="gallery" className={styles.gallerySection}>
                  <Skeleton width={120} height={24} style={{ marginBottom: "24px" }} />
                  <div className={styles.galleryContainer}>
                    <Skeleton width="100%" height={560} borderRadius={12} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TrainerMap skeleton */}
      <div id="locations" className={mapStyles.container}>
        <Skeleton width={400} height={56} style={{ marginBottom: "72px" }} />
        <div className={mapStyles.mapContainer}>
          {/* Map skeleton */}
          <Skeleton width="100%" height={880} borderRadius={8} className={mapStyles.map} />

          {/* Location card skeleton */}
          <div className={mapStyles.locationCard}>
            {/* Location images skeleton */}
            <div className={mapStyles.locationImages}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} width={160} height={160} borderRadius={12} />
              ))}
            </div>

            {/* Location title skeleton */}
            <Skeleton width={300} height={64} style={{ marginBottom: "40px" }} />

            {/* Location info skeleton */}
            <div className={mapStyles.locationInfoCont}>
              <div className={mapStyles.locationInfo}>
                <div className={mapStyles.infoRow}>
                  <div className={mapStyles.infoItem}>
                    <Skeleton width={80} height={16} style={{ marginBottom: "10px" }} />
                    <Skeleton width={150} height={15} />
                  </div>
                  <div className={mapStyles.infoItem}>
                    <Skeleton width={180} height={16} style={{ marginBottom: "10px" }} />
                    <Skeleton width={120} height={15} />
                  </div>
                </div>
                <div className={mapStyles.infoRow}>
                  <div className={mapStyles.infoItem}>
                    <Skeleton width={60} height={16} style={{ marginBottom: "10px" }} />
                    <Skeleton width={200} height={15} />
                  </div>
                  <div className={mapStyles.infoItem}>
                    <Skeleton width={180} height={16} style={{ marginBottom: "10px" }} />
                    <Skeleton width={120} height={15} />
                  </div>
                </div>
              </div>

              <div className={mapStyles.infoItemCenter}>
                <Skeleton width={80} height={16} style={{ marginBottom: "10px" }} />
                <Skeleton width="100%" height={15} />
              </div>
            </div>

            {/* Social icons skeleton */}
            <div className={mapStyles.locationSocial}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} width={58} height={58} borderRadius={12} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfileSkeleton;

