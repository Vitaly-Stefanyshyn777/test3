"use client";
import React, { useState, useEffect } from "react";
import { useCartStore, selectCartTotal } from "../../../store/cart";
import { useCreateWcOrder } from "../../../lib/useMutation";
import { useWcPaymentGatewaysQuery } from "../../hooks/useWpQueries";
import MapPickerModal from "./MapPickerModal/MapPickerModal";
import CheckoutHeader from "../../layout/CheckoutHeader/CheckoutHeader";
import CheckoutFooter from "../../layout/CheckoutFooter/CheckoutFooter";
import PersonalDataForm from "./PersonalDataForm";
import DeliveryForm from "./DeliveryForm";
import PaymentForm from "./PaymentForm";
import CommentForm from "./CommentForm";
import OrderSummary from "./OrderSummary";
import OrderSummarySkeleton from "./OrderSummarySkeleton";
import s from "./CheckoutSection.module.css";

export default function CheckoutSection() {
  const total = useCartStore(selectCartTotal);
  const safeTotal = total || 0;
  const itemsMap = useCartStore((st) => st.items);
  const items = Object.values(itemsMap);

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

  // Короткий скелетон для summaryCard, щоб уникнути ривка при першому рендері
  useEffect(() => {
    const timer = setTimeout(() => setIsSummarySkeleton(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Логування стану кошика (тільки для дебагу)
  // React.useEffect(() => {
  //   console.log("[CheckoutSection] 🛒 Стан кошика:", {
  //     total,
  //     safeTotal,
  //     itemsCount: items.length,
  //     itemsMap,
  //     items: items.map((item) => ({
  //       id: item.id,
  //       name: item.name,
  //       quantity: item.quantity,
  //       price: item.price,
  //     })),
  //   });
  // }, [total, items, itemsMap]);

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

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};

    // Валідація особистих даних
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

    // Валідація даних отримувача
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

    // Валідація доставки
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

    try {
      // console.log("[CheckoutSection] 🚀 Відправляю замовлення:", {
      //   formData,
      //   hasDifferentRecipient,
      //   deliveryType,
      //   itemsCount: items.length,
      // });

      // Мапінг платіжного методу
      const paymentMethodMap: Record<string, string> = {
        "Накладений платіж": "cod",
        "Онлайн-оплата WayForPay": "wayforpay",
        "Оплата при отриманні": "cod",
      };

      const paymentMethod = paymentMethodMap[formData.paymentMethod] || "cod";
      const paymentMethodTitle = formData.paymentMethod;

      // Підготовка даних для WooCommerce
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
        line_items: items.map((item) => ({
          product_id: parseInt(item.id),
          quantity: item.quantity,
        })),
        shipping_lines:
          deliveryType === "nova_poshta"
            ? [
                {
                  method_id: "nova_poshta",
                  method_title: "Нова Пошта",
                  total: "0.00",
                },
              ]
            : undefined,
        customer_note: formData.comment,
      };

      // console.log("[CheckoutSection] 📦 Дані замовлення:", orderData);
      // console.log("[CheckoutSection] 📦 Line items детально:", {
      //   lineItems: orderData.line_items,
      //   itemsFromCart: items.map((item) => ({
      //     id: item.id,
      //     name: item.name,
      //     quantity: item.quantity,
      //     price: item.price,
      //   })),
      // });

      // Відправка замовлення
      const result = (await createOrderMutation.mutateAsync(orderData)) as {
        id: number | string;
        status?: string;
      };

      // console.log("[CheckoutSection] ✅ Замовлення створено:", result);

      // WayForPay redirect if selected
      if (paymentMethod === "wayforpay" && result?.id) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_UPSTREAM_BASE;
          const res = await fetch(
            `${baseUrl}/wp-json/myplugin/v1/wayforpay?order_id=${result.id}`,
            { cache: "no-store" }
          );
          if (!res.ok) throw new Error(`WayForPay payload ${res.status}`);
          const payload = (await res.json()) as {
            action: string;
            fields: Record<string, string | number | string[]>;
          };
          const form = document.createElement("form");
          form.method = "POST";
          form.action = payload.action;
          Object.entries(payload.fields || {}).forEach(([key, val]) => {
            const values = Array.isArray(val) ? (val as string[]) : [val];
            values.forEach((v) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = String(v);
              form.appendChild(input);
            });
          });
          document.body.appendChild(form);
          form.submit();
          return;
        } catch (e) {
          console.error("[CheckoutSection] WayForPay redirect failed", e);
        }
      }

      // Збереження даних для сторінки успіху
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

      // Перенаправлення на сторінку успіху
      window.location.href = "/order-success";
    } catch (error) {
      // Silent error handling
      alert("Помилка створення замовлення. Спробуйте ще раз.");
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
              {/* Мобільний порядок: titleFormBlock -> deliveryBlock -> paymentBlock -> commentBlock -> summaryCard */}
              <div className={s.left}>
                <PersonalDataForm
                  formData={formData}
                  hasDifferentRecipient={hasDifferentRecipient}
                  setFormData={setFormData}
                  setHasDifferentRecipient={setHasDifferentRecipient}
                  errors={errors}
                />

                <DeliveryForm
                  deliveryType={deliveryType}
                  formData={formData}
                  setDeliveryType={setDeliveryType}
                  setFormData={setFormData}
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
              {/* Десктопний порядок: left -> right */}
              <div className={s.left}>
                <PersonalDataForm
                  formData={formData}
                  hasDifferentRecipient={hasDifferentRecipient}
                  setFormData={setFormData}
                  setHasDifferentRecipient={setHasDifferentRecipient}
                  errors={errors}
                />

                <DeliveryForm
                  deliveryType={deliveryType}
                  formData={formData}
                  setDeliveryType={setDeliveryType}
                  setFormData={setFormData}
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
