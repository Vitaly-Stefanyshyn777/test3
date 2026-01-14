"use client";
import { calculatePrice } from "@/lib/priceUtils";
import { type CartItem } from "@/store/cart";
import { FormData } from "@/components/sections/CheckoutSection/types";

interface CreateOrderDataProps {
  formData: FormData;
  hasDifferentRecipient: boolean;
  deliveryType: string;
  items: CartItem[];
  isLoggedIn: boolean;
  userId?: number;
}

export function useOrderData() {
  const createPaymentMethodTitle = (paymentMethod: string): string => {
    const paymentMethodTitleMap: Record<string, string> = {
      cod: "Накладений платіж",
      wayforpay: "Онлайн-оплата WayForPay",
      bacs: "Оплата при отриманні",
    };

    return paymentMethodTitleMap[paymentMethod] || paymentMethod;
  };

  const extractProductId = (id: string): number | null => {
    if (/^\d+$/.test(id)) {
      return parseInt(id, 10);
    }

    const match = id.match(/(?:course|product)-(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    const numberMatch = id.match(/\d+/);
    if (numberMatch) {
      return parseInt(numberMatch[0], 10);
    }

    return null;
  };

  const createLineItems = (items: CartItem[], isLoggedIn: boolean) => {
    return items
      .map((item) => {
        const productId = extractProductId(item.id);
        if (productId === null || productId <= 0) {
          return null;
        }
        if (!item.quantity || item.quantity <= 0) {
          return null;
        }

        const { finalPrice, originalPrice, totalDiscount } = calculatePrice({
          price: item.price,
          originalPrice: item.originalPrice,
          isLoggedIn,
        });

        const originalItemPrice = item.originalPrice || item.price;
        const originalTotalPrice = originalItemPrice * item.quantity;

        return {
          product_id: productId,
          quantity: item.quantity,
          price: finalPrice,
          subtotal: originalTotalPrice.toString(),
          total: (finalPrice * item.quantity).toString(),
          meta_data: [
            {
              key: "_bfb_frontend_price",
              value: finalPrice.toString(),
            },
            {
              key: "_bfb_original_price",
              value: (item.originalPrice || item.price).toString(),
            },
            {
              key: "_bfb_discount_percent",
              value: totalDiscount.toFixed(2),
            },
            {
              key: "_bfb_user_logged_in",
              value: isLoggedIn.toString(),
            },
          ],
        };
      })
      .filter((item) => item !== null);
  };

  const createOrderData = ({
    formData,
    hasDifferentRecipient,
    deliveryType,
    items,
    isLoggedIn,
    userId,
  }: CreateOrderDataProps) => {
    const paymentMethod = formData.paymentMethod || "cod";
    const paymentMethodTitle = createPaymentMethodTitle(paymentMethod);
    const lineItems = createLineItems(items, isLoggedIn);

    if (lineItems.length === 0) {
      throw new Error("Не вдалося підготувати товари для замовлення. Перевірте кошик.");
    }

    const shouldSetPaid = paymentMethod === "cod" || paymentMethod === "bacs";

    return {
      payment_method: paymentMethod,
      payment_method_title: paymentMethodTitle,
      set_paid: shouldSetPaid,
      customer_id: userId || 0,
      billing: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address_1: formData.branch || formData.house,
        city: formData.city,
        country: "UA",
      },
      shipping: {
        first_name: hasDifferentRecipient
          ? formData.recipientFirstName
          : formData.firstName,
        last_name: hasDifferentRecipient
          ? formData.recipientLastName
          : formData.lastName,
        address_1: formData.branch || formData.house,
        city: formData.city,
        country: "UA",
      },
      line_items: lineItems,
      ...((deliveryType === "branch" ||
        deliveryType === "postomat" ||
        deliveryType === "courier") && {
        shipping_lines: [
          {
            method_id: "nova_poshta",
            method_title: "Нова Пошта",
            total: "0.00",
          },
        ],
      }),
      ...(formData.comment && { customer_note: formData.comment }),
    };
  };

  return {
    createOrderData,
    createPaymentMethodTitle,
    extractProductId,
    createLineItems,
  };
}
