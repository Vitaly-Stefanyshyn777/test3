"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./SubscriptionCurrent.module.css";
import { useAuthStore } from "@/store/auth";
import {
  cancelSubscription,
  fetchUserSubscription,
  type UserSubscription,
} from "@/lib/bfbApi";

export default function CurrentPlanCard() {
  const [subscriptionData, setSubscriptionData] =
    useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const user = useAuthStore((s) => s.user);

  const loadSubscriptionData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("wp_jwt") ||
            localStorage.getItem("wp_jwt_override") ||
            undefined
          : undefined;

      const data = await fetchUserSubscription(Number(user.id), token);
      setSubscriptionData(data);
    } catch (err) {
      setError("Не вдалося завантажити інформацію про підписку");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, [user?.id]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleCancel = async () => {
    const userId = user?.id ? Number(user.id) : NaN;
    if (!Number.isFinite(userId) || userId <= 0) return;
    if (!confirm("Скасувати підписку?")) return;

    try {
      setIsCancelling(true);
      await cancelSubscription({ userId });
      await loadSubscriptionData();
      alert("Підписку скасовано.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Невідома помилка";
      alert(`Не вдалося скасувати підписку. ${msg}`);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.currentPlan}>
        <div className={styles.currentPlanContainer}>Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.currentPlan}>
        <div className={styles.currentPlanContainer}>{error}</div>
      </div>
    );
  }

  const hasActivePlan = !!subscriptionData?.hasActivePlan && !!subscriptionData?.currentPlan;
  const plan = subscriptionData?.currentPlan;

  // Тимчасові статичні дані для fallback (якщо немає активного плану з бекенду)
  const fallbackPlan = {
    name: "Професійний",
    price: "1500",
    nextPaymentDate: "13 травня 2025",
    features: [
      "Повний доступ до всіх функцій платформи Можливість бути в пошуку як тренер",
    ],
  };

  // Використовуємо дані з бекенду, якщо є, інакше статичні
  const displayPlan = plan || (hasActivePlan ? null : fallbackPlan);
  const isFallback = !plan && !hasActivePlan;

  return (
    <div className={styles.currentPlan}>
      {displayPlan ? (
        <div className={styles.currentPlanContainer}>
          <div className={styles.planInfoBlock}>
            <h4 className={styles.planName}>{displayPlan.name}</h4>
            <div className={styles.planFeatures}>
              {(displayPlan.features || []).slice(0, 3).map((f, idx) => (
                <div key={idx} className={styles.feature}>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {isMobile ? (
            <div className={styles.priceAndPaymentContainer}>
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Ціна підписки;</span>
                <div className={styles.priceInfo}>
                  <div className={styles.priceAmountBlock}>
                    <span className={styles.priceAmount}>{displayPlan.price}</span>
                    <span className={styles.priceCurrency}>$</span>
                  </div>
                  <span className={styles.pricePeriodSeparator}>/</span>
                  <span className={styles.pricePeriod}>місяць</span>
                </div>
              </div>

              <div className={styles.nextPaymentBlock}>
                <span className={styles.nextPaymentLabel}>Наступне списання</span>
                <span className={styles.nextPaymentDate}>
                  {displayPlan.nextPaymentDate || "Не вказано"}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Ціна підписки;</span>
                <div className={styles.priceInfo}>
                  <div className={styles.priceAmountBlock}>
                    <span className={styles.priceAmount}>{displayPlan.price}</span>
                    <span className={styles.priceCurrency}>$</span>
                  </div>
                  <span className={styles.pricePeriodSeparator}>/</span>
                  <span className={styles.pricePeriod}>місяць</span>
                </div>
              </div>

              <div className={styles.nextPaymentBlock}>
                <span className={styles.nextPaymentLabel}>Наступне списання</span>
                <span className={styles.nextPaymentDate}>
                  {displayPlan.nextPaymentDate || "Не вказано"}
                </span>
              </div>
            </>
          )}

          <div className={styles.actionsBlock}>
            <Link href="/profile/subscription" className={styles.changePlanBtn}>
              Змінити план
            </Link>
            {!isFallback && (
              <button
                className={styles.cancelBtn}
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Скасовуємо..." : "Скасувати"}
              </button>
            )}
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
