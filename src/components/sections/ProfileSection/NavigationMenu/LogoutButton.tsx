"use client";

import React from "react";
import styles from "./NavigationMenu.module.css";
import type { NavigationItem } from "./types";

type Props = {
  item: NavigationItem;
  isActive: boolean;
  onLogout: () => Promise<void> | void;
};

export default function LogoutButton({ item, isActive, onLogout }: Props) {
  return (
    <li className={styles.menuItem}>
      <button
        type="button"
        className={`${styles.menuLink} ${isActive ? styles.active : ""}`}
        onClick={onLogout}
      >
        <span className={styles.menuIcon}>
          <item.icon className={styles.iconSvg} />
        </span>
        <span className={styles.menuLabel}>{item.label}</span>
      </button>
    </li>
  );
}
