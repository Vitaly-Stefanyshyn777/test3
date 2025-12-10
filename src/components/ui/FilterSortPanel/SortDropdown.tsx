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
  variant?: "itemsPerPage" | "sort";
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  className = "",
  variant = "sort",
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
    <div
      ref={containerRef}
      className={`${
        variant === "itemsPerPage"
          ? styles.itemsPerPageContainer
          : styles.sortContainer
      } ${className}`}
    >
      <button
        type="button"
        className={
          variant === "itemsPerPage"
            ? styles.itemsPerPageButton
            : styles.sortButton
        }
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={
            variant === "itemsPerPage"
              ? styles.itemsPerPageLabel
              : styles.sortLabel
          }
        >
          {label}
        </span>
        <SortArrowIcon
          className={`${
            variant === "itemsPerPage"
              ? styles.itemsPerPageIcon
              : styles.sortIcon
          } ${isOpen ? styles.iconRotated : ""}`}
        />
      </button>
      {isOpen && (
        <div
          className={
            variant === "itemsPerPage"
              ? styles.itemsPerPageDropdown
              : styles.sortDropdown
          }
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${
                variant === "itemsPerPage"
                  ? styles.itemsPerPageDropdownItem
                  : styles.sortDropdownItem
              } ${
                value === option.value
                  ? variant === "itemsPerPage"
                    ? styles.itemsPerPageDropdownItemActive
                    : styles.sortDropdownItemActive
                  : ""
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
