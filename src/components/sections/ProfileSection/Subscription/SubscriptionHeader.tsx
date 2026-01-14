"use client";

import React from "react";
import Link from "next/link";
import styles from "./Subscription.module.css";

interface SubscriptionHeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  title?: string;
}

export default function SubscriptionHeader({
  showBackButton = true,
  backHref = "/profile",
  title = "Підписка",
}: SubscriptionHeaderProps) {
  return (
    <div className={styles.header}>
      {showBackButton && (
        <Link href={backHref} className={styles.backBtn}>
          <span>
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 6H14.3333M14.3333 6L9.33333 1M14.3333 6L9.33333 11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Назад
        </Link>
      )}
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}
