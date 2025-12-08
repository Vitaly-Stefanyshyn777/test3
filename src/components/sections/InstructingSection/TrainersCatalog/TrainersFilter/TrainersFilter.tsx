"use client";
import React, { useState } from "react";
import styles from "./TrainersFilter.module.css";
import { CountryFilter } from "../filters/CountryFilter/CountryFilter";
import { CityFilter } from "../filters/CityFilter/CityFilter";
import { TrainingDirectionFilter } from "../filters/TrainingDirectionFilter/TrainingDirectionFilter";
import { ForWhomFilter } from "../filters/ForWhomFilter/ForWhomFilter";
import { WorkFormatFilter } from "../filters/WorkFormatFilter/WorkFormatFilter";
import ButtonFilter from "@/components/ui/ButtonFilter/ButtonFilter";
import { useCoachesQuery } from "@/components/hooks/useCoachesQuery";
import type { CoachUiItem } from "@/lib/coaches";

interface FilterState {
  country: string;
  city: string;
  cities: string[];
  trainingDirection: string;
  forWhom: string;
  workFormat: string;
}

interface TrainersFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  onTrainersChange?: (trainers: unknown[] | undefined) => void;
  trainers: Array<{ location?: string }>;
  searchTerm: string;
  hideButtons?: boolean; // Проп для приховування кнопок
  isInModal?: boolean; // Проп для визначення, чи компонент в модалці
}

const TrainersFilter = ({
  filters,
  onFiltersChange,
  onReset,
  onTrainersChange,
  trainers,
  searchTerm,
  hideButtons = false,
  isInModal = false,
}: TrainersFilterProps) => {
  const [loading, setLoading] = useState(false);
  const { data: coaches = [] } = useCoachesQuery();

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | string[]
  ) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    onReset();
    // Скидаємо відфільтровані тренери, щоб показати всіх тренерів
    if (onTrainersChange) {
      onTrainersChange(undefined);
    }
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);

      // Локальна фільтрація даних з useCoachesQuery (UI-модель)
      const filteredTrainers = (coaches as CoachUiItem[]).filter((coach) => {
        const locationStr: string = coach.location || "";

        if (filters.country && !locationStr.includes(filters.country)) {
          return false;
        }
        if (filters.city && !locationStr.includes(filters.city)) {
          return false;
        }
        if (
          filters.cities.length > 0 &&
          !filters.cities.some((c) => (c ? locationStr.includes(c) : false))
        ) {
          return false;
        }

        if (filters.trainingDirection) {
          const direction = coach.specialization || "";
          if (
            !direction
              .toLowerCase()
              .includes(filters.trainingDirection.toLowerCase())
          ) {
            return false;
          }
        }

        if (filters.forWhom) {
          const targetAudience = coach.superPower || "";
          if (
            !targetAudience
              .toLowerCase()
              .includes(filters.forWhom.toLowerCase())
          ) {
            return false;
          }
        }

        if (filters.workFormat) {
          const workFormat = coach.specialization || "";
          if (
            !workFormat.toLowerCase().includes(filters.workFormat.toLowerCase())
          ) {
            return false;
          }
        }

        return true;
      });

      // Filtered trainers

      if (onTrainersChange) {
        onTrainersChange(filteredTrainers as unknown[]);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`${styles.filterContainer} ${isInModal ? styles.inModal : ''}`}
      data-in-modal={isInModal ? 'true' : undefined}
    >
      <div className={styles.filterSidebar}>
        <CountryFilter
          value={filters.country}
          onChange={(value) => handleFilterChange("country", value)}
        />

        <CityFilter
          value={filters.city}
          selectedCities={filters.cities}
          onCityChange={(value) => handleFilterChange("city", value)}
          onToggleCity={(cities) => handleFilterChange("cities", cities)}
          trainers={trainers}
          searchTerm={searchTerm}
        />

        <TrainingDirectionFilter
          value={filters.trainingDirection}
          onChange={(value) => handleFilterChange("trainingDirection", value)}
        />

        <ForWhomFilter
          value={filters.forWhom}
          onChange={(value) => handleFilterChange("forWhom", value)}
        />

        <WorkFormatFilter
          value={filters.workFormat}
          onChange={(value) => handleFilterChange("workFormat", value)}
        />
      </div>
      {!hideButtons && (
        <ButtonFilter
          onApply={handleApplyFilters}
          onReset={handleReset}
          loading={loading}
        />
      )}
    </div>
  );
};

export default TrainersFilter;
