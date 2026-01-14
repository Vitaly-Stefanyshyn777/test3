"use client";

import React, { useState, useEffect } from "react";
import styles from "./Subscription.module.css";
import { ChevronDownloadIcon } from "@/components/Icons/Icons";
import { formatPrice } from "@/lib/priceUtils";

import PaginationNavSubscriptionCurrent from "@/components/ui/PaginationNavSubscriptionCurrent/PaginationNavSubscriptionCurrent";
import { fetchUserOrders } from "@/lib/bfbApi";
import { useAuthStore } from "@/store/auth";

interface PaymentRecord {
  id: number;
  date: string;
  description: string;
  amount: string;
  status: "completed" | "pending" | "failed";
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const loadPaymentHistory = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Отримуємо JWT токен для авторизації
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("wp_jwt") ||
              localStorage.getItem("wp_jwt_override") ||
              undefined
            : undefined;

        const orders = await fetchUserOrders(Number(user.id), token);

        // Перетворюємо замовлення в формат PaymentRecord
        const paymentRecords: PaymentRecord[] = orders.map((order) => ({
          id: order.id,
          date: new Date(order.date_created).toLocaleDateString("uk-UA"),
          description: order.line_items.map((item) => item.name).join(", "),
          amount: order.total,
          status: order.status as "completed" | "pending" | "failed",
        }));

        setPayments(paymentRecords);
        // Розраховуємо загальну кількість сторінок (показуємо по 5 платежів на сторінку)
        setTotalPages(Math.ceil(paymentRecords.length / 5));
      } catch (err) {
        setError("Не вдалося завантажити історію платежів");
        console.error("Error loading payment history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentHistory();
  }, [user?.id]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleDownload = (paymentId: number) => {
    // Тут можна додати логіку завантаження квитанції
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Отримуємо платежі для поточної сторінки
  const getCurrentPagePayments = () => {
    const startIndex = (currentPage - 1) * 5;
    const endIndex = startIndex + 5;
    return payments.slice(startIndex, endIndex);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.paymentHistory}>
        <h2 className={styles.sectionTitle}>Історія платежів</h2>
        <div className={styles.loading}>Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.paymentHistory}>
        <h2 className={styles.sectionTitle}>Історія платежів</h2>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.paymentHistory}>
      <h2 className={styles.sectionTitle}>Історія платежів</h2>

      <div className={styles.paymentList}>
        {getCurrentPagePayments().map((payment) => (
          <div key={payment.id} className={styles.paymentItem}>
            {isMobile ? (
              /* Mobile: Date and Description in container */
              <div className={styles.paymentInfoWrapper}>
                <div className={styles.paymentInfoContainer}>
                  <div className={styles.paymentDate}>{payment.date}</div>
                  {/* <div className={styles.paymentDescription}>
                    {payment.description}
                  </div> */}
                  <div className={styles.paymentAmount}>
                    <span className={styles.paymentAmountValue}>
                      {payment.amount}
                    </span>
                    <span className={styles.paymentAmountCurrency}>$</span>
                  </div>
                </div>
                <div className={styles.paymentDescription}>
                  {payment.description}
                </div>
              </div>
            ) : (
              /* Desktop: Date and Description separate */
              <>
                <div className={styles.paymentDate}>{payment.date}</div>
                <div className={styles.paymentDescription}>
                  {payment.description}
                </div>
                {/* <div className={styles.paymentAmount}>
                  {formatPrice(payment.amount)}
                </div> */}
              </>
            )}

            {/* <div className={styles.paymentAmount}>
              {formatPrice(payment.amount)}
            </div> */}

            <button
              className={styles.downloadButton}
              onClick={() => handleDownload(payment.id)}
            >
              {!isMobile && <ChevronDownloadIcon />}
              Скачати
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <PaginationNavSubscriptionCurrent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
