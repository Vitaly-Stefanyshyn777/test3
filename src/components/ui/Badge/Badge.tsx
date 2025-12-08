import React from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "new" | "hit" | "discount";

interface BadgeProps {
  variant: BadgeVariant;
  text?: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant, text, className = "" }) => {
  const defaultText = {
    new: "Новинка",
    hit: "Хіт",
    discount: "-20%",
  };

  const displayText = text || defaultText[variant];

  return (
    <span
      className={`${styles.badge} ${styles[`${variant}Badge`]} ${className}`}
    >
      {displayText}
    </span>
  );
};

export default Badge;
