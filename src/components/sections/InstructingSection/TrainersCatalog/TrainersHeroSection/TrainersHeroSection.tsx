import React from "react";
import styles from "./TrainersHeroSection.module.css";
import { HairDryerIcon } from "@/components/Icons/Icons";

const TrainersHeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <div className={styles.heroContentBlock}>
            <div className={styles.roiBanner}>
              <div className={styles.roiIcon}>
                <HairDryerIcon />
              </div>
              <span className={styles.roiText}>
                СТАРТУЙ ТРЕНУВАННЯ ПРОСТО ЗАРАЗ
              </span>
            </div>

            <h1 className={styles.heroTitle}>ЗНАЙДИ ТРЕНЕРА</h1>

            <p className={styles.heroDescription}>
              Сертифіковані інструктори BFB ближче, ніж здається! <br />
              Обирайте тренера поруч або займайтесь онлайн
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainersHeroSection;
