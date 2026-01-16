"use client";
import { useState } from "react";
import {
  FormData,
  CheckoutErrors,
} from "@/components/sections/CheckoutSection/types";

export function useCheckoutState() {
  // Стан форми
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    recipientFirstName: "",
    recipientLastName: "",
    recipientPhone: "",
    city: "",
    branch: "",
    house: "",
    building: "",
    apartment: "",
    paymentMethod: "Накладений платіж",
    comment: "",
    mailSend: false,
    acceptTerms: false,
  });

  // Стан помилок
  const [errors, setErrors] = useState<CheckoutErrors>({});

  // Стан доставки
  const [deliveryType, setDeliveryType] = useState("");

  // Стан отримувача
  const [hasDifferentRecipient, setHasDifferentRecipient] = useState(false);

  // Стан карти
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Функція для очищення помилки конкретного поля
  const clearFieldError = (fieldName: keyof CheckoutErrors) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Функція для оновлення форми з підтримкою Partial
  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return {
    // Стан
    formData,
    setFormData: updateFormData,
    errors,
    setErrors,
    deliveryType,
    setDeliveryType,
    hasDifferentRecipient,
    setHasDifferentRecipient,
    isMapOpen,
    setIsMapOpen,

    // Функції
    clearFieldError,
  };
}
