"use client";
import React from "react";
import PersonalDataForm from "./PersonalDataForm";
import DeliveryForm from "./DeliveryForm";
import PaymentForm from "./PaymentForm";
import CommentForm from "./CommentForm";
import { FormData, CheckoutErrors } from "./types";
import s from "./CheckoutSection.module.css";

interface CheckoutFormProps {
  formData: FormData;
  setFormData: (data: Partial<FormData>) => void;
  hasDifferentRecipient: boolean;
  setHasDifferentRecipient: (value: boolean) => void;
  deliveryType: string;
  setDeliveryType: (value: string) => void;
  errors: CheckoutErrors;
  clearFieldError: (fieldName: keyof CheckoutErrors) => void;
  setIsMapOpen: (value: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function CheckoutForm({
  formData,
  setFormData,
  hasDifferentRecipient,
  setHasDifferentRecipient,
  deliveryType,
  setDeliveryType,
  errors,
  clearFieldError,
  setIsMapOpen,
  onSubmit,
  isSubmitting,
}: CheckoutFormProps) {
  const checkboxAgreements = (
    <div className={s.checkboxContainer}>
      <div className={s.checkboxBlock}>
        <label className={s.checkbox}>
          <input type="checkbox" />
          <span className={s.checkboxText}>Підписатись на e-mail розсилку</span>
        </label>
      </div>
      <div className={s.checkboxBlock}>
        <label className={s.checkbox}>
          <input type="checkbox" />
          <span className={s.checkboxText}>
            Приймаю умови оферти, політики конфіденційності та заяви про обробку
            персональних даних
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className={s.left}>
      <PersonalDataForm
        formData={formData}
        hasDifferentRecipient={hasDifferentRecipient}
        setFormData={(data) => {
          setFormData(data);
          // Очищаємо помилки при зміні полів
          if (
            data.firstName !== undefined &&
            data.firstName !== formData.firstName
          )
            clearFieldError("firstName");
          if (
            data.lastName !== undefined &&
            data.lastName !== formData.lastName
          )
            clearFieldError("lastName");
          if (data.phone !== undefined && data.phone !== formData.phone)
            clearFieldError("phone");
          if (data.email !== undefined && data.email !== formData.email)
            clearFieldError("email");
          if (
            data.recipientFirstName !== undefined &&
            data.recipientFirstName !== formData.recipientFirstName
          )
            clearFieldError("recipientFirstName");
          if (
            data.recipientLastName !== undefined &&
            data.recipientLastName !== formData.recipientLastName
          )
            clearFieldError("recipientLastName");
          if (
            data.recipientPhone !== undefined &&
            data.recipientPhone !== formData.recipientPhone
          )
            clearFieldError("recipientPhone");
        }}
        setHasDifferentRecipient={setHasDifferentRecipient}
        errors={errors}
      />

      <DeliveryForm
        deliveryType={deliveryType}
        formData={formData}
        setDeliveryType={(value) => {
          setDeliveryType(value);
          clearFieldError("deliveryType");
        }}
        setFormData={(data) => {
          setFormData(data);
          // Очищаємо помилки при зміні полів доставки
          if (data.city !== undefined && data.city !== formData.city)
            clearFieldError("city");
          if (data.branch !== undefined && data.branch !== formData.branch)
            clearFieldError("branch");
          if (data.house !== undefined && data.house !== formData.house)
            clearFieldError("house");
          if (
            data.building !== undefined &&
            data.building !== formData.building
          )
            clearFieldError("building");
          if (
            data.apartment !== undefined &&
            data.apartment !== formData.apartment
          )
            clearFieldError("apartment");
        }}
        setIsMapOpen={setIsMapOpen}
        errors={errors}
      />

      <PaymentForm formData={formData} setFormData={setFormData} />

      <CommentForm formData={formData} setFormData={setFormData} />

      <div className={s.buttonBlock}>
        <button
          className={s.primaryWide}
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Обробка замовлення..." : "Підтвердити замовлення"}
        </button>
        {checkboxAgreements}
      </div>
    </div>
  );
}
