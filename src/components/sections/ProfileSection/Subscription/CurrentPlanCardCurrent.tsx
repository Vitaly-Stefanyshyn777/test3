"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./SubscriptionCurrent.module.css";
import { СheckIcon } from "@/components/Icons/Icons";
import { useAuthStore } from "@/store/auth";

export default function CurrentPlanCard() {
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Тут можна додати логіку перевірки активного тарифу
    // Поки що встановлюємо true для демонстрації
    setHasActivePlan(true);
  }, [user?.id]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <div className={styles.currentPlan}>
      {hasActivePlan ? (
        <div className={styles.currentPlanContainer}>
          {/* Plan name and features block */}
          <div className={styles.planInfoBlock}>
            <h4 className={styles.planName}>Професійний</h4>
            <div className={styles.planFeatures}>
              <div className={styles.feature}>
                <span>
                  Повний доступ до всіх функцій платформи Можливість бути в
                  пошуку як тренер
                </span>
              </div>
            </div>
          </div>

          {isMobile ? (
            /* Mobile: Price and Payment blocks in container */
            <div className={styles.priceAndPaymentContainer}>
              {/* Price block */}
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Ціна підписки;</span>
                <div className={styles.priceInfo}>
                  <div className={styles.priceAmountBlock}>
                    <span className={styles.priceAmount}>1500</span>
                    <span className={styles.priceCurrency}>$</span>
                  </div>
                  <span className={styles.pricePeriodSeparator}>/</span>
                  <span className={styles.pricePeriod}>місяць</span>
                </div>
              </div>

              {/* Next payment block */}
              <div className={styles.nextPaymentBlock}>
                <span className={styles.nextPaymentLabel}>
                  Наступне списання
                </span>
                <span className={styles.nextPaymentDate}>13 травня 2025</span>
              </div>
            </div>
          ) : (
            /* Desktop: Price and Payment blocks separate */
            <>
              {/* Price block */}
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Ціна підписки;</span>
                <div className={styles.priceInfo}>
                  <div className={styles.priceAmountBlock}>
                    <span className={styles.priceAmount}>1500</span>
                    <span className={styles.priceCurrency}>$</span>
                  </div>
                  <span className={styles.pricePeriodSeparator}>/</span>
                  <span className={styles.pricePeriod}>місяць</span>
                </div>
              </div>

              {/* Next payment block */}
              <div className={styles.nextPaymentBlock}>
                <span className={styles.nextPaymentLabel}>
                  Наступне списання
                </span>
                <span className={styles.nextPaymentDate}>13 травня 2025</span>
              </div>
            </>
          )}

          {/* Actions block */}
          <div className={styles.actionsBlock}>
            <Link href="/profile/subscription" className={styles.changePlanBtn}>
              Змінити план
            </Link>
            <button className={styles.cancelBtn}>Скасувати</button>
          </div>
        </div>
      ) : (
        <div className={styles.noPlanMessage}>
          <p>Немає тарифу</p>
        </div>
      )}
    </div>
  );
}
