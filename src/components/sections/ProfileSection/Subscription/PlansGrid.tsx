"use client";

import React, { useEffect, useState } from "react";
import styles from "./Subscription.module.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Сheck2Icon, СheckIcon } from "@/components/Icons/Icons";
import { fetchTariffs, Tariff } from "@/lib/bfbApi";

export default function PlansGrid() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchTariffs();
        setTariffs(data);
      } catch (err) {
        setError("Не вдалося завантажити тарифи");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.availablePlans}>
        <Skeleton width={200} height={28} style={{ marginBottom: "24px" }} className={styles.sectionTitle} />
        <div className={styles.plansGridContainer}>
          <div className={styles.plansContainer}>
            <div className={styles.plansGrid}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className={styles.planCard}>
                  <div className={styles.planPrice}>
                    <Skeleton width={150} height={24} style={{ marginBottom: "12px" }} />
                    <div className={styles.planPriceBlock} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <Skeleton width={120} height={28} />
                      <Skeleton width={50} height={20} />
                    </div>
                    <Skeleton width={180} height={20} />
                  </div>
                  <div className={styles.planFeatures}>
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className={styles.feature} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <Skeleton circle width={20} height={20} />
                        <Skeleton width={200 + Math.random() * 50} height={16} />
                      </div>
                    ))}
                  </div>
                  <Skeleton width="100%" height={48} borderRadius={8} style={{ marginTop: "16px" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.availablePlans}>
        <h2 className={styles.sectionTitle}>Доступні тарифи</h2>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.availablePlans}>
        <h2 className={styles.sectionTitle}>Доступні тарифи</h2>
        <div className={styles.plansGridContainer}>
          <div className={styles.plansContainer}>
            <div className={styles.plansGrid}>
              {tariffs.slice(0, 2).map((tariff, index) => {
                const isPopular = index === 1; // Оптимальний тариф (другий в списку)
                const totalPrice =
                  parseInt(tariff.Price) * parseInt(tariff.Time);

                return (
                  <div
                    key={tariff.id}
                    className={`${styles.planCard} ${
                      isPopular ? styles.popularPlan : ""
                    }`}
                  >
                    {isPopular && (
                      <>
                        <div className={styles.popularBadgeBlock}></div>
                        <div className={styles.popularBadge}>
                          <Сheck2Icon />
                          86% клієнтів обирають
                        </div>
                      </>
                    )}
                    <div className={styles.planPrice}>
                      <h3 className={styles.planName}>
                        {tariff.title.rendered}
                      </h3>
                      <div className={styles.planPriceBlock}>
                        <p className={styles.price}>{tariff.Price}$/місяць</p>
                        <p className={styles.discount}>-30%</p>
                      </div>
                      <span className={styles.period}>
                        {tariff.Time} місяців - {totalPrice} $
                      </span>
                    </div>
                    <div className={styles.planFeatures}>
                      {tariff.Points.map((point, pointIndex) => (
                        <div key={pointIndex} className={styles.feature}>
                          <div className={styles.checkIconBlock}>
                            <СheckIcon />
                          </div>
                          <span>{point.Текст}</span>
                        </div>
                      ))}
                    </div>
                    <button className={styles.selectBtn}>Обрати тариф</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Третій тариф за межами блоку availablePlans */}
      {tariffs.length > 2 && (
        <div className={styles.singlePlan}>
          <div className={styles.plansContainer}>
            {tariffs.slice(2, 3).map((tariff) => {
              const totalPrice = parseInt(tariff.Price) * parseInt(tariff.Time);

              return (
                <div key={tariff.id} className={styles.planCard}>
                  <div className={styles.planPrice}>
                    <h3 className={styles.planName}>{tariff.title.rendered}</h3>
                    <div className={styles.planPriceBlock}>
                      <p className={styles.price}>{tariff.Price}$/місяць</p>
                      <p className={styles.discount}>-30%</p>
                    </div>
                    <span className={styles.period}>
                      {tariff.Time} місяців - {totalPrice} $
                    </span>
                  </div>
                  <div className={styles.planFeatures}>
                    {tariff.Points.map((point, pointIndex) => (
                      <div key={pointIndex} className={styles.feature}>
                        <div className={styles.checkIconBlock}>
                          <СheckIcon />
                        </div>
                        <span>{point.Текст}</span>
                      </div>
                    ))}
                  </div>
                  <button className={styles.selectBtn}>Обрати тариф</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
