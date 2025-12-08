"use client";

import React from "react";
import styles from "./PersonalData.module.css";

import {
  NumberIcon,
  TelegramIcon,
  EmailIcon,
  InstagramIcon,
} from "../../../Icons/Icons";
import InputField from "../../../ui/FormFields/InputField";

type Props = {
  phone: string;
  telegram: string;
  email: string;
  instagram: string;
  onChange: (
    field: "phone" | "telegram" | "email" | "instagram",
    value: string
  ) => void;
};

export default function ContactsSection({
  phone,
  telegram,
  email,
  instagram,
  onChange,
}: Props) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Контактні дані</h3>
      <div className={styles.inputGroup}>
        <div className={styles.wrapperBlock}>
          <InputField
            icon={<NumberIcon />}
            label="Ваш номер телефону"
            id="profile-contacts-phone-field"
            type="tel"
            value={phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
          <InputField
            icon={<TelegramIcon />}
            label="Нікнейм Telegram"
            id="profile-contacts-telegram-field"
            value={telegram}
            onChange={(e) => onChange("telegram", e.target.value)}
          />
        </div>
        <div className={styles.wrapperBlock}>
          <InputField
            icon={<EmailIcon />}
            label="Ваша пошта"
            id="profile-contacts-email-field"
            type="email"
            value={email}
            onChange={(e) => onChange("email", e.target.value)}
          />
          <InputField
            icon={<InstagramIcon />}
            label="Нікнейм Instagram"
            value={instagram}
            onChange={(e) => onChange("instagram", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
