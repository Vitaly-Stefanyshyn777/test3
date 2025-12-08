"use client";

import React from "react";
import Link from "next/link";
import styles from "./NavigationMenu.module.css";
import type { NavigationItem } from "./types";

type Props = {
  item: NavigationItem;
  isActive: boolean;
};

export default function NavigationLink({ item, isActive }: Props) {
  return (
    <li className={styles.menuItem}>
      <Link
        href={item.href}
        className={`${styles.menuLink} ${isActive ? styles.active : ""}`}
      >
        <span className={styles.menuIcon}>
          <item.icon className={styles.iconSvg} />
        </span>
        <span className={styles.menuLabel}>{item.label}</span>
      </Link>
    </li>
  );
}
