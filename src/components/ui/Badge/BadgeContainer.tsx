"use client";
import React, { useState, useEffect, Children, isValidElement } from "react";
import styles from "./BadgeContainer.module.css";
import Badge from "./Badge";

interface BadgeContainerProps {
  children: React.ReactNode;
  className?: string;
}

const BadgeContainer: React.FC<BadgeContainerProps> = ({
  children,
  className,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1000px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  if (!isMobile) {
    return (
      <div className={`${styles.badgeContainer} ${className || ""}`}>
        {children}
      </div>
    );
  }

  // На мобільному: групуємо new + discount в один блок, hit окремо
  const childrenArray = Children.toArray(children);
  const newBadge = childrenArray.find(
    (child) =>
      isValidElement(child) &&
      child.type === Badge &&
      (child.props as { variant?: string }).variant === "new"
  );
  const discountBadge = childrenArray.find(
    (child) =>
      isValidElement(child) &&
      child.type === Badge &&
      (child.props as { variant?: string }).variant === "discount"
  );
  const hitBadge = childrenArray.find(
    (child) =>
      isValidElement(child) &&
      child.type === Badge &&
      (child.props as { variant?: string }).variant === "hit"
  );

  return (
    <div
      className={`${styles.badgeContainer} ${styles.mobileContainer} ${
        className || ""
      }`}
    >
      {(newBadge || discountBadge) && (
        <div className={styles.mobileTopRow}>
          {newBadge}
          {discountBadge}
        </div>
      )}
      {hitBadge && <div className={styles.mobileHitRow}>{hitBadge}</div>}
    </div>
  );
};

export default BadgeContainer;
