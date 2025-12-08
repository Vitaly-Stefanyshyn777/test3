"use client";
import React from "react";
import styles from "./ButtonFilter.module.css";

interface ButtonFilterProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export default function ButtonFilter({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: ButtonFilterProps) {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${
        disabled ? styles.disabled : ""
      }`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
