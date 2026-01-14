"use client";
import React from "react";
import styles from "./OrdersHistory.module.css";

const OrdersHistorySkeleton: React.FC = () => (
  <div className={styles.ordersContainer}>
    <div className={styles.header}>
      <h1 className={styles.title}>Історія усіх замовлень</h1>
    </div>

    <div className={styles.divider}></div>

    <div className={styles.ordersList}>
      {[...Array(4)].map((_, index) => (
        <React.Fragment key={index}>
          <div className={styles.orderCard}>
            <div className={styles.orderDetails}>
              <div className={styles.deliveryStatus}>
                <span className={styles.deliveryStatusText}>Доставлено</span>
              </div>
              <div className={styles.productImageWrapper}>
                <div className={styles.productImageContainer}>
                  {/* Завжди показуємо перші 4 позиції в сітці 2x2 з skeleton */}
                  <div
                    className={`${styles.productImage} ${styles["grid-pos-1"]}`}
                  >
                    <div className={styles.skeletonProductImage}></div>
                  </div>
                  <div
                    className={`${styles.productImage} ${styles["grid-pos-2"]}`}
                  >
                    <div className={styles.skeletonProductImage}></div>
                  </div>
                  <div
                    className={`${styles.productImage} ${styles["grid-pos-3"]}`}
                  >
                    <div className={styles.skeletonProductImage}></div>
                  </div>
                  <div
                    className={`${styles.productImage} ${styles["grid-pos-4"]}`}
                  >
                    <div className={styles.skeletonProductImage}></div>
                  </div>
                </div>

                {/* Спільний контейнер для деталей та статусу доставки */}
                <div className={styles.contentWrapper}>
                  <div className={styles.detailRow}>
                    <div className={styles.productHeader}>
                      <h3 className={styles.productName}>
                        <div className={styles.skeletonProductName}></div>
                        <div className={styles.productQuantity}>
                          <p className={styles.productQuantityText}>
                            <div
                              className={styles.skeletonProductQuantity}
                            ></div>
                          </p>
                        </div>
                      </h3>
                    </div>

                    <div className={styles.orderMeta}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>
                          Дата замовлення:
                        </span>
                        <span className={styles.orderDate}>
                          <div className={styles.skeletonOrderDate}></div>
                        </span>
                      </div>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>
                          Номер замовлення:
                        </span>
                        <span className={styles.orderNumber}>
                          <div className={styles.skeletonOrderNumber}></div>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Спільний контейнер для інформації та кнопок */}
            <div className={styles.orderFooter}>
              {/* Детальна інформація про замовлення */}
              <div className={styles.orderInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    <div className={styles.skeletonInfoLabel}></div>
                  </span>
                  <span className={styles.infoValue}>
                    <div className={styles.skeletonInfoValue}></div>
                  </span>
                </div>
              </div>

              {/* Кнопки дій */}
              <div className={styles.orderActions}>
                <button className={styles.repeatOrderBtn}>
                  Повторити замовлення
                </button>
                <button className={styles.viewDetailsBtn}>Детальніше</button>
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default OrdersHistorySkeleton;
