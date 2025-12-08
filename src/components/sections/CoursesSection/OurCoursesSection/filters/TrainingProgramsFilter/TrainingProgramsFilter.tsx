"use client";
import React, { useState } from "react";
import styles from "./TrainingProgramsFilter.module.css";
import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";

interface TrainingProgramsFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  options?: string[];
}

const TrainingProgramsFilter: React.FC<TrainingProgramsFilterProps> = ({
  value,
  onChange,
  options = [
    "Kids classes",
    "BFB для вагітних",
    "Базовий рівень інструктора групових програм",
    "Воркшопи з інвентарем",
  ],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleRadioChange = (opt: string) => {
    const isSelected = value.includes(opt);
    // Toggle логіка: якщо вже вибрана, знімаємо вибір, інакше додаємо до вибраних
    if (isSelected) {
      // Якщо вже вибрана, знімаємо вибір
      onChange(value.filter((v) => v !== opt));
    } else {
      // Якщо не вибрана, додаємо до вибраних (можна вибирати кілька опцій)
      onChange([...value, opt]);
    }
  };

  return (
    <div className={styles.filterSection}>
      <button
        className={styles.sectionTitleContainer}
        onClick={() => setIsExpanded((v) => !v)}
      >
        <h3 className={styles.sectionTitle}>Прокачай свої тренування:</h3>
        <span className={styles.icon} aria-hidden>
          {isExpanded ? <MinuswIcon /> : <PlusIcon />}
        </span>
      </button>
      {isExpanded && (
        <div className={styles.radioGroup}>
          {options.map((opt) => {
            const inputId = `training-program-${opt
              .toLowerCase()
              .replace(/\s+/g, "-")}`;
            const isSelected = value.includes(opt);
            return (
              <label
                key={opt}
                htmlFor={inputId}
                className={`${styles.radioLabel} ${
                  isSelected ? styles.selected : ""
                }`}
              >
                <input
                  type="checkbox"
                  id={inputId}
                  name="training-program"
                  checked={isSelected}
                  onChange={() => handleRadioChange(opt)}
                  className={styles.radioInput}
                />
                <span className={styles.radioCircle} aria-hidden="true" />
                <span className={styles.radioText}>{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrainingProgramsFilter;
