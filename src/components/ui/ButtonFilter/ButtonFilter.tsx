import React from "react";
import styles from "./ButtonFilter.module.css";
import { ApplyFilterButton } from "@/components/ui/Buttons/ApplyFilterButton";
import { ResetFilterButton } from "@/components/ui/Buttons/ResetFilterButton";

interface FilterActionsProps {
  onApply: () => void;
  onReset: () => void;
  loading?: boolean;
}

export const ButtonFilter = ({
  onApply,
  onReset,
  loading = false,
}: FilterActionsProps) => {
  return (
    <div className={styles.filterActions}>
      <ApplyFilterButton onClick={onApply} disabled={loading}>
        {loading ? "Завантаження..." : "Застосувати фільтри"}
      </ApplyFilterButton>
      <ResetFilterButton onClick={onReset} disabled={loading}>
        Скинути всі налаштування
      </ResetFilterButton>
    </div>
  );
};

export default ButtonFilter;
