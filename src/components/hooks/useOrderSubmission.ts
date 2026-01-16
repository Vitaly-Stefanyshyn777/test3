"use client";
import React from "react";
import { useCreateWcOrder } from "@/lib/useMutation";
import { useCartStore, type CartItem } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import {
  FormData,
  CheckoutErrors,
} from "@/components/sections/CheckoutSection/types";
import { useOrderData } from "./useOrderData";
import { useWayForPay } from "./useWayForPay";

interface UseOrderSubmissionProps {
  formData: FormData;
  hasDifferentRecipient: boolean;
  deliveryType: string;
  items: CartItem[];
  safeTotal: number;
  setErrors: (errors: CheckoutErrors) => void;
  parseWcValidationErrors: (errorData: any) => CheckoutErrors;
}

export function useOrderSubmission({
  formData,
  hasDifferentRecipient,
  deliveryType,
  items,
  safeTotal,
  setErrors,
  parseWcValidationErrors,
}: UseOrderSubmissionProps) {
  const createOrderMutation = useCreateWcOrder();
  const cartStore = useCartStore();
  const { user } = useAuthStore();
  const { createOrderData } = useOrderData();
  const { handleWayForPayPayment } = useWayForPay({ safeTotal, setErrors });
  const isSubmittingRef = React.useRef(false);

  const submitOrder = async () => {
    // Захист від подвійного натискання
    if (isSubmittingRef.current || createOrderMutation.isPending) {
      return;
    }

    try {
      isSubmittingRef.current = true;
      // Передаємо isLoggedIn як булевий стан замість перевірки наявності user
      const isLoggedIn = !!user;
      const orderData = createOrderData({
        formData,
        hasDifferentRecipient,
        deliveryType,
        items,
        isLoggedIn,
        userId: user?.id ? Number(user.id) : 0,
      });

      const result = (await createOrderMutation.mutateAsync(orderData)) as {
        id: number | string;
        status?: string;
      };

      // Оновлюємо користувача з полем mail_send, якщо користувач авторизований
      if (user?.id && formData.mailSend) {
        try {
          const userId = Number(user.id);
          // Отримуємо поточний профіль для збереження існуючих даних
          const profileRes = await fetch(
            `/api/proxy?path=${encodeURIComponent(
              `/wp-json/wp/v2/users/${userId}?context=edit`
            )}`,
            {
              method: "GET",
              headers: {
                "x-internal-admin": "1",
              },
            }
          );

          if (profileRes.ok) {
            const profile = await profileRes.json();
            const currentAcf = (profile.acf as Record<string, unknown>) || {};

            // Оновлюємо профіль з полем mail_send
            await fetch(
              `/api/proxy?path=${encodeURIComponent(
                `/wp-json/wp/v2/users/${userId}`
              )}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "x-internal-admin": "1",
                },
                body: JSON.stringify({
                  acf: {
                    ...currentAcf,
                    mail_send: true,
                  },
                }),
              }
            );
          }
        } catch (error) {
          // Не блокуємо процес, якщо оновлення профілю не вдалося
          console.error("Failed to update user mail_send:", error);
        }
      }

      // Очищуємо кошик після успішного створення замовлення
      await cartStore.clear();

      if (formData.paymentMethod === "wayforpay" && result?.id) {
        const paymentHandled = await handleWayForPayPayment(result.id);
        if (paymentHandled) return;
      }

      localStorage.setItem(
        "orderData",
        JSON.stringify({
          formData,
          hasDifferentRecipient,
          deliveryType,
          orderId: result.id,
          orderStatus: result.status,
        })
      );

      window.location.href = `/order-success?orderId=${result.id}`;
    } catch (error) {
      let errorMessage = "Помилка створення замовлення. Спробуйте ще раз.";
      let showAlert = true;

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        const responseData = axiosError.response?.data;

        if (responseData?.code === "rest_invalid_param" && responseData?.data) {
          const wcErrors = parseWcValidationErrors(responseData);

          if (Object.keys(wcErrors).length > 0) {
            setErrors(wcErrors);
            showAlert = false;
          }
        }

        if (responseData?.message) {
          errorMessage = responseData.message;
        }

        if (axiosError.response?.data?.details) {
          console.error(
            "[CheckoutSection] Деталі помилки:",
            axiosError.response.data.details
          );
        }
      } else if (error instanceof Error) {
        errorMessage = `Помилка: ${error.message}`;
      }

      if (showAlert) {
        alert(errorMessage);
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return {
    submitOrder,
    isPending: createOrderMutation.isPending,
  };
}
