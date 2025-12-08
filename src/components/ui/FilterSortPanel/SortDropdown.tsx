"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./SortDropdown.module.css";
import { SortArrowIcon } from "@/components/Icons/Icons";

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  label: string;
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
  className?: string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`${styles.dropdownContainer} ${className}`}>
      <button
        type="button"
        className={styles.dropdownButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.label}>{label}</span>
        <SortArrowIcon
          className={`${styles.icon} ${isOpen ? styles.iconRotated : ""}`}
        />
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.dropdownItem} ${
                value === option.value ? styles.dropdownItemActive : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;

