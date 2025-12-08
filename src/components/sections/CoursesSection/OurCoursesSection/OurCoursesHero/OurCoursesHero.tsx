import React from "react";
import styles from "./OurCoursesHero.module.css";
import { Weight4Icon } from "@/components/Icons/Icons";

const OurCoursesHero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <div className={styles.heroContentBlock}>
            <div className={styles.roiBanner}>
              <div className={styles.roiIcon}>
                <Weight4Icon />
              </div>
              <span className={styles.roiText}>Курси bfb</span>
            </div>

            <h1 className={styles.heroTitle}>Наші курси</h1>

            <p className={styles.heroDescription}>
              Наші курси BFB створені для тренерів, залів і всіх, хто хоче
              тренуватись глибше та свідоміше. Знання легко застосовувати на
              практиці у роботі з клієнтами, у студії або для власного розвитку
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurCoursesHero;
