"use client";

import React from "react";
import styles from "./PersonalData.module.css";
import { UserIcon } from "../../../Icons/Icons";
import InputField from "../../../ui/FormFields/InputField";

type Props = {
  firstName: string;
  lastName: string;
  onChange: (firstName: string, lastName: string) => void;
};

export default function UsernameSection({
  firstName,
  lastName,
  onChange,
}: Props) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Ім&#39;я користувача</h3>

      <div className={styles.inputGroup}>
        <div className={`${styles.wrapperBlock} ${styles.wrapperBlockSingle}`}>
          <InputField
            icon={<UserIcon />}
            label="Ваше ім'я та прізвище"
            id="profile-username-name-field"
            value={`${firstName} ${lastName}`.trim()}
            onChange={(e) => {
              const [first = "", last = ""] = e.target.value.split(" ");
              onChange(first, last);
            }}
          />
        </div>
      </div>
    </div>
  );
}
