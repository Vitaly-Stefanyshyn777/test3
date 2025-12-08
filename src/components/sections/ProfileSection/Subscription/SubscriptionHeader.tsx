"use client";

import React from "react";
import styles from "./Subscription.module.css";
import { RightArrowIcon } from "@/components/Icons/Icons";

export default function SubscriptionHeader() {
  return (
    <div className={styles.header}>
      <button className={styles.backBtn}>
        <span>
          <RightArrowIcon />
        </span>
        Назад
      </button>
      <h1 className={styles.title}>Підписки</h1>
    </div>
  );
}
