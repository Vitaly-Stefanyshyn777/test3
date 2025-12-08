"use client";
import React from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title?: string;
  description?: string;
  variant?: "courses" | "products" | "instructors" | "default";
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  variant = "default",
}) => {
  // Дефолтні тексти для різних варіантів
  const defaultTexts = {
    courses: {
      title: "Упс, курси відсутні",
      description: "На жаль, за вашими критеріями курсів не знайдено",
    },
    products: {
      title: "Упс, продукти відсутні",
      description: "На жаль, за вашими критеріями продуктів не знайдено",
    },
    instructors: {
      title: "Упс, інструктори відсутні",
      description: "На жаль, за вашими критеріями інструкторів не знайдено",
    },
    default: {
      title: "Упс, дані відсутні",
      description: "На жаль, за вашими критеріями нічого не знайдено",
    },
  };

  const finalTitle = title || defaultTexts[variant].title;
  const finalDescription = description || defaultTexts[variant].description;

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>🔍</div>
      <h3 className={styles.emptyTitle}>{finalTitle}</h3>
      {finalDescription && (
        <p className={styles.emptyDescription}>{finalDescription}</p>
      )}
    </div>
  );
};

export default EmptyState;

