import React, { useState, useEffect, useRef } from "react";
import styles from "./DropdownField.module.css";
import { Check4Icon } from "@/components/Icons/Icons";

export interface BranchDropdownOption {
  value: string;
  label: string;
}

interface BranchDropdownFieldProps {
  label: string;
  value: string;
  options: BranchDropdownOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  showLabel?: boolean;
  icon: React.ReactNode;
  hasError?: boolean;
  supportingText?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  backgroundColor?: "bg-color" | "white";
}

const BranchDropdownField: React.FC<BranchDropdownFieldProps> = ({
  label,
  value,
  options,
  placeholder,
  onChange,
  showLabel = true,
  icon,
  hasError = false,
  supportingText = "",
  isOpen: controlledIsOpen,
  onOpenChange,
  backgroundColor = "bg-color",
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    if (onOpenChange) {
      onOpenChange(newIsOpen);
    } else {
      setInternalIsOpen(newIsOpen);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setInternalIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const currentLabel =
    options.find((o) => o.value === value)?.label || placeholder || label;

  return (
    <div
      ref={containerRef}
      className={styles.container}
      data-error={hasError ? "true" : "false"}
    >
      {showLabel && <span className={styles.label}>{label}</span>}
      <div className={styles.selectWrapper}>
        <button
          type="button"
          className={`${styles.selectButton} ${
            value ? styles.selectButtonFilled : ""
          } ${isOpen ? styles.selectButtonActive : ""} ${
            hasError ? styles.selectButtonError : ""
          } ${backgroundColor === "white" ? styles.selectButtonWhite : ""}`}
          onClick={handleToggle}
        >
          <span className={styles.selectText}>
            {icon}
            {currentLabel}
          </span>
          <span
            className={`${styles.icon} ${isOpen ? styles.iconRotated : ""}`}
            aria-hidden="true"
          >
            <Check4Icon />
          </span>
        </button>
        {isOpen && (
          <div className={styles.dropdown}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={styles.dropdownItem}
                onClick={() => {
                  onChange(option.value);
                  if (onOpenChange) {
                    onOpenChange(false);
                  } else {
                    setInternalIsOpen(false);
                  }
                }}
              >
                <span className={styles.itemIcon}>{icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {hasError && supportingText && (
        <div className={styles.supportingTextWrapper}>
          <span className={styles.supportingText}>{supportingText}</span>
        </div>
      )}
    </div>
  );
};

export default BranchDropdownField;

