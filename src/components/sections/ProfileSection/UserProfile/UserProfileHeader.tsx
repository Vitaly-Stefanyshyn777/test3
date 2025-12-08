"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./UserProfile.module.css";

type Props = { displayName: string; email: string; avatar: string };

export default function UserProfileHeader({
  displayName,
  email,
  avatar,
}: Props) {
  // Стійкий src: не міняємо на плейсхолдер при короткочасних помилках мережі
  const initialSrc = useMemo(
    () => avatar || "/images/avatar1.png",
    [avatar]
  );
  const [src, setSrc] = useState(initialSrc);
  const lastGoodSrcRef = useRef<string>(initialSrc);

  useEffect(() => {
    if (!avatar) return;
    // Попередньо завантажуємо новий аватар; міняємо src лише після успішного завантаження
    if (typeof window === "undefined") return;
    const img = new window.Image();
    img.onload = () => {
      lastGoodSrcRef.current = avatar;
      setSrc(avatar);
    };
    img.onerror = () => {
      // Ігноруємо помилку: лишаємо попередній робочий src
      setSrc(lastGoodSrcRef.current || "/images/avatar1.png");
    };
    img.src = avatar;
  }, [avatar]);

  return (
    <div className={styles.userProfile}>
      <div className={styles.avatarContainer}>
        <img
          src={src}
          alt={`${displayName} avatar`}
          width={80}
          height={80}
          className={styles.avatar}
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className={styles.userInfo}>
        <h2 className={styles.greeting}>Вітаємо, {displayName}!</h2>
        <div className={styles.emailContainer}>
          <span className={styles.email}>{email}</span>
        </div>
      </div>
    </div>
  );
}
