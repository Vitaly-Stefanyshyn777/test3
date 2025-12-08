"use client";
import React from "react";
import styles from "./TrainersFilterModal.module.css";
import { CloseButtonIcon } from "../../Icons/Icons";
import TrainersFilter from "../../sections/InstructingSection/TrainersCatalog/TrainersFilter/TrainersFilter";
import { useCoachesQuery } from "../../hooks/useCoachesQuery";
import { useScrollLock } from "../../hooks/useScrollLock";
import type { CoachUiItem } from "../../../lib/coaches";
import { ApplyFilterButton } from "../Buttons/ApplyFilterButton";
import { ResetFilterButton } from "../Buttons/ResetFilterButton";

interface FilterState {
  country: string;
  city: string;
  cities: string[];
  trainingDirection: string;
  forWhom: string;
  workFormat: string;
}

interface TrainersFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  trainers: Array<{ location?: string }>;
  searchTerm: string;
  onApply: () => void;
  onTrainersChange?: (trainers: unknown[]) => void;
}

const TrainersFilterModal: React.FC<TrainersFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onReset,
  trainers,
  searchTerm,
  onApply,
  onTrainersChange,
}) => {
  const { data: coaches = [] } = useCoachesQuery();

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleApply = () => {
    // Фільтруємо тренерів так само, як в TrainersFilter
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
          !targetAudience.toLowerCase().includes(filters.forWhom.toLowerCase())
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

    if (onTrainersChange) {
      onTrainersChange(filteredTrainers as unknown[]);
    }
    onApply();
    onClose();
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <h2 className={styles.title}>Фільтр</h2>
        <button className={styles.closeButton} onClick={onClose}>
          <CloseButtonIcon />
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.filterContent}>
          <TrainersFilter
            filters={filters}
            onFiltersChange={onFiltersChange}
            onReset={handleReset}
            trainers={trainers}
            searchTerm={searchTerm}
            onTrainersChange={() => {}}
            hideButtons={true}
            isInModal={true}
          />
        </div>
      </div>
      <div className={styles.footer}>
        <ApplyFilterButton onClick={handleApply} />
        <ResetFilterButton onClick={handleReset} />
      </div>
    </div>
  );
};

export default TrainersFilterModal;
