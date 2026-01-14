"use client";
import React from "react";
import styles from "./SubscriptionCurrent.module.css";
import SectionDivider from "../SectionDivider/SectionDivider";
import SubscriptionHeader from "./SubscriptionHeader";
import CurrentPlanCardCurrent from "./CurrentPlanCardCurrent";
import SubscriptionHistory from "./SubscriptionHistory";
import Link from "next/link";

const SubscriptionCurrent: React.FC = () => {
  return (
    <div className={styles.subscriptionContainer}>
      <SubscriptionHeader showBackButton={false} />
      <div className={styles.mobileTitleDivider} />
      <SectionDivider />

      <div className={styles.content}>
        <CurrentPlanCardCurrent />
        <div className={styles.mobileTitleDivider} />
        <SubscriptionHistory />
      </div>
    </div>
  );
};

export default SubscriptionCurrent;
