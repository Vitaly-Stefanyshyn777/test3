"use client";

import React, { useState } from "react";
import styles from "./TrainerProfile.module.css";
import type { WorkExperienceEntry } from "./types";
import SecondaryInput from "@/components/ui/FormFields/SecondaryInput";
import DropdownField, {
  DropdownOption,
} from "@/components/ui/FormFields/DropdownField";

type Props = {
  value: WorkExperienceEntry;
  onChange: (field: keyof WorkExperienceEntry, value: string) => void;
};

export default function ExperienceForm({ value, onChange }: Props) {
  const [isStartMonthOpen, setIsStartMonthOpen] = useState(false);
  const [isStartYearOpen, setIsStartYearOpen] = useState(false);
  const [isEndMonthOpen, setIsEndMonthOpen] = useState(false);
  const [isEndYearOpen, setIsEndYearOpen] = useState(false);

  const closeOthers = (except: string) => {
    if (except !== "startMonth") setIsStartMonthOpen(false);
    if (except !== "startYear") setIsStartYearOpen(false);
    if (except !== "endMonth") setIsEndMonthOpen(false);
    if (except !== "endYear") setIsEndYearOpen(false);
  };

  const months: DropdownOption[] = [
    { value: "01", label: "Січень" },
    { value: "02", label: "Лютий" },
    { value: "03", label: "Березень" },
    { value: "04", label: "Квітень" },
    { value: "05", label: "Травень" },
    { value: "06", label: "Червень" },
    { value: "07", label: "Липень" },
    { value: "08", label: "Серпень" },
    { value: "09", label: "Вересень" },
    { value: "10", label: "Жовтень" },
    { value: "11", label: "Листопад" },
    { value: "12", label: "Грудень" },
  ];

  // Автоматична генерація років на основі поточного року (оновлюється автоматично)
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 50; // 50 років назад
  const maxYear = currentYear + 5; // 5 років вперед (для майбутніх дат)

  const years: DropdownOption[] = Array.from(
    { length: maxYear - minYear + 1 },
    (_, idx) => {
    const year = maxYear - idx; // Від майбутнього до минулого
    return { value: String(year), label: String(year) };
    },
  );

  return (
    <div className={styles.dateRow}>
      <div className={styles.dateGroup}>
        <label className={styles.dateLabel}>Назва залу</label>
        <SecondaryInput
          label="Назва залу"
          value={value.gym}
          onChange={(e) => onChange("gym", e.target.value)}
        />
      </div>
      <div className={styles.dateGroup}>
        <label className={styles.dateLabel}>Дата початку</label>
        <div className={styles.dateInputs}>
          <DropdownField
            showLabel={false}
            label="Місяць"
            value={value.startMonth}
            options={months}
            placeholder="Місяць"
            onChange={(v) => onChange("startMonth", v)}
          />
          <DropdownField
            showLabel={false}
            label="Рік"
            value={value.startYear}
            options={years}
            placeholder="Рік"
            onChange={(v) => onChange("startYear", v)}
          />
        </div>
      </div>

      <div className={styles.dateGroup}>
        <label className={styles.dateLabel}>Дата завершення</label>
        <div className={styles.dateInputs}>
          <DropdownField
            showLabel={false}
            label="Місяць"
            value={value.endMonth}
            options={months}
            placeholder="Місяць"
            onChange={(v) => onChange("endMonth", v)}
          />
          <DropdownField
            showLabel={false}
            label="Рік"
            value={value.endYear}
            options={years}
            placeholder="Рік"
            onChange={(v) => onChange("endYear", v)}
          />
        </div>
      </div>
    </div>
  );
}
