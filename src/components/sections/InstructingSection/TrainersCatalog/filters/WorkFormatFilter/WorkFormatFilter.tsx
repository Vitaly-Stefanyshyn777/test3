"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./WorkFormatFilter.module.css";
import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";
import { fetchTrainersWithLogging } from "@/lib/bfbApi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface WorkFormatFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const WorkFormatFilter = ({
  value,
  onChange,
}: WorkFormatFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formats, setFormats] = useState<string[]>([]);

  // Статичні формати як fallback
  const fallbackFormats = useMemo(() => ["Індивідуальні", "Групові"], []);

  const loadFormats = useCallback(async () => {
    try {
      setLoading(true);

      // Отримуємо тренерів без фільтрів щоб витягти унікальні формати
      const trainers = await fetchTrainersWithLogging({});

      // Витягуємо унікальні формати з тренерів
      const uniqueFormats = [
        ...new Set(
          trainers
            .map((trainer) =>
              [
                (trainer.acf as Record<string, unknown>)?.work_format,
                (trainer.acf as Record<string, unknown>)?.session_type,
                (trainer.acf as Record<string, unknown>)?.training_format,
              ].filter(Boolean)
            )
            .flat()
            .filter(
              (format) =>
                format && typeof format === "string" && format.trim() !== ""
            )
        ),
      ] as string[];

      if (uniqueFormats.length > 0) {
        setFormats(uniqueFormats);
      } else {
        setFormats(fallbackFormats);
      }
    } catch (error) {
      // Silent error handling
      setFormats(fallbackFormats);
    } finally {
      setLoading(false);
    }
  }, [fallbackFormats]);

  useEffect(() => {
    loadFormats();
  }, [loadFormats]);

  const handleFormatChange = async (selectedFormat: string) => {
    onChange(selectedFormat);
  };

  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`${styles.filterSection} ${
        !isExpanded ? styles.collapsedSection : ""
      }`}
    >
      <div
        className={styles.sectionTitleContainer}
        onClick={toggleSection}
        style={{ cursor: "pointer" }}
      >
        <h3 className={styles.sectionTitle}>Формат роботи</h3>
        {isExpanded ? <MinuswIcon /> : <PlusIcon />}
      </div>

      <div
        className={`${styles.sectionContent} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
      >
        {loading ? (
          <div className={styles.radioGroup}>
            {[...Array(2)].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Skeleton width={20} height={20} borderRadius={10} />
                <Skeleton width={140} height={16} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.radioGroup}>
            {formats.map((format) => {
              const isSelected = value === format;
              const inputId = `work-format-${format
                .toLowerCase()
                .replace(/\s+/g, "-")}`;
              return (
                <label
                  key={format}
                  htmlFor={inputId}
                  className={`${styles.radioLabel} ${
                    isSelected ? styles.selected : ""
                  }`}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    name="workFormat"
                    value={format}
                    checked={isSelected}
                    onChange={() => {
                      if (isSelected) {
                        handleFormatChange(""); // скасувати вибір
                      } else {
                        handleFormatChange(format); // встановити
                      }
                    }}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioCircle} aria-hidden="true" />
                  <span className={styles.radioText}>{format}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
