"use client";
import React, { useState } from "react";
import styles from "./TrainingTypeFilter.module.css";
import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Option {
  key: string;
  label: string;
}

interface TrainingTypeFilterProps {
  value?: string[];
  onChange: (value: string[]) => void;
  options?: Option[];
  loading?: boolean;
}

export const TrainingTypeFilter = ({
  value = [],
  onChange,
  options = [
    { key: "cardio", label: "Кардіо" },
    { key: "dance", label: "Танцювальні" },
    { key: "mindBody", label: "Mind body" },
    { key: "strength", label: "Силові" },
  ],
  loading = false,
}: TrainingTypeFilterProps) => {
  const handleToggle = (key: string) => {
    const next = value.includes(key)
      ? value.filter((v) => v !== key)
      : [...value, key];
    onChange(next);
  };

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={styles.filterSection}>
      <button
        className={styles.sectionTitleContainer}
        onClick={() => setIsExpanded((v) => !v)}
      >
        <h3 className={styles.sectionTitle}>Тип тренування</h3>
        {isExpanded ? <MinuswIcon /> : <PlusIcon />}
      </button>

      {isExpanded && (
        <div className={styles.sectionContent}>
          {loading ? (
            <div className={styles.checkboxGroup}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <Skeleton width={20} height={20} borderRadius={3} />
                  <Skeleton width={120} height={16} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.checkboxGroup}>
              {options.map((option) => {
                const inputId = `training-type-${option.key}`;
                return (
                  <label key={option.key} htmlFor={inputId} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      id={inputId}
                      checked={value.includes(option.key)}
                      onChange={() => handleToggle(option.key)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxText}>{option.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
