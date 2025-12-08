"use client";

import React from "react";
import styles from "./PersonalData.module.css";
import { UserIcon } from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";

type Props = {
  firstName: string;
  lastName: string;
  onChange: (firstName: string, lastName: string) => void;
};

export default function UsernameSection({
  firstName,
  lastName,
  onChange,
}: Props) {
  // Об'єднуємо ім'я та прізвище для відображення в одному полі
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Ім&#39;я користувача</h3>

      <div className={styles.inputGroup}>
        <div className={`${styles.wrapperBlock} ${styles.wrapperBlockSingle}`}>
          <InputField
            icon={<UserIcon />}
            label="Ваше ім'я та прізвище"
            id="profile-username-name-field"
            value={fullName}
            onChange={(e) => {
              // Зберігаємо все значення як є, дозволяємо пробіли
              const value = e.target.value;
              // Розділяємо на перше слово і решту (зберігаємо всі пробіли в lastName)
              const trimmedValue = value.trimStart(); // Видаляємо тільки пробіли на початку
              const firstSpaceIndex = trimmedValue.indexOf(" ");
              
              if (firstSpaceIndex === -1) {
                // Немає пробілів - все в firstName
                onChange(trimmedValue, "");
              } else {
                // Є пробіли - перше слово в firstName, решта (включно з пробілами) в lastName
                const first = trimmedValue.substring(0, firstSpaceIndex);
                // Беремо все після першого пробілу, включаючи всі інші пробіли
                const last = trimmedValue.substring(firstSpaceIndex + 1);
                onChange(first, last);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
