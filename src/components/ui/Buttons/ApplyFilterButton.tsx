import React from "react";
import styles from "./ApplyFilterButton.module.css";

interface ApplyFilterButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ApplyFilterButton: React.FC<ApplyFilterButtonProps> = ({
  onClick,
  disabled = false,
  children = "Застосувати фільтри",
}) => {
  return (
    <button
      className={styles.applyButton}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

