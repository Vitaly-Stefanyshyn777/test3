"use client";
import React from "react";
import { FormData } from "./types";
import { useWcPaymentGatewaysQuery } from "../../hooks/useWpQueries";
import s from "./CheckoutSection.module.css";

interface PaymentFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export default function PaymentForm({
  formData,
  setFormData,
}: PaymentFormProps) {
  const { data: paymentGateways = [], isLoading } = useWcPaymentGatewaysQuery();

  // Мапінг платіжних методів для відображення
  const paymentMethodMap: Record<string, string> = {
    cod: "Накладений платіж",
    wayforpay: "Онлайн-оплата WayForPay",
    bacs: "Оплата при отриманні",
  };

  // Фільтруємо тільки активні платіжні методи
  // Тип для платіжного шлюзу з мінімально потрібними полями
  type Gateway = { id: string; title: string; enabled: boolean };

  const activePaymentGateways = (paymentGateways as Gateway[]).filter(
    (gateway) => gateway.enabled
  );

  // Логування тільки при зміні даних
  React.useEffect(() => {
    if (paymentGateways && paymentGateways.length > 0) {
      // Payment gateways loaded
    }
  }, [paymentGateways, activePaymentGateways]);

  return (
    <div className={s.paymentBlock}>
      <h2 className={s.sectionTitle}>Оплата</h2>
      {isLoading ? (
        <div>Завантаження платіжних методів...</div>
      ) : (
        <div className={s.radioRow}>
          {activePaymentGateways.map((gateway) => {
            const displayName = paymentMethodMap[gateway.id] || gateway.title;
            return (
              <div key={gateway.id} className={s.radioBlock}>
                <label className={s.radio}>
                  <input
                    className={s.radioInput}
                    type="radio"
                    name="pay"
                    value={displayName}
                    checked={formData.paymentMethod === displayName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                  />{" "}
                  {displayName}
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
