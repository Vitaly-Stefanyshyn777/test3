"use client";

import React from "react";
import styles from "./ContactSupport.module.css";

export default function ContactInfoBlock({
  phone,
  email,
}: {
  phone: string;
  email: string;
}) {
  return (
    <div className={styles.contactInfo}>
      <div className={`${styles.contactItem} ${styles.contactPhone}`}>
        <span className={styles.contactLabel}>Телефон:</span>
        <a
          href={`tel:${phone}`}
          className={`${styles.contactValue} ${styles.contactPhoneValue}`}
        >
          {phone}
        </a>
      </div>
      <div className={`${styles.contactItem} ${styles.contactEmail}`}>
        <span className={styles.contactLabel}>Email:</span>
        <a
          href={`mailto:${email}`}
          className={`${styles.contactValue} ${styles.contactEmailValue}`}
        >
          {email}
        </a>
      </div>
    </div>
  );
}
