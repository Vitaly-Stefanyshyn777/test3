"use client";

import React, { useState, useEffect } from "react";
import styles from "./Subscription.module.css";
import { ChevronDownIcon } from "../../../Icons/Icons";

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

  useEffect(() => {
    // Тут можна додати API запит для отримання історії платежів
    // Поки що використовуємо мокові дані
    const mockPayments: PaymentRecord[] = [
      {
        id: 1,
        date: "19/03/2025",
        description: "Підписка BFB Професійний",
        amount: "1500$",
        status: "completed",
      },
      {
        id: 2,
        date: "19/02/2025",
        description: "Підписка BFB Професійний",
        amount: "1500$",
        status: "completed",
      },
      {
        id: 3,
        date: "19/01/2025",
        description: "Підписка BFB Професійний",
        amount: "1500$",
        status: "completed",
      },
      {
        id: 4,
        date: "19/12/2024",
        description: "Підписка BFB Професійний",
        amount: "1500$",
        status: "completed",
      },
    ];

    setTimeout(() => {
      setPayments(mockPayments);
      setTotalPages(5);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDownload = (paymentId: number) => {
    // Тут можна додати логіку завантаження квитанції
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Тут можна додати API запит для завантаження нової сторінки
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
        {payments.map((payment) => (
          <div key={payment.id} className={styles.paymentItem}>
            <div className={styles.paymentDate}>{payment.date}</div>
            <div className={styles.paymentDescription}>
              {payment.description}
            </div>
            <div className={styles.paymentAmount}>{payment.amount}</div>
            <button
              className={styles.downloadButton}
              onClick={() => handleDownload(payment.id)}
            >
              <ChevronDownIcon />
              Скачати
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ←
          </button>

          <div className={styles.paginationNumbers}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`${styles.paginationNumber} ${
                    currentPage === page ? styles.paginationNumberActive : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className={styles.paginationDots}>...</span>
                <button
                  className={styles.paginationNumber}
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            className={styles.paginationButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
