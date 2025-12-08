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

export default function OrderSuccessSection() {
  const total = useCartStore(selectCartTotal);
  const itemsMap = useCartStore((st) => st.items);
  const items = Object.values(itemsMap);
  const [order, setOrder] = useState<WooCommerceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeaderSkeleton, setIsHeaderSkeleton] = useState(true);

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
      try {
        // Спочатку перевіряємо URL параметр
        const urlParams = new URLSearchParams(window.location.search);
        let orderId = urlParams.get("orderId");
        
        // Якщо немає в URL, перевіряємо localStorage
        if (!orderId) {
          const savedOrderData = localStorage.getItem("orderData");
          if (savedOrderData) {
            const parsed = JSON.parse(savedOrderData);
            orderId = parsed.orderId;
          }
        }
        
        if (orderId) {
          const response = await fetch(`/api/wc/orders/${orderId}`);
          if (response.ok) {
            const orderData = await response.json();
            setOrder(orderData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, []);

  const orderNumber = order?.number 
    ? `№${order.number}` 
    : order?.id 
    ? `№${order.id}` 
    : `№${Math.floor(Math.random() * 900000) + 100000}`;

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
  const orderDiscount = order?.discount_total ? parseFloat(order.discount_total) : discount;
  const finalTotal = orderTotal || safeTotal - discount + deliveryCost;

  // Дані з замовлення
  const firstNameRaw = order?.billing?.first_name?.trim() || "";
  const lastNameRaw = order?.billing?.last_name?.trim() || "";
  const phoneRaw = order?.billing?.phone?.trim() || "";

  const shipping = order?.shipping;
  const cityRaw = shipping?.city?.trim() || "";
  const address1Raw = shipping?.address_1?.trim() || "";
  const address2Raw = shipping?.address_2?.trim() || "";

  const paymentMethodDisplay = order?.payment_method_title?.trim() || "Не вказано";

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
  const phoneDisplay = recipientPhone.length ? recipientPhone : "Телефон не вказано";

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

            <OrderProducts orderNumber={orderNumber} order={order} />

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
