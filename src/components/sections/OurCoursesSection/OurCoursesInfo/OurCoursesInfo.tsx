"use client";
import React from "react";
import Image from "next/image";
import styles from "./OurCoursesInfo.module.css";

const OurCoursesInfo = () => {
  return (
    <section className={styles.infoSection}>
      <div className={styles.container}>
        <div className={styles.blocksContainer}>
          <div className={styles.infoBlock}>
            <div className={styles.textContent}>
              <div className={styles.badge}>Курс</div>
              <h2 className={styles.title}>
                Інструктор групових
                <br />
                програм від А до Я
              </h2>
              <p className={styles.description}>
                Авторська навчальна програма для тренерів, які хочуть працювати
                за методикою BFB. Системне навчання, сертифікація, інвентар і
                підтримка після курсу – усе, щоб почати новий напрям без зайвих
                кроків.
              </p>
              <a
                href="https://t.me/+UK6OTs2kHIsxZWFi"
                className={styles.detailsBtn}
                target="_blank"
                rel="noopener noreferrer"
              >
                Детальніше
              </a>
            </div>
            <div className={styles.imageContent}>
              <Image
                src="/images/courses/instructor-course.jpg"
                alt="Інструктор групових програм 4.0"
                width={600}
                height={400}
                className={styles.courseImage}
              />
              <div className={styles.imageOverlay}>
                <span className={styles.overlayText}>BFB Fitness</span>
              </div>
            </div>
          </div>

          {/* Другий блок */}
          <div className={styles.infoBlock}>
            <div className={styles.imageContent}>
              <Image
                src="/images/courses/learning-process.jpg"
                alt="Як проходить навчання"
                width={500}
                height={600}
                className={styles.courseImage}
              />
              <div className={styles.imageOverlay}>
                <span className={styles.overlayText}>BFB Fitness</span>
              </div>
            </div>
            <div className={styles.textContent}>
              <div className={styles.badge}>Курс</div>
              <h2 className={styles.title}>Як проходить навчання</h2>

              <div className={styles.features}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <span>🎓</span>
                  </div>
                  <div className={styles.featureContent}>
                    <h3>12 навчальних блоків</h3>
                    <p>
                      Заняття, які можна дивитись у будь-який час та в
                      будь-якому місці
                    </p>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <span>👥</span>
                  </div>
                  <div className={styles.featureContent}>
                    <h3>До 18 людей в групі</h3>
                    <p>
                      Живе спілкування, обмін досвідом, підтримка й однодумців
                    </p>
                  </div>
                </div>

                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <span>📚</span>
                  </div>
                  <div className={styles.featureContent}>
                    <h3>Готуємо до старту</h3>
                    <p>
                      Навчання, яке відразу готує до роботи з людьми і практики
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurCoursesInfo;
