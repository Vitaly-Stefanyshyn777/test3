"use client";
import React from "react";
import { FormData } from "./types";
import s from "./CheckoutSection.module.css";
import SecondaryInput from "@/components/ui/FormFields/SecondaryInput";
import secondaryInputStyles from "@/components/ui/FormFields/SecondaryInput.module.css";

interface PersonalDataFormProps {
  formData: FormData;
  hasDifferentRecipient: boolean;
  setFormData: (data: FormData) => void;
  setHasDifferentRecipient: (value: boolean) => void;
  errors?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    recipientFirstName?: string;
    recipientLastName?: string;
    recipientPhone?: string;
  };
}

export default function PersonalDataForm({
  formData,
  hasDifferentRecipient,
  setFormData,
  setHasDifferentRecipient,
  errors = {},
}: PersonalDataFormProps) {
  return (
    <div className={s.titleFormBlock}>
      <h2 className={s.sectionTitle}>Особисті дані</h2>
      <div className={s.grid2}>
        <SecondaryInput
          label="Ваше ім'я та прізвище"
          id="checkout-form-name-field"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          inputClassName={secondaryInputStyles.inputWhite}
          hasError={!!errors.firstName}
          supportingText={errors.firstName || ""}
        />
        <SecondaryInput
          label="Ваше прізвище"
          id="checkout-form-lastname-field"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          inputClassName={secondaryInputStyles.inputWhite}
          hasError={!!errors.lastName}
          supportingText={errors.lastName || ""}
        />
        <SecondaryInput
          label="Ваш номер телефону"
          id="checkout-form-phone-field"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          inputClassName={secondaryInputStyles.inputWhite}
          hasError={!!errors.phone}
          supportingText={errors.phone || ""}
        />
        <SecondaryInput
          label="Ваша пошта"
          id="checkout-form-email-field"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          inputClassName={secondaryInputStyles.inputWhite}
          hasError={!!errors.email}
          supportingText={errors.email || ""}
        />
      </div>
      <div className={s.checkboxBlock}>
        <label className={s.checkbox}>
          <input
            type="checkbox"
            checked={hasDifferentRecipient}
            onChange={(e) => setHasDifferentRecipient(e.target.checked)}
          />
          <span className={s.checkboxText}>Отримувати буде інша людина</span>
        </label>
      </div>
      {hasDifferentRecipient && (
        <div className={s.titleFormBlock}>
          <h2 className={s.sectionTitle}>Дані отримувача</h2>
          <div className={s.grid2}>
            <SecondaryInput
              label="Ваше ім'я та прізвище"
              id="checkout-recipient-form-name-field"
              value={formData.recipientFirstName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recipientFirstName: e.target.value,
                })
              }
              inputClassName={secondaryInputStyles.inputWhite}
              hasError={!!errors.recipientFirstName}
              supportingText={errors.recipientFirstName || ""}
            />
            <SecondaryInput
              label="Ваше прізвище"
              id="checkout-recipient-form-lastname-field"
              value={formData.recipientLastName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recipientLastName: e.target.value,
                })
              }
              inputClassName={secondaryInputStyles.inputWhite}
              hasError={!!errors.recipientLastName}
              supportingText={errors.recipientLastName || ""}
            />
            <SecondaryInput
              label="Ваш номер телефону"
              id="checkout-recipient-form-phone-field"
              type="tel"
              value={formData.recipientPhone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recipientPhone: e.target.value,
                })
              }
              inputClassName={secondaryInputStyles.inputWhite}
              hasError={!!errors.recipientPhone}
              supportingText={errors.recipientPhone || ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}
