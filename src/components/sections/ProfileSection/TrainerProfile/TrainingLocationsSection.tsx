"use client";

import React, { useEffect } from "react";
import styles from "./TrainerProfile.module.css";
import { PlusIcon } from "../../../Icons/Icons";
import LocationCard from "./LocationCard";
import TrainingLocationsSectionSkeleton from "./TrainingLocationsSectionSkeleton";
import type { TrainingLocation } from "./types";
// removed unused imports

type Props = {
  onAddClick?: () => void;
  locations?: TrainingLocation[];
  loading?: boolean;
};

export default function TrainingLocationsSection({
  onAddClick,
  locations = [],
  loading = false,
}: Props) {
  // Логуємо тільки коли змінюються локації, а не при кожному ре-рендері
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[TrainingLocationsSection] Локації:", {
        count: locations.length,
        locations: locations.map((l) => ({
          title: l.title,
          phone: l.phone,
          email: l.email,
          coordinates: l.coordinates,
        })),
      });
    }
  }, [locations]);

  if (loading) {
    return <TrainingLocationsSectionSkeleton />;
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Місця проведення тренувань:</h3>

      <div className={styles.locationsContainer}>
        {locations.map((loc, idx) => (
          <LocationCard
            key={`${loc.title}-${idx}-${loc.phone || ""}`}
            title={loc.title}
            phone={loc.phone}
            email={loc.email}
            schedule_five={loc.schedule_five}
            schedule_two={loc.schedule_two}
            address={loc.address}
            coordinates={loc.coordinates}
            onEdit={() =>
              window.dispatchEvent(
                new CustomEvent("trainerLocationEdit", {
                  detail: { index: idx },
                })
              )
            }
            onDelete={() =>
              window.dispatchEvent(
                new CustomEvent("trainerLocationDelete", {
                  detail: { index: idx },
                })
              )
            }
          />
        ))}

        <div className={styles.addGymBtn}>
          <button className={styles.addGymButton} onClick={onAddClick}>
            <span className={styles.addGymIcon}>
              <PlusIcon />
            </span>
          </button>
          <span className={styles.addGymLabel}>Додати зал</span>
        </div>
      </div>
    </div>
  );
}
