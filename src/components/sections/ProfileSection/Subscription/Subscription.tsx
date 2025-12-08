"use client";
import React from "react";
import styles from "./Subscription.module.css";
import SectionDivider from "../SectionDivider/SectionDivider";
import SubscriptionHeader from "./SubscriptionHeader";
import CurrentPlanCard from "./CurrentPlanCard";
// import PaymentHistory from "./PaymentHistory";
import PlansGrid from "./PlansGrid";

const Subscription: React.FC = () => {
  return (
    <div className={styles.subscriptionContainer}>
      <SubscriptionHeader />
      <div className={styles.mobileTitleDivider} />
      <SectionDivider />

      <div className={styles.content}>
        <CurrentPlanCard />
        <div className={styles.mobileTitleDivider} />
        {/* <PaymentHistory /> */}
        <SectionDivider />
        <PlansGrid />
      </div>
    </div>
  );
};

export default Subscription;
