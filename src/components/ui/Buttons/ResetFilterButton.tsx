import React from "react";
import styles from "./ResetFilterButton.module.css";

interface ResetFilterButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ResetFilterButton: React.FC<ResetFilterButtonProps> = ({
  onClick,
  disabled = false,
  children = "Скинути всі налаштування",
}) => {
  return (
    <button
      className={styles.resetButton}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

