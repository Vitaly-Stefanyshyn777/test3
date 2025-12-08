"use client";
import React, { useState } from "react";
import styles from "./TrainerSelectionFilter.module.css";
import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface TrainerSelectionFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  options?: string[];
  loading?: boolean;
}

export const CertificationFilter = ({
  value,
  onChange,
  options = [],
  loading = false,
}: TrainerSelectionFilterProps) => {
  const cities = options;
  const [isExpanded, setIsExpanded] = useState(true);

  const toggle = (city: string) => {
    const next = value.includes(city)
      ? value.filter((c) => c !== city)
      : [...value, city];
    onChange(next);
  };

  return (
    <div className={styles.filterSection}>
      <button
        className={styles.sectionTitleContainer}
        onClick={() => setIsExpanded((v) => !v)}
      >
        <h3 className={styles.sectionTitle}>Оберіть Тренера:</h3>
        {isExpanded ? <MinuswIcon /> : <PlusIcon />}
      </button>

      {isExpanded && (
        <div className={styles.sectionContent}>
          {loading ? (
            <div className={styles.checkboxGroup}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Skeleton width={20} height={20} borderRadius={3} />
                  <Skeleton width={140} height={16} />
                </div>
              ))}
            </div>
          ) : cities.length === 0 ? (
            <div className={styles.checkboxGroup}>
              <span className={styles.checkboxText}>Дані скоро з'являться</span>
            </div>
          ) : (
            <div className={styles.checkboxGroup}>
              {cities.map((city) => {
                const inputId = `trainer-${city
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
                      checked={value.includes(city)}
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
