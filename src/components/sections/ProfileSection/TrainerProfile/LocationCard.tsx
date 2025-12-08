"use client";

import React from "react";
import styles from "./TrainerProfile.module.css";
import {
  DumbbellsIcon,
  HandleIcon,
  GarbagerIcon,
} from "@/components/Icons/Icons";

type Props = {
  title: string;
  phone?: string;
  email?: string;
  schedule_five?: string;
  schedule_two?: string;
  address?: string;
  coordinates?: string; // координати у форматі "lat, lng"
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function LocationCard({
  title,
  phone,
  email,
  schedule_five,
  schedule_two,
  address,
  coordinates,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className={styles.locationCard}>
      <div className={styles.locationHeader}>
        <div className={styles.locationIcon}>
          <DumbbellsIcon />
        </div>
        <h4 className={styles.locationTitle}>{title || "Назва залу"}</h4>
      </div>
      <div className={styles.locationInfo}>
        <div className={styles.contactRowBlock}>
          <div className={styles.contactRow}>
            <div className={styles.contactInfo}>
              <span className={styles.contactLabel}>Телефон:</span>
              <span className={styles.contactValue}>{phone || "—"}</span>
            </div>
            <div className={styles.contactInfo}>
              <span className={styles.contactLabel}>Email:</span>
              <span className={styles.contactValue}>{email || "—"}</span>
            </div>
          </div>
          <div className={styles.workingHours}>
            <div className={styles.hoursRow}>
              <div className={styles.hoursInfo}>
                <span className={styles.hoursLabel}>Час роботи у будні:</span>
                <span className={styles.hoursValue}>
                  {schedule_five || "—"}
                </span>
              </div>
              <div className={styles.hoursInfo}>
                <span className={styles.hoursLabel}>Час роботи у вихідні:</span>
                <span className={styles.hoursValue}>{schedule_two || "—"}</span>
              </div>
            </div>
          </div>
          <div className={styles.address}>
            <span className={styles.addressLabel}>Адреса:</span>
            <span className={styles.addressValue}>{address || "—"}</span>
          </div>
          {coordinates && (
            <div className={styles.address}>
              <span className={styles.addressLabel}>Координати:</span>
              <span className={styles.addressValue}>{coordinates}</span>
            </div>
          )}
        </div>
        <div className={styles.addressActionsContainer}>
          <div className={styles.separatorLine}></div>
          <div className={styles.locationActions}>
            <button className={styles.editBtn} onClick={onEdit}>
              <span>
                <HandleIcon />
              </span>
              Змінити дані
            </button>
            <button className={styles.deleteBtn} onClick={onDelete}>
              <span>
                <GarbagerIcon />
              </span>
              Видалити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
