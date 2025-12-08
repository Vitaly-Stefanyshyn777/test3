import React from "react";
import styles from "./Locations.module.css";

const Locations: React.FC = () => {
  const workLocations: unknown[] = [];
  const experience: unknown[] = [];

  if (workLocations.length === 0 && experience.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.locationCard}>
          <div className={styles.imagesContainer}>
            <div className={styles.imagePlaceholder}>
              <div className={styles.placeholderText}>🏋️</div>
            </div>
            <div className={styles.imagePlaceholder}>
              <div className={styles.placeholderText}>💪</div>
            </div>
          </div>

          <h2 className={styles.locationName}>Тренувальний зал</h2>

          <div className={styles.contactInfo}>
            <div className={styles.leftColumn}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Телефон:</span>
                <span className={styles.value}>+380 95 437 25 75</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Час роботи у вихідні:</span>
                <span className={styles.value}>10:00 - 20:00</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Адреса:</span>
                <span className={styles.value}>
                  м. Київ, Хрещатик, будинок 23/А
                </span>
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>
                  bfb.board.ukraine@gmail.com
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Час роботи у будні:</span>
                <span className={styles.value}>09:00 - 22:00</span>
              </div>
            </div>
          </div>

          <div className={styles.socialIcons}>
            <div className={styles.socialIcon}>📷</div>
            <div className={styles.socialIcon}>✈️</div>
            <div className={styles.socialIcon}>💬</div>
            <div className={styles.socialIcon}>📘</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Locations;
