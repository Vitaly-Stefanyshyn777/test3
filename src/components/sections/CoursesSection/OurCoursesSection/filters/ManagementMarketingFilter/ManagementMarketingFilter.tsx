"use client";
import React, { useMemo, useState } from "react";
import styles from "./ManagementMarketingFilter.module.css";
import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";

interface ManagementMarketingFilterProps {
  value?: string[];
  onChange: (value: string[]) => void;
  options?: Array<{ key: string; label: string } | string>;
}

const ManagementMarketingFilter: React.FC<ManagementMarketingFilterProps> = ({
  value = [],
  onChange,
  options = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const normalized = useMemo(
    () =>
      (options || []).map((o) =>
        typeof o === "string" ? { key: o, label: o } : o
      ),
    [options]
  );

  const toggle = (key: string) => {
    const next = value.includes(key)
      ? value.filter((v) => v !== key)
      : [...value, key];
    onChange(next);
  };

  return (
    <div className={styles.filterSection}>
      <button
        className={styles.sectionTitleContainer}
        onClick={() => setIsExpanded((v) => !v)}
      >
        <h3 className={styles.sectionTitle}>Управління, маркетинг та інше:</h3>
        <span className={styles.icon} aria-hidden>
          {isExpanded ? <MinuswIcon /> : <PlusIcon />}
        </span>
      </button>
      {isExpanded && (
        <div className={styles.checkboxGroup}>
          {normalized.length === 0 ? (
            <div className={styles.placeholder}>Дані скоро з'являться</div>
          ) : (
            normalized.map((opt) => {
              const inputId = `management-${opt.key.toLowerCase().replace(/\s+/g, '-')}`;
              return (
                <label key={opt.key} htmlFor={inputId} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    id={inputId}
                    checked={value.includes(opt.key)}
                    onChange={() => toggle(opt.key)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxText}>{opt.label}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ManagementMarketingFilter;
