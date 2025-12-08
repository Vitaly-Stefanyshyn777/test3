"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import styles from "./Subscription.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const SubscriptionSkeleton: React.FC = () => {
  return (
    <div className={styles.subscriptionContainer}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <Skeleton width={100} height={40} borderRadius={8} />
        <Skeleton width={200} height={40} />
      </div>
      <div className={styles.mobileTitleDivider} />

      <div className={styles.content}>
        {/* Current Plan Card Skeleton */}
        <div className={styles.currentPlan}>
          <div className={styles.availablePlans}>
            <Skeleton width={150} height={28} style={{ marginBottom: "24px" }} className={styles.sectionTitle} />
            <div className={styles.currentPlanCard}>
              <div className={styles.planPrice}>
                <Skeleton width={120} height={24} style={{ marginBottom: "12px" }} />
                <Skeleton width={150} height={32} style={{ marginBottom: "8px" }} />
                <Skeleton width={100} height={20} />
              </div>
              <div className={styles.planFeatures}>
                {[...Array(2)].map((_, i) => (
                  <div key={i} className={styles.feature} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <Skeleton circle width={20} height={20} />
                    <Skeleton width={250} height={16} />
                  </div>
                ))}
              </div>
              <Skeleton width="100%" height={20} style={{ marginTop: "16px", marginBottom: "16px" }} />
              <Skeleton width={200} height={48} borderRadius={8} />
            </div>
          </div>
        </div>
        <div className={styles.mobileTitleDivider} />

        {/* Plans Grid Skeleton */}
        <div className={styles.availablePlans}>
          <Skeleton width={200} height={28} style={{ marginBottom: "24px" }} className={styles.sectionTitle} />
          <div className={styles.plansGridContainer}>
            <div className={styles.plansContainer}>
              <div className={styles.plansGrid}>
                {[...Array(2)].map((_, i) => (
                  <div key={i} className={styles.planCard}>
                    <div className={styles.planPrice}>
                      <Skeleton width={150} height={24} style={{ marginBottom: "12px" }} />
                      <div className={styles.planPriceBlock} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Skeleton width={120} height={28} />
                        <Skeleton width={50} height={20} />
                      </div>
                      <Skeleton width={180} height={20} />
                    </div>
                    <div className={styles.planFeatures}>
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className={styles.feature} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                          <Skeleton circle width={20} height={20} />
                          <Skeleton width={200 + Math.random() * 50} height={16} />
                        </div>
                      ))}
                    </div>
                    <Skeleton width="100%" height={48} borderRadius={8} style={{ marginTop: "16px" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSkeleton;

