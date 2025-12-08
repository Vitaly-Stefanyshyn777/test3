"use client";
import React from "react";
import styles from "./SubscriptionBadge.module.css";

interface SubscriptionBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const SubscriptionBadge = ({
  children,
  className = "",
}: SubscriptionBadgeProps) => {
  return (
    <span className={`${styles.subscriptionBadge} ${className}`}>
      {children}
    </span>
  );
};

export default SubscriptionBadge;

