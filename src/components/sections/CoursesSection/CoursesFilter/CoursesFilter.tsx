// cspell:disable
"use client";
import React from "react";
import styles from "./CoursesFilter.module.css";
import { TrainingTypeFilter } from "../filters/TrainingTypeFilter/TrainingTypeFilter";

interface FilterState {
  cardio: boolean;
  dance: boolean;
  mindBody: boolean;
  strength: boolean;
}

interface CoursesFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

const CoursesFilter = ({ filters, onFiltersChange }: CoursesFilterProps) => {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterSidebar}>
        <TrainingTypeFilter
          value={Object.entries(filters)
            .filter(([, v]) => v)
            .map(([k]) => k)}
          onChange={(values: string[]) => {
            const next: FilterState = {
              cardio: values.includes("cardio"),
              dance: values.includes("dance"),
              mindBody: values.includes("mindBody"),
              strength: values.includes("strength"),
            };
            onFiltersChange(next);
          }}
          options={[
            { key: "cardio", label: "Кардіо" },
            { key: "dance", label: "Танцювальні" },
            { key: "mindBody", label: "Mind body" },
            { key: "strength", label: "Силові" },
          ]}
        />
      </div>
    </div>
  );
};

export default CoursesFilter;
// cspell:enable
