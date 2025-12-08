"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./TrainerCard.module.css";
import { normalizeImageUrl } from "@/lib/imageUtils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface TrainerCardProps {
  id: string;
  firstName: string;
  lastName: string;
  locations?: string;
  position?: string;
  avatar?: Array<{
    url: string;
    filename: string;
  }>;
  gallery?: Array<{
    url: string;
    filename: string;
  }>;
}

const TrainerCard = ({
  id,
  firstName,
  lastName,
  locations,
  position,
  avatar,
  gallery,
}: TrainerCardProps) => {
  const name = `${firstName} ${lastName}`;

  const rawImageUrl = avatar?.[0]?.url || gallery?.[0]?.url;
  const normalizedImageUrl = rawImageUrl 
    ? normalizeImageUrl(rawImageUrl) 
    : "https://via.placeholder.com/280x280/f0f0f0/666?text=Тренер";
  
  const initialImageUrl = normalizedImageUrl !== "/placeholder.svg" 
    ? normalizedImageUrl 
    : "https://via.placeholder.com/280x280/f0f0f0/666?text=Тренер";

  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [imageLoaded, setImageLoaded] = useState(false);
  const placeholderUrl = "https://via.placeholder.com/280x280/f0f0f0/666?text=Тренер";

  return (
    <Link href={`/trainers/${id}`} className={styles.trainerCard}>
      <div className={styles.cardImage}>
        {!imageLoaded && (
          <Skeleton
            height="100%"
            width="100%"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
            }}
          />
        )}
        <Image
          src={imageUrl}
          alt={name}
          width={280}
          height={280}
          unoptimized={imageUrl.startsWith("https://via.placeholder.com")}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            // Якщо зображення не завантажилось, встановлюємо placeholder
            if (imageUrl !== placeholderUrl) {
              setImageUrl(placeholderUrl);
            }
            setImageLoaded(true); // Показуємо placeholder навіть якщо помилка
          }}
          className={styles.trainerImage}
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
      </div>
      <div className={styles.cardContent}>
        <div className={styles.location}>{locations || "Місто не вказано"}</div>
        <h3 className={styles.trainerName}>{name}</h3>
        <p className={styles.specialization}>{position || "Фітнес тренер"}</p>
      </div>
    </Link>
  );
};

export default TrainerCard;
