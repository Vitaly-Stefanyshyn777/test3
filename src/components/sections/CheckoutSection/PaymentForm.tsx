"use client";
import React, { useMemo, useRef } from "react";
import { FormData } from "./types";
import { useWcPaymentGatewaysQuery } from "@/components/hooks/useWpQueries";
import { useCartStore } from "@/store/cart";
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

  const itemsMap = useCartStore((st) => st.items);
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);

  const hasSetWayForPay = useRef(false);

  const hasCourses = useMemo(() => {
    return items.some((item) => {
      if (item.id.startsWith("course-")) {
        return true;
      }
      const itemName = item.name?.toLowerCase() || "";
      const isCourseByName =
        itemName.includes("курс") ||
        itemName.includes("workshop") ||
        itemName.includes("тренування") ||
        itemName.includes("менеджмент") ||
        itemName.includes("афірмації");
      return (
        isCourseByName &&
        !item.variationId &&
        !item.color &&
        !item.size &&
        item.stockQuantity === null
      );
    });
  }, [items]);

  const paymentMethodMap: Record<string, string> = {
    cod: "Накладений платіж",
    wayforpay: "Онлайн-оплата WayForPay",
    bacs: "Оплата при отриманні",
  };

  type Gateway = { id: string; title: string; enabled: boolean };

  const activePaymentGateways = useMemo(() => {
    const allGateways = (paymentGateways as Gateway[]).filter(
      (gateway) => gateway.enabled
    );

    if (hasCourses) {
      return allGateways.filter((gateway) => gateway.id === "wayforpay");
    }

    return allGateways;
  }, [paymentGateways, hasCourses]);

  React.useEffect(() => {
    if (hasCourses) {
      if (formData.paymentMethod !== "wayforpay" && !hasSetWayForPay.current) {
        setFormData({
          ...formData,
          paymentMethod: "wayforpay",
        });
        hasSetWayForPay.current = true;
      }
    } else {
      hasSetWayForPay.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCourses]);

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
                    value={gateway.id}
                    checked={formData.paymentMethod === gateway.id}
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
