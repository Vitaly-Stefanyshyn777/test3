"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Subscription.module.css";
import { СheckIcon } from "@/components/Icons/Icons";
import { useAuthStore } from "@/store/auth";
import {
  cancelSubscription,
  fetchUserSubscription,
  UserSubscription,
} from "@/lib/bfbApi";

export default function CurrentPlanCard() {
  const [subscriptionData, setSubscriptionData] =
    useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      console.error("Error loading subscription:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, [user?.id]);

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
        <div className={styles.availablePlans}>
          <h2 className={styles.sectionTitle}>Ваш тариф</h2>
          <div className={styles.loading}>Завантаження...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.currentPlan}>
        <div className={styles.availablePlans}>
          <h2 className={styles.sectionTitle}>Ваш тариф</h2>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.currentPlan}>
      <div className={styles.availablePlans}>
        <h2 className={styles.sectionTitle}>Ваш тариф</h2>
        {subscriptionData?.hasActivePlan && subscriptionData?.currentPlan ? (
          <div className={styles.currentPlanCard}>
            <div className={styles.planPrice}>
              <h3 className={styles.planName}>
                {subscriptionData.currentPlan.name}
              </h3>
              <span className={styles.price}>
                {subscriptionData.currentPlan.price}$/місяць
              </span>
              <span className={styles.period}>
                {subscriptionData.currentPlan.period}
              </span>
              <span className={styles.period}>Ціна підписки</span>
            </div>
            <div className={styles.planFeatures}>
              {subscriptionData.currentPlan.features.map((feature, index) => (
                <div key={index} className={styles.feature}>
                <div className={styles.checkIconBlock}>
                  <СheckIcon />
                </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className={styles.planStatus}>
              {subscriptionData.currentPlan.nextPaymentDate
                ? `Наступне списання: ${subscriptionData.currentPlan.nextPaymentDate}`
                : "Дата наступного списання не вказана"}
            </div>
            <div className={styles.planActions}>
              <button
                className={styles.cancelBtn}
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Скасовуємо..." : "Скасувати підписку"}
              </button>
            </div>
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
