"use client";

import React from "react";
import styles from "./TrainerProfile.module.css";
import ExperienceForm from "./ExperienceForm";
import type { WorkExperienceEntry } from "./types";
import Multiline from "@/components/ui/FormFields/Multiline";

type Props = {
  value: WorkExperienceEntry;
  onChange: (field: keyof WorkExperienceEntry, value: string) => void;
};

export default function WorkExperienceSection({ value, onChange }: Props) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Досвід роботи</h3>

      <div className={styles.workExperienceForm}>
        <ExperienceForm value={value} onChange={onChange} />
        <div className={styles.textareaContainer}>
          <Multiline
            label="Опис"
            rows={4}
            value={value.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
