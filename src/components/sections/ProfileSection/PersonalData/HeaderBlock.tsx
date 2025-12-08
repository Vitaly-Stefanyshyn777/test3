"use client";

import React from "react";
import styles from "./PersonalData.module.css";

export default function HeaderBlock() {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>Особисті дані</h2>
      <p className={styles.description}>
        Тут ви можете переглянути або змінити свої особисті дані.
      </p>
    </div>
  );
}
