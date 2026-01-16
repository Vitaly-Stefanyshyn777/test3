"use client";
import {
  FormData,
  CheckoutErrors,
} from "@/components/sections/CheckoutSection/types";
import { CartItem } from "@/store/cart";

export function useCheckoutValidation() {
  // Функція для парсингу помилок WooCommerce API
  const parseWcValidationErrors = (errorData: any): CheckoutErrors => {
    const wcErrors: CheckoutErrors = {};

    // Перевіряємо структуру відповіді WooCommerce
    if (errorData?.data?.params) {
      const params = errorData.data.params;

      // Маппінг помилок WooCommerce на поля форми
      if (params.billing) {
        // Парсимо помилки billing - вони можуть бути рядком або об'єктом
        if (typeof params.billing === "string") {
          wcErrors.email = params.billing;
        } else if (typeof params.billing === "object") {
          // Якщо це об'єкт з детальними помилками
          if (params.billing.email) {
            wcErrors.email = params.billing.email;
          }
          if (params.billing.phone) {
            wcErrors.phone = params.billing.phone;
          }
          if (params.billing.first_name) {
            wcErrors.firstName = params.billing.first_name;
          }
          if (params.billing.last_name) {
            wcErrors.lastName = params.billing.last_name;
          }
        }
      }

      // Інші можливі помилки
      if (params.shipping) {
        // Помилки доставки
        if (typeof params.shipping === "object") {
          if (params.shipping.city) {
            wcErrors.city = params.shipping.city;
          }
          if (params.shipping.address_1) {
            wcErrors.branch = params.shipping.address_1;
            wcErrors.house = params.shipping.address_1;
          }
        }
      }
    }

    // Перевіряємо також data.details якщо params немає
    if (errorData?.data?.details && !errorData?.data?.params) {
      const details = errorData.data.details;

      if (details.billing) {
        if (typeof details.billing === "object") {
          if (details.billing.email) {
            wcErrors.email = Array.isArray(details.billing.email)
              ? details.billing.email.join(", ")
              : details.billing.email;
          }
          if (details.billing.phone) {
            wcErrors.phone = Array.isArray(details.billing.phone)
              ? details.billing.phone.join(", ")
              : details.billing.phone;
          }
        }
      }
    }

    return wcErrors;
  };

  // Функція для валідації форми
  const validateForm = (
    formData: FormData,
    hasDifferentRecipient: boolean,
    deliveryType: string
  ): CheckoutErrors => {
    const newErrors: CheckoutErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Обов'язкове поле";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Обов'язкове поле";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Обов'язкове поле";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Обов'язкове поле";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Невірний email";
    }

    if (hasDifferentRecipient) {
      if (!formData.recipientFirstName.trim()) {
        newErrors.recipientFirstName = "Обов'язкове поле";
      }
      if (!formData.recipientLastName.trim()) {
        newErrors.recipientLastName = "Обов'язкове поле";
      }
      if (!formData.recipientPhone.trim()) {
        newErrors.recipientPhone = "Обов'язкове поле";
      }
    }

    if (!deliveryType) {
      newErrors.deliveryType = "Обов'язкове поле";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Обов'язкове поле";
    }
    if (deliveryType === "courier") {
      if (!formData.house.trim()) {
        newErrors.house = "Обов'язкове поле";
      }
      if (!formData.branch.trim()) {
        newErrors.branch = "Обов'язкове поле";
      }
    } else {
      if (!formData.branch.trim()) {
        newErrors.branch = "Обов'язкове поле";
      }
    }

    // Валідація чекбоксу з умовами
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Необхідно прийняти умови оферти";
    }

    return newErrors;
  };

  // Функція для валідації кошика та загальної суми
  const validateCartAndTotal = (
    items: CartItem[],
    safeTotal: number
  ): string | null => {
    if (items.length === 0) {
      return "Ваш кошик порожній. Додайте товари перед оформленням замовлення.";
    }

    if (safeTotal <= 0) {
      return "Сума замовлення не може бути нульовою. Перевірте кошик.";
    }

    const outOfStockItems = items.filter((item) => {
      const stockQuantity = item.stockQuantity;
      return (
        stockQuantity !== null &&
        stockQuantity !== undefined &&
        stockQuantity <= 0
      );
    });

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map((item) => item.name).join(", ");
      return `На жаль, наступні товари відсутні в наявності: ${itemNames}. Будь ласка, видаліть їх з кошика.`;
    }

    const insufficientStockItems = items.filter((item) => {
      const stockQuantity = item.stockQuantity;
      return (
        stockQuantity !== null &&
        stockQuantity !== undefined &&
        item.quantity > stockQuantity
      );
    });

    if (insufficientStockItems.length > 0) {
      const messages = insufficientStockItems.map(
        (item) =>
          `${item.name}: запрошено ${item.quantity} шт., доступно ${item.stockQuantity} шт.`
      );
      return `Недостатньо товарів в наявності:\n${messages.join("\n")}`;
    }

    return null;
  };

  return {
    validateForm,
    parseWcValidationErrors,
    validateCartAndTotal,
  };
}
