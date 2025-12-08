"use client";

import React, { useState, useEffect } from "react";
import styles from "./Subscription.module.css";
import { СheckIcon } from "../../../Icons/Icons";
import { useAuthStore } from "../../../../store/auth";

export default function CurrentPlanCard() {
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Тут можна додати логіку перевірки активного тарифу
    // Поки що встановлюємо true для демонстрації
    setHasActivePlan(true);
  }, [user?.id]);

  return (
    <div className={styles.currentPlan}>
      <div className={styles.availablePlans}>
        <h2 className={styles.sectionTitle}>Ваш тариф</h2>
        {hasActivePlan ? (
          <div className={styles.currentPlanCard}>
            <div className={styles.planPrice}>
              <h3 className={styles.planName}>Базовий</h3>
              <span className={styles.price}>15$/місяць</span>
              <span className={styles.period}>1-місяць</span>
            </div>
            <div className={styles.planFeatures}>
              <div className={styles.feature}>
                <div className={styles.checkIconBlock}>
                  <СheckIcon />
                </div>
                <span>Можливість бути в пошуку як тренер</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.checkIconBlock}>
                  <СheckIcon />
                </div>
                <span>Повний доступ до всіх функцій платформи</span>
              </div>
            </div>
            <div className={styles.planStatus}>
              Підписка активна до: 01.08.2025
            </div>
            <button className={styles.cancelBtn}>Скасувати підписку</button>
          </div>
        ) : (
          <div className={styles.noPlanMessage}>
            <p>Немає тарифу</p>
          </div>
        )}
      </div>
    </div>
  );
}
