"use client";

import React from "react";
import styles from "./TrainerProfile.module.css";
import Multiline from "../../../ui/FormFields/Multiline";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SuperpowerSection({ value, onChange }: Props) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Моя суперсила:</h3>
      <div className={styles.textareaContainer}>
        <Multiline
          label="Опис"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}
