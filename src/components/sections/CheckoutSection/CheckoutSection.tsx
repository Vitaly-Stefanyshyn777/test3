"use client";
import React, { useMemo } from "react";
import { useCartStore, type CartItem } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { calculatePrice, getPriceSellRegistry, normalizePriceParams } from "@/lib/priceUtils";
import { useCheckoutState } from "@/components/hooks/useCheckoutState";
import { useCheckoutValidation } from "@/components/hooks/useCheckoutValidation";
import { useOrderSubmission } from "@/components/hooks/useOrderSubmission";
import { useCheckoutUI } from "@/components/hooks/useCheckoutUI";
import { FormData } from "./types";
import MapPickerModal from "@/components/sections/CheckoutSection/MapPickerModal/MapPickerModal";
import CheckoutHeader from "@/components/layout/CheckoutHeader/CheckoutHeader";
import CheckoutFooter from "@/components/layout/CheckoutFooter/CheckoutFooter";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import OrderSummarySkeleton from "./OrderSummarySkeleton";
import s from "./CheckoutSection.module.css";

export default function CheckoutSection() {
  const itemsMap = useCartStore((st) => st.items);
  const items = Object.values(itemsMap) as CartItem[];
  const isLoggedIn = useAuthStore((st) => st.isLoggedIn);
  const token = useAuthStore((st) => st.token);
  const effectiveIsLoggedIn =
    isLoggedIn ||
    !!token ||
    (typeof window !== "undefined" &&
      (!!localStorage.getItem("bfb_token") ||
        !!localStorage.getItem("bfb_token_old")));

  // Обчислюємо total з урахуванням знижки для авторизованих
  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const normalizedPrices = normalizePriceParams({
        wcPrice: it.wcPrice,
        wcRegularPrice: it.wcRegularPrice,
        wcSalePrice: undefined,
        price: it.price,
        originalPrice: it.originalPrice,
        regularPrice: it.regularPrice,
        salePrice: it.salePrice,
      });
      const priceSellRegistry = getPriceSellRegistry({
        metaData: it.metaData,
      });
      const { finalPrice } = calculatePrice({
        price: normalizedPrices.price,
        regularPrice: normalizedPrices.regularPrice,
        salePrice: normalizedPrices.salePrice,
        isLoggedIn: effectiveIsLoggedIn,
        priceSellRegistry,
      });
      return acc + finalPrice * it.quantity;
    }, 0);
  }, [items, effectiveIsLoggedIn]);

  const safeTotal = total || 0;

  // Хуки для управління станом
  const checkoutState = useCheckoutState();
  const { validateForm, parseWcValidationErrors, validateCartAndTotal } =
    useCheckoutValidation();
  // TODO: isMobile не використовується в поточній версії, можливо потрібно відновити умовний рендеринг
  const { isMobile, isSummarySkeleton } = useCheckoutUI(
    (data: Partial<FormData>) => checkoutState.setFormData(data)
  );

  // Хук для відправки замовлення
  const { submitOrder, isPending } = useOrderSubmission({
    formData: checkoutState.formData,
    hasDifferentRecipient: checkoutState.hasDifferentRecipient,
    deliveryType: checkoutState.deliveryType,
    items,
    safeTotal,
    setErrors: checkoutState.setErrors,
    parseWcValidationErrors,
  });

  const handleSubmit = async () => {
    // Валідація кошика
    const cartError = validateCartAndTotal(items, safeTotal);
    if (cartError) {
      alert(cartError);
      return;
    }

    // Валідація форми
    const validationErrors = validateForm(
      checkoutState.formData,
      checkoutState.hasDifferentRecipient,
      checkoutState.deliveryType
    );

    checkoutState.setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Відправка замовлення
    await submitOrder();
  };

  return (
    <>
      <CheckoutHeader />
      <div className={s.page}>
        <div className={s.container}>
          <CheckoutForm
            formData={checkoutState.formData}
            setFormData={checkoutState.setFormData}
            hasDifferentRecipient={checkoutState.hasDifferentRecipient}
            setHasDifferentRecipient={checkoutState.setHasDifferentRecipient}
            deliveryType={checkoutState.deliveryType}
            setDeliveryType={checkoutState.setDeliveryType}
            errors={checkoutState.errors}
            clearFieldError={checkoutState.clearFieldError}
            setIsMapOpen={checkoutState.setIsMapOpen}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
          <div className={s.right}>
            {isSummarySkeleton ? (
              <OrderSummarySkeleton />
            ) : (
              <OrderSummary total={safeTotal} />
            )}
          </div>
        </div>
      </div>
      <CheckoutFooter />
      <MapPickerModal
        isOpen={checkoutState.isMapOpen}
        onClose={() => checkoutState.setIsMapOpen(false)}
        onSelectLocation={(location, city) => {
          const isPostomat = location.includes("Поштомат");
          checkoutState.setDeliveryType(isPostomat ? "postomat" : "branch");
          checkoutState.setFormData({
            ...checkoutState.formData,
            branch: location,
            city: city || checkoutState.formData.city,
          });
          checkoutState.setIsMapOpen(false);
        }}
        selectedCity={checkoutState.formData.city}
      />
    </>
  );
}
