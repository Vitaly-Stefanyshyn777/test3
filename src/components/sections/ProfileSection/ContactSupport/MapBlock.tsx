"use client";

import React from "react";
import Image from "next/image";
import styles from "./ContactSupport.module.css";

const EMBED_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=22.7059%2C48.4386%2C22.7206%2C48.4456&layer=mapnik";

const MapBlock: React.FC<{ mapUrl: string }> = ({ mapUrl }) => {
  const handleOpenMap = () => {
    if (mapUrl && mapUrl !== "#") {
      window.open(mapUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={styles.mapBlock}>
      <iframe
        src={EMBED_URL}
        title="Map location"
        loading="lazy"
        className={styles.mapIframe}
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className={styles.mapIcons}>
        <button
          type="button"
          className={`${styles.mapIcon} ${styles.mapIconPrimary}`}
          onClick={handleOpenMap}
          aria-label="Відкрити в Google Maps"
        >
          <Image
            src="/Frame1000003304.svg"
            alt="Google Maps"
            width={54}
            height={54}
            unoptimized
          />
        </button>
        <button
          type="button"
          className={`${styles.mapIcon} ${styles.mapIconSecondary}`}
          onClick={handleOpenMap}
          aria-label="Маркер локації"
        >
          <Image
            src="/Frame1000003232.svg"
            alt="Пін локації"
            width={37}
            height={37}
            unoptimized
          />
        </button>
      </div>
    </div>
  );
};

export default MapBlock;
