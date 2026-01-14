"use client";
import { CheckoutErrors } from "@/components/sections/CheckoutSection/types";

interface UseWayForPayProps {
  safeTotal: number;
  setErrors: (errors: CheckoutErrors) => void;
}

export function useWayForPay({ safeTotal, setErrors }: UseWayForPayProps) {
  const handleWayForPayPayment = async (orderId: number | string): Promise<boolean> => {
    if (safeTotal <= 0) {
      alert(
        "Неможливо здійснити онлайн-оплату для замовлення з нульовою сумою. Оберіть інший спосіб оплати."
      );
      window.location.href = `/order-success?orderId=${orderId}`;
      return false;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_UPSTREAM_BASE не налаштовано");
      }

      const res = await fetch(
        `${baseUrl}/wp-json/myplugin/v1/wayforpay?order_id=${orderId}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new Error(
          `WayForPay API помилка: ${res.status} - ${
            errorData.message ||
            errorData.error ||
            res.statusText ||
            "Невідома помилка"
          }`
        );
      }

      const payload = await res.json();

      if (!payload.action || !payload.fields) {
        throw new Error(
          "Невірний формат відповіді від WayForPay API: відсутні action або fields"
        );
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = payload.action;

      Object.entries(payload.fields).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach((v) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = `${key}[]`;
            input.value = String(v);
            form.appendChild(input);
          });
        } else {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(val);
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();
      return true;
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Невідома помилка";
      alert(`Не вдалося здійснити оплату. ${errorMessage}`);
      window.location.href = `/order-success?orderId=${orderId}`;
      return false;
    }
  };

  return {
    handleWayForPayPayment,
  };
}
