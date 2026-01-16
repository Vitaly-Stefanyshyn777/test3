"use client";

import React, { useState, useEffect } from "react";
import styles from "./Subscription.module.css";
import { СheckIcon } from "@/components/Icons/Icons";
import { fetchUserSubscription, UserSubscription } from "@/lib/bfbApi";
import { useAuthStore } from "@/store/auth";

interface SubscriptionRecord {
  id: number;
  planName: string;
  price: string;
  period: string;
  purchaseDate: string;
  status: string;
}

export default function SubscriptionHistory() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const loadSubscriptionHistory = async () => {
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

        const data: UserSubscription = await fetchUserSubscription(
          Number(user.id),
          token
        );

        if (data.subscriptionHistory) {
          setSubscriptions(data.subscriptionHistory);
        }
      } catch (err) {
        setError("Не вдалося завантажити історію підписок");
        console.error("Error loading subscription history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionHistory();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className={styles.subscriptionHistory}>
        <h2 className={styles.sectionTitle}>Історія підписок</h2>
        <div className={styles.loading}>Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.subscriptionHistory}>
        <h2 className={styles.sectionTitle}>Історія підписок</h2>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className={styles.subscriptionHistory}>
        <h2 className={styles.sectionTitle}>Історія підписок</h2>
        <div className={styles.noSubscriptions}>
          У вас немає придбаних підписок
        </div>
      </div>
    );
  }

  return (
    <div className={styles.subscriptionHistory}>
      <h2 className={styles.sectionTitle}>Історія підписок</h2>

      <div className={styles.subscriptionList}>
        {subscriptions.map((subscription) => (
          <div key={subscription.id} className={styles.subscriptionItem}>
            <div className={styles.subscriptionDate}>
              {subscription.purchaseDate}
            </div>
            <div className={styles.subscriptionName}>
              Підписка BFB {subscription.planName}
            </div>
            <div className={styles.subscriptionPrice}>{subscription.price}</div>
            <div className={styles.subscriptionCurrency}>
              {/* тут має бути знак валюти */}
            </div>
            <button className={styles.downloadButton}>Скачати</button>
          </div>
        ))}
      </div>
    </div>
  );
}
