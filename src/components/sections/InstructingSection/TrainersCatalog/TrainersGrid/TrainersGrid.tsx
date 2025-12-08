"use client";
import React from "react";
import styles from "./TrainersGrid.module.css";
import TrainerCard from "../TrainerCard/TrainerCard";
import EmptyState from "@/components/ui/EmptyState";

interface Trainer {
  id: string;
  name: string;
  location: string;
  specialization: string;
  image: string;
}

interface TrainersGridProps {
  trainers: Trainer[];
}

const TrainersGrid = ({ trainers }: TrainersGridProps) => {
  if (trainers.length === 0) {
    return <EmptyState variant="instructors" />;
  }

  return (
    <div className={styles.trainersGridContainer}>
      <div className={styles.trainersGrid}>
        {trainers.map((trainer) => {
          const nameParts = trainer.name.split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          return (
            <TrainerCard
              key={trainer.id}
              id={trainer.id}
              firstName={firstName}
              lastName={lastName}
              locations={trainer.location}
              position={trainer.specialization}
              avatar={
                trainer.image
                  ? [
                      {
                        url: trainer.image,
                        filename: trainer.name,
                      },
                    ]
                  : undefined
              }
              gallery={undefined}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TrainersGrid;
