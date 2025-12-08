"use client";

import React from "react";
import styles from "./TrainerProfile.module.css";
import { DaggerIcon } from "../../../Icons/Icons";
import SecondaryInput from "../../../ui/FormFields/SecondaryInput";

type Props = {
  title: string;
  placeholder: string;
  values: string[];
  newValue: string;
  onNewValueChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
};

export default function TagsSection({
  title,
  placeholder,
  values,
  newValue,
  onNewValueChange,
  onAdd,
  onRemove,
}: Props) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.tagsContainer}>
        {values.map((value, index) => (
          <div key={index} className={styles.tag}>
            <span className={styles.tagText}>{value}</span>
            <button
              className={styles.tagRemove}
              onClick={() => onRemove(index)}
            >
              <DaggerIcon className={styles.daggerIcon} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.addInputContainer}>
        <SecondaryInput
          label={placeholder}
          value={newValue}
          onChange={(e) => onNewValueChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
        />
      </div>
    </div>
  );
}
