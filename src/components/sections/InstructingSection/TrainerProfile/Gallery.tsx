import React, { useState } from "react";
import Image from "next/image";
import styles from "./TrainerProfile.module.css";
import { TrainerUser } from "./types";
import { getGalleryImages } from "./utils";
import { normalizeImageUrl } from "@/lib/imageUtils";

export default function Gallery({ trainer }: { trainer: TrainerUser }) {
  // Використовуємо тільки gallery (як було раніше)
  const galleryImages = getGalleryImages(trainer?.gallery);
  const placeholderImage =
    "https://via.placeholder.com/800x500/f0f0f0/666?text=Галерея";
  const normalizedFirstImage = galleryImages[0]
    ? normalizeImageUrl(galleryImages[0])
    : placeholderImage;
  const [mainImageUrl, setMainImageUrl] = useState(
    normalizedFirstImage !== "/placeholder.svg"
      ? normalizedFirstImage
      : placeholderImage
  );

  return (
    <div className={styles.gallery}>
      <h2>Галерея</h2>
      <div className={styles.galleryContent}>
        <div className={styles.mainImage}>
          <Image
            src={mainImageUrl}
            alt="Галерея тренера"
            width={800}
            height={500}
            unoptimized={
              !galleryImages[0] ||
              mainImageUrl.startsWith("https://via.placeholder.com")
            }
            onError={() => {
              // Якщо зображення не завантажилось, встановлюємо placeholder
              if (mainImageUrl !== placeholderImage) {
                setMainImageUrl(placeholderImage);
              }
            }}
            className={styles.galleryImage}
          />
        </div>
        <div className={styles.galleryNavigation}>
          <button className={styles.navButton}>←</button>
          <div className={styles.dots}>
            <span className={`${styles.dot} ${styles.active}`}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
          <button className={styles.navButton}>→</button>
        </div>
      </div>
    </div>
  );
}
