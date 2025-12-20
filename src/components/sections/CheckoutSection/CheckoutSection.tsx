"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useCartStore, type CartItem } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useCreateWcOrder } from "@/lib/useMutation";
import { useWcPaymentGatewaysQuery } from "@/components/hooks/useWpQueries";
import { calculatePrice } from "@/lib/priceUtils";
import { getProductPriceAsync } from "@/lib/useProductPrices";
import MapPickerModal from "@/components/sections/CheckoutSection/MapPickerModal/MapPickerModal";
import CheckoutHeader from "@/components/layout/CheckoutHeader/CheckoutHeader";
import CheckoutFooter from "@/components/layout/CheckoutFooter/CheckoutFooter";
import PersonalDataForm from "./PersonalDataForm";
import DeliveryForm from "./DeliveryForm";
import PaymentForm from "./PaymentForm";
import CommentForm from "./CommentForm";
import OrderSummary from "./OrderSummary";
import OrderSummarySkeleton from "./OrderSummarySkeleton";
import s from "./CheckoutSection.module.css";

export default function CheckoutSection() {
  const itemsMap = useCartStore((st) => st.items);
  const items = Object.values(itemsMap);
  const user = useAuthStore((st) => st.user);
  const isLoggedIn = useAuthStore((st) => st.isLoggedIn);
  const cartStore = useCartStore();

  // Обчислюємо total з урахуванням знижки для авторизованих
  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const { finalPrice } = calculatePrice({
        price: it.price,
        originalPrice: it.originalPrice,
        isLoggedIn,
      });
      return acc + finalPrice * it.quantity;
    }, 0);
  }, [items, isLoggedIn]);

  const safeTotal = total || 0;

  const [isMobile, setIsMobile] = useState(false);
  const [isSummarySkeleton, setIsSummarySkeleton] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsSummarySkeleton(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const createOrderMutation = useCreateWcOrder();
  const { data: paymentGateways = [] } = useWcPaymentGatewaysQuery();

  const [hasDifferentRecipient, setHasDifferentRecipient] = useState(false);
  const [deliveryType, setDeliveryType] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [formData, setFormData] = useState({
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
  });
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    billing?: string;
    recipientFirstName?: string;
    recipientLastName?: string;
    recipientPhone?: string;
    deliveryType?: string;
    city?: string;
    branch?: string;
    house?: string;
    building?: string;
    apartment?: string;
  }>({});

  // Функція для парсингу помилок WooCommerce API
  const parseWcValidationErrors = (errorData: any): typeof errors => {
    const wcErrors: typeof errors = {};

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

  // Функція для очищення помилки конкретного поля
  const clearFieldError = (fieldName: keyof typeof errors) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};

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
    } else {
      if (!formData.branch.trim()) {
        newErrors.branch = "Обов'язкове поле";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Перевірка на порожній кошик
    if (items.length === 0) {
      alert("Ваш кошик порожній. Додайте товари перед оформленням замовлення.");
      return;
    }

    // Перевірка на нульову суму
    if (safeTotal <= 0) {
      alert("Сума замовлення не може бути нульовою. Перевірте кошик.");
      return;
    }

    try {
      const paymentMethodTitleMap: Record<string, string> = {
        cod: "Накладений платіж",
        wayforpay: "Онлайн-оплата WayForPay",
        bacs: "Оплата при отриманні",
      };

      const paymentMethod = formData.paymentMethod || "cod";
      const paymentMethodTitle =
        paymentMethodTitleMap[paymentMethod] || paymentMethod;

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

      const lineItems = items
        .map((item) => {
          const productId = extractProductId(item.id);
          if (productId === null || productId <= 0) {
            return null;
          }
          if (!item.quantity || item.quantity <= 0) {
            return null;
          }
          return {
            product_id: productId,
            quantity: item.quantity,
          };
        })
        .filter((item) => item !== null) as Array<{
        product_id: number;
        quantity: number;
      }>;

      if (lineItems.length === 0) {
        alert("Не вдалося підготувати товари для замовлення. Перевірте кошик.");
        return;
      }

      const orderData = {
        payment_method: paymentMethod,
        payment_method_title: paymentMethodTitle,
        set_paid: false,
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
        ...(deliveryType === "nova_poshta" && {
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

      const result = (await createOrderMutation.mutateAsync(orderData)) as {
        id: number | string;
        status?: string;
      };

      if (paymentMethod === "wayforpay" && result?.id) {
        if (safeTotal <= 0) {
          alert(
            "Неможливо здійснити онлайн-оплату для замовлення з нульовою сумою. Оберіть інший спосіб оплати."
          );
          window.location.href = `/order-success?orderId=${result.id}`;
          return;
        }

        try {
          const baseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE;
          if (!baseUrl) {
            throw new Error("NEXT_PUBLIC_UPSTREAM_BASE не налаштовано");
          }

          const res = await fetch(
            `${baseUrl}/wp-json/myplugin/v1/wayforpay?order_id=${result.id}`,
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

          const payload = (await res.json()) as {
            action: string;
            fields: Record<string, string | number | string[]>;
          };

          if (!payload.action || !payload.fields) {
            throw new Error(
              "Невірний формат відповіді від WayForPay API: відсутні action або fields"
            );
          }

          const form = document.createElement("form");
          form.method = "POST";
          form.action = payload.action;

          Object.entries(payload.fields || {}).forEach(([key, val]) => {
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
          return;
        } catch (e) {
          const errorMessage =
            e instanceof Error ? e.message : "Невідома помилка";
          alert(`Не вдалося здійснити оплату. ${errorMessage}`);
          window.location.href = `/order-success?orderId=${result.id}`;
          return;
        }
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
        const axiosError = error as {
          response?: {
            data?: {
              code?: string;
              message?: string;
              data?: { params?: any; details?: any };
            };
            status?: number;
          };
        };

        const responseData = axiosError.response?.data;

        // Перевіряємо чи це помилка валідації WooCommerce
        if (responseData?.code === "rest_invalid_param" && responseData?.data) {
          const wcErrors = parseWcValidationErrors(responseData);

          // Якщо знайшли помилки валідації, відображаємо їх під полями форми
          if (Object.keys(wcErrors).length > 0) {
            setErrors((prevErrors) => ({ ...prevErrors, ...wcErrors }));
            showAlert = false; // Не показуємо alert, бо помилки відображені під полями
          }
        }

        if (responseData?.message) {
          errorMessage = responseData.message;
        }

        if (
          axiosError.response?.data &&
          "details" in axiosError.response.data
        ) {
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
    }
  };

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
    <>
      <CheckoutHeader />
      <div className={s.page}>
        <div className={s.container}>
          {isMobile ? (
            <>
              <div className={s.left}>
                <PersonalDataForm
                  formData={formData}
                  hasDifferentRecipient={hasDifferentRecipient}
                  setFormData={(data) => {
                    setFormData(data);
                    // Очищаємо помилки при зміні полів
                    if (data.firstName !== formData.firstName)
                      clearFieldError("firstName");
                    if (data.lastName !== formData.lastName)
                      clearFieldError("lastName");
                    if (data.phone !== formData.phone) clearFieldError("phone");
                    if (data.email !== formData.email) clearFieldError("email");
                    if (data.recipientFirstName !== formData.recipientFirstName)
                      clearFieldError("recipientFirstName");
                    if (data.recipientLastName !== formData.recipientLastName)
                      clearFieldError("recipientLastName");
                    if (data.recipientPhone !== formData.recipientPhone)
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
                    if (data.city !== formData.city) clearFieldError("city");
                    if (data.branch !== formData.branch)
                      clearFieldError("branch");
                    if (data.house !== formData.house) clearFieldError("house");
                    if (data.building !== formData.building)
                      clearFieldError("building");
                    if (data.apartment !== formData.apartment)
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
                    onClick={handleSubmit}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending
                      ? "Обробка замовлення..."
                      : "Підтвердити замовлення"}
                  </button>
                  {checkboxAgreements}
                </div>
              </div>
              <div className={s.right}>
                {isSummarySkeleton ? (
                  <OrderSummarySkeleton />
                ) : (
                  <OrderSummary total={safeTotal} />
                )}
              </div>
            </>
          ) : (
            <>
              <div className={s.left}>
                <PersonalDataForm
                  formData={formData}
                  hasDifferentRecipient={hasDifferentRecipient}
                  setFormData={(data) => {
                    setFormData(data);
                    // Очищаємо помилки при зміні полів
                    if (data.firstName !== formData.firstName)
                      clearFieldError("firstName");
                    if (data.lastName !== formData.lastName)
                      clearFieldError("lastName");
                    if (data.phone !== formData.phone) clearFieldError("phone");
                    if (data.email !== formData.email) clearFieldError("email");
                    if (data.recipientFirstName !== formData.recipientFirstName)
                      clearFieldError("recipientFirstName");
                    if (data.recipientLastName !== formData.recipientLastName)
                      clearFieldError("recipientLastName");
                    if (data.recipientPhone !== formData.recipientPhone)
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
                    if (data.city !== formData.city) clearFieldError("city");
                    if (data.branch !== formData.branch)
                      clearFieldError("branch");
                    if (data.house !== formData.house) clearFieldError("house");
                    if (data.building !== formData.building)
                      clearFieldError("building");
                    if (data.apartment !== formData.apartment)
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
                    onClick={handleSubmit}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending
                      ? "Обробка замовлення..."
                      : "Підтвердити замовлення"}
                  </button>
                  {checkboxAgreements}
                </div>
              </div>

              <div className={s.right}>
                {isSummarySkeleton ? (
                  <OrderSummarySkeleton />
                ) : (
                  <OrderSummary total={safeTotal} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <CheckoutFooter />
      <MapPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectLocation={(location) => {
          setFormData((prev) => ({ ...prev, branch: location }));
          setIsMapOpen(false);
        }}
        selectedCity={formData.city}
      />
    </>
  );
}
