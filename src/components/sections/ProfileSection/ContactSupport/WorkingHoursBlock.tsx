"use client";

import React from "react";
import styles from "./ContactSupport.module.css";

export default function WorkingHoursBlock({
  weekdays,
  weekends,
  address,
}: {
  weekdays: string;
  weekends: string;
  address: string;
}) {
  return (
    <div className={styles.workingHours}>
      <div className={styles.hoursInfoBlock}>
        <div className={styles.hoursItem}>
          <span className={styles.hoursLabel}>Час роботи у вихідні:</span>
          <span className={styles.hoursValue}>{weekends}</span>
        </div>
        <div className={styles.hoursItem}>
          <span className={styles.hoursLabel}>Час роботи у будні:</span>
          <span className={styles.hoursValue}>{weekdays}</span>
        </div>
      </div>

      <div className={styles.addressInfo}>
        <span className={styles.addressLabel}>Адреса:</span>
        <span className={styles.addressValue}>{address}</span>
      </div>
    </div>
  );
}
