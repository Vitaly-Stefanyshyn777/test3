"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./TrainerProfile.module.css";
import {
  DumbbellIcon,
  ExamTaskIcon,
  LocationIcon,
  WalkingIcon,
  ChevronDownIcon,
} from "@/components/Icons/Icons";
import type { TrainerProfileForm } from "./types";
import InputField from "@/components/ui/FormFields/InputField";

type Props = {
  formData: TrainerProfileForm;
  onChange: (field: keyof TrainerProfileForm, value: string) => void;
  errors?: {
    position?: string;
    experience?: string;
    location?: string;
    desiredBoards?: string;
  };
};

const experienceOptions = [
  { value: "1", label: "1 рік" },
  { value: "2", label: "2 роки" },
  { value: "3", label: "3 роки" },
  { value: "5", label: "5+ років" },
];

const boardsOptions = [
  { value: "1", label: "1 борд" },
  { value: "2", label: "2 борди" },
  { value: "3", label: "3 борди" },
  { value: "5", label: "5+ бордів" },
];

export default function PersonalDataSection({
  formData,
  onChange,
  errors = {},
}: Props) {
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [boardsOpen, setBoardsOpen] = useState(false);
  const experienceRef = useRef<HTMLDivElement>(null);
  const boardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        experienceRef.current &&
        !experienceRef.current.contains(event.target as Node)
      ) {
        setExperienceOpen(false);
      }
      if (
        boardsRef.current &&
        !boardsRef.current.contains(event.target as Node)
      ) {
        setBoardsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getExperienceLabel = () => {
    const option = experienceOptions.find(
      (o) => o.value === formData.experience
    );
    return option ? option.label : "";
  };

  const getBoardsLabel = () => {
    const option = boardsOptions.find(
      (o) => o.value === formData.desiredBoards
    );
    return option ? option.label : "";
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Особисті дані</h3>

      <div className={styles.inputGroup}>
        <InputField
          icon={<DumbbellIcon className={styles.inputIcon} />}
          label="Посада"
          value={formData.position}
          hasError={!!errors.position}
          supportingText={errors.position || "Поле обов'язкове"}
          onChange={(e) => onChange("position", e.target.value)}
        />

        <div className={styles.inputContainer} ref={experienceRef}>
          {(() => {
            const experienceLabel = getExperienceLabel();
            const hasExperience = !!experienceLabel;
            return (
              <span
                className={`${styles.selectLabel} ${
                  hasExperience ? styles.selectLabelFloating : ""
                }`}
              >
                Досвід (років)
              </span>
            );
          })()}
          <div className={styles.inputIconWrapper}>
            <ExamTaskIcon className={styles.inputIcon} />
          </div>
          <button
            type="button"
            className={`${styles.customSelectButton} ${
              getExperienceLabel() ? styles.customSelectButtonFilled : ""
            } ${experienceOpen ? styles.customSelectButtonActive : ""} ${
              errors.experience ? styles.customSelectButtonError : ""
            }`}
            onClick={() => setExperienceOpen(!experienceOpen)}
          >
            <span className={styles.customSelectText}>
              {getExperienceLabel()}
            </span>
            <span
              className={`${styles.customSelectIcon} ${
                experienceOpen ? styles.customSelectIconRotated : ""
              }`}
            >
              {
                <img
                  src="/Frame13213188881.svg"
                  alt=""
                  className={styles.checkIcon}
                />
              }
            </span>
          </button>
          {experienceOpen && (
            <div className={styles.customDropdown}>
              {experienceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={styles.customDropdownItem}
                  onClick={() => {
                    onChange("experience", option.value);
                    setExperienceOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          <span className={styles.fieldErrorText}>
            {errors.experience || ""}
          </span>
        </div>

        <InputField
          icon={<LocationIcon className={styles.inputIcon} />}
          label="Локація"
          value={formData.location}
          hasError={!!errors.location}
          supportingText={errors.location || "Поле обов'язкове"}
          onChange={(e) => onChange("location", e.target.value)}
        />

        <div className={styles.inputContainer} ref={boardsRef}>
          {(() => {
            const boardsLabel = getBoardsLabel();
            const hasBoards = !!boardsLabel;
            return (
              <span
                className={`${styles.selectLabel} ${
                  hasBoards ? styles.selectLabelFloating : ""
                }`}
              >
                Кількість бордів
              </span>
            );
          })()}
          <div className={styles.inputIconWrapper}>
            <WalkingIcon className={styles.inputIcon} />
          </div>
          <button
            type="button"
            className={`${styles.customSelectButton} ${
              getBoardsLabel() ? styles.customSelectButtonFilled : ""
            } ${boardsOpen ? styles.customSelectButtonActive : ""} ${
              errors.desiredBoards ? styles.customSelectButtonError : ""
            }`}
            onClick={() => setBoardsOpen(!boardsOpen)}
          >
            <span className={styles.customSelectText}>{getBoardsLabel()}</span>
            <span
              className={`${styles.customSelectIcon} ${
                boardsOpen ? styles.customSelectIconRotated : ""
              }`}
            >
              {
                <img
                  src="/Frame13213188881.svg"
                  alt=""
                  className={styles.checkIcon}
                />
              }
            </span>
          </button>
          {boardsOpen && (
            <div className={styles.customDropdown}>
              {boardsOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={styles.customDropdownItem}
                  onClick={() => {
                    onChange("desiredBoards", option.value);
                    setBoardsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          <span className={styles.fieldErrorText}>
            {errors.desiredBoards || ""}
          </span>
        </div>
      </div>
    </div>
  );
}
