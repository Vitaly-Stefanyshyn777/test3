"use client";
import React from "react";
import { CloseButtonIcon } from "@/components/Icons/Icons";
import styles from "./ModalCloseButton.module.css";

interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
  ariaLabel?: string;
}

export default function ModalCloseButton({
  onClose,
  className = "",
  ariaLabel = "Закрити",
}: ModalCloseButtonProps) {
  return (
    <button
      className={`${styles.close} ${className}`}
      onClick={onClose}
      aria-label={ariaLabel}
    >
      <CloseButtonIcon />
    </button>
  );
}





