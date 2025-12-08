"use client";
import React, { useState } from "react";

import styles from "./WorkoutTypeFilter.module.css";

import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface WorkoutTypeFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  options?: string[];
  loading?: boolean;
}

export const WorkoutTypeFilter = ({
  value,
  onChange,
  options = [
    "З додатковим обладнанням",
    "З власною вагою",
    "Тренування в залі",
    "Тренування вдома",
  ],
  loading = false,
}: WorkoutTypeFilterProps) => {
  const cities = options;
  const [isExpanded, setIsExpanded] = useState(true);
  const norm = (s: string) => s.toLowerCase().trim();
  const isSelected = (city: string) =>
    value.some((v) => norm(v) === norm(city));
  const toggle = (city: string) => {
    const next = isSelected(city)
      ? value.filter((c) => norm(c) !== norm(city))
      : [...value, city];
    onChange(next);
  };

  // Debug props

  return (
    <div className={styles.filterSection}>
      <button
        className={styles.sectionTitleContainer}
        onClick={() => setIsExpanded((v) => !v)}
      >
        <h3 className={styles.sectionTitle}>Оберіть тип тренування:</h3>
        {isExpanded ? <MinuswIcon /> : <PlusIcon />}
      </button>

      {isExpanded && (
        <div className={styles.sectionContent}>
          {loading ? (
            <div className={styles.checkboxGroup}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Skeleton width={20} height={20} borderRadius={3} />
                  <Skeleton width={180} height={16} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.checkboxGroup}>
              {cities.map((city) => {
                const inputId = `workout-${city
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`;
                return (
                  <label
                    key={city}
                    htmlFor={inputId}
                    className={styles.checkboxLabel}
                  >
                    <input
                      type="checkbox"
                      id={inputId}
                      checked={isSelected(city)}
                      onChange={() => toggle(city)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxText}>{city}</span>
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
