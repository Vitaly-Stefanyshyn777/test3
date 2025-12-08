"use client";
import React from "react";
import s from "./OrderSuccessSection.module.css";

interface OrderDetailsProps {
  formattedDate: string;
  deliveryAddress: string;
  paymentMethodDisplay: string;
  recipientDisplay: string;
  phoneDisplay: string;
}

export default function OrderDetails({
  formattedDate,
  deliveryAddress,
  paymentMethodDisplay,
  recipientDisplay,
  phoneDisplay,
}: OrderDetailsProps) {
  return (
    <div className={s.orderDetails}>
      <div className={s.detailRow}>
        <span className={s.label}>Дата замовлення:</span>
        <span className={s.value}>{formattedDate}</span>
      </div>
      <div className={s.detailRow}>
        <span className={s.label}>Адреса доставки:</span>
        <span className={s.value}>{deliveryAddress}</span>
      </div>
      <div className={s.detailRow}>
        <span className={s.label}>Спосіб оплати:</span>
        <span className={s.value}>{paymentMethodDisplay}</span>
      </div>
      <div className={s.detailRow}>
        <span className={s.label}>Одержувач:</span>
        <span className={s.value}>{recipientDisplay}</span>
      </div>
      <div className={s.detailRow}>
        <span className={s.label}>Контактний номер:</span>
        <span className={s.value}>{phoneDisplay}</span>
      </div>
    </div>
  );
}

