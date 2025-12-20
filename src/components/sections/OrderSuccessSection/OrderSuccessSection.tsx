"use client";

import React, { useEffect, useState } from "react";
import { useCartStore, selectCartTotal } from "@/store/cart";
import CheckoutHeader from "@/components/layout/CheckoutHeader/CheckoutHeader";
import CheckoutFooter from "@/components/layout/CheckoutFooter/CheckoutFooter";
import OrderHeader from "./OrderHeader";
import OrderHeaderSkeleton from "./OrderHeaderSkeleton";
import OrderProducts from "./OrderProducts";
import OrderDetails from "./OrderDetails";
import OrderSummary from "./OrderSummary";
import s from "./OrderSuccessSection.module.css";
import type { WooCommerceOrder } from "@/lib/bfbApi";

interface OrderSuccessSectionProps {
  initialOrderId?: string | null;
}

export default function OrderSuccessSection({
  initialOrderId,
}: OrderSuccessSectionProps) {
  const total = useCartStore(selectCartTotal);
  const itemsMap = useCartStore((st) => st.items);
  const items = Object.values(itemsMap);
  const [order, setOrder] = useState<WooCommerceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeaderSkeleton, setIsHeaderSkeleton] = useState(true);
  // Якщо initialOrderId передано з сервера, завжди використовуємо тільки його
  // Це гарантує консистентність між сервером і клієнтом
  const orderId = initialOrderId;

  const safeTotal = total || 0;

  // Розрахунок знижки
  const discount = React.useMemo(
    () =>
      items.reduce((acc, it) => {
        const diff =
          it.originalPrice && it.originalPrice > it.price
            ? it.originalPrice - it.price
            : 0;
        return acc + diff * it.quantity;
      }, 0),
    [items]
  );

  useEffect(() => {
    const fetchOrder = async () => {
      console.log("📦 OrderSuccessSection: Початок завантаження замовлення", {
        orderId,
      });

      try {
        if (orderId) {
          const response = await fetch(`/api/wc/orders/${orderId}`);
          if (response.ok) {
            const orderData = await response.json();
            console.log(
              "✅ OrderSuccessSection: Замовлення завантажено успішно",
              {
                orderId: orderData.id,
                itemsCount: orderData.line_items?.length || 0,
                items: orderData.line_items?.map((item: any) => ({
                  id: item.product_id,
                  name: item.name,
                  quantity: item.quantity,
                })),
              }
            );
            setOrder(orderData);
          } else {
            console.log(
              "❌ OrderSuccessSection: Помилка завантаження замовлення",
              {
                orderId,
                status: response.status,
                statusText: response.statusText,
              }
            );
          }
        } else {
          console.log(
            "⚠️ OrderSuccessSection: orderId не вказано, пропускаємо завантаження"
          );
        }
      } catch (error) {
        console.log(
          "❌ OrderSuccessSection: Виняток при завантаженні замовлення",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Відкладаємо рендеринг номера до тих пір, поки orderId не буде відомий
  const orderNumber = orderId
    ? order?.number
      ? `№${order.number}`
      : order?.id
      ? `№${order.id}`
      : `№${orderId}`
    : null;

  const formattedDate = order?.date_created
    ? new Date(order.date_created).toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const deliveryCost = order?.shipping_total
    ? parseFloat(order.shipping_total)
    : safeTotal >= 1999
    ? 0
    : 100;

  const orderTotal = order?.total ? parseFloat(order.total) : safeTotal;
  const orderDiscount = order?.discount_total
    ? parseFloat(order.discount_total)
    : discount;
  const finalTotal = orderTotal || safeTotal - discount + deliveryCost;

  // Дані з замовлення
  const firstNameRaw = order?.billing?.first_name?.trim() || "";
  const lastNameRaw = order?.billing?.last_name?.trim() || "";
  const phoneRaw = order?.billing?.phone?.trim() || "";

  const shipping = order?.shipping;
  const cityRaw = shipping?.city?.trim() || "";
  const address1Raw = shipping?.address_1?.trim() || "";
  const address2Raw = shipping?.address_2?.trim() || "";

  const paymentMethodDisplay =
    order?.payment_method_title?.trim() || "Не вказано";

  // Одержувач з shipping або billing
  const recipientFirstName = shipping?.first_name?.trim() || firstNameRaw;
  const recipientLastName = shipping?.last_name?.trim() || lastNameRaw;
  const recipientDisplay =
    recipientFirstName || recipientLastName
      ? `${recipientFirstName}${
          recipientFirstName && recipientLastName ? " " : ""
        }${recipientLastName}`
      : "Одержувач не вказаний";

  const recipientPhone = shipping?.phone?.trim() || phoneRaw;
  const phoneDisplay = recipientPhone.length
    ? recipientPhone
    : "Телефон не вказано";

  // Адреса доставки
  const deliveryAddressParts: string[] = [];
  if (cityRaw) deliveryAddressParts.push(cityRaw);
  if (address1Raw) {
    // Перевіряємо, чи це відділення Нової Пошти або адреса
    if (address1Raw.includes("Відділення") || address1Raw.includes("№")) {
      deliveryAddressParts.push(address1Raw);
    } else {
      deliveryAddressParts.push(`вул. ${address1Raw}`);
    }
  }
  if (address2Raw) deliveryAddressParts.push(address2Raw);

  const deliveryAddress = deliveryAddressParts.filter(Boolean).length
    ? deliveryAddressParts.join(", ")
    : "Відділення не вказано";

  useEffect(() => {
    const timer = setTimeout(() => setIsHeaderSkeleton(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <CheckoutHeader />
      <div className={s.page}>
        <div className={s.container}>
          <div className={s.card}>
            {isHeaderSkeleton ? <OrderHeaderSkeleton /> : <OrderHeader />}

            {orderId && orderNumber ? (
              (() => {
                console.log(
                  "🎯 OrderSuccessSection: Передаємо дані в OrderProducts",
                  {
                    orderNumber,
                    hasOrder: !!order,
                    orderId: order?.id,
                    itemsCount: order?.line_items?.length || 0,
                  }
                );
                return (
                  <OrderProducts orderNumber={orderNumber} order={order} />
                );
              })()
            ) : (
              <div className={s.errorBlock}>
                <p>Не знайдено інформацію про замовлення</p>
              </div>
            )}

            <div className={s.productsBlock}>
              <OrderDetails
                formattedDate={formattedDate}
                deliveryAddress={deliveryAddress}
                paymentMethodDisplay={paymentMethodDisplay}
                recipientDisplay={recipientDisplay}
                phoneDisplay={phoneDisplay}
              />

              <OrderSummary
                safeTotal={orderTotal || safeTotal}
                discount={orderDiscount || discount}
                deliveryCost={deliveryCost}
                finalTotal={finalTotal}
              />
            </div>
          </div>
        </div>
      </div>
      <CheckoutFooter />
    </>
  );
}
