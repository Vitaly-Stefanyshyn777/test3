"use client";

import React, { useEffect, useState } from "react";
import { useCartStore, selectCartTotal } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import CheckoutHeader from "@/components/layout/CheckoutHeader/CheckoutHeader";
import CheckoutFooter from "@/components/layout/CheckoutFooter/CheckoutFooter";
import OrderHeader from "./OrderHeader";
import OrderHeaderSkeleton from "./OrderHeaderSkeleton";
import OrderProducts from "./OrderProducts";
import OrderDetails from "./OrderDetails";
import OrderSummary from "./OrderSummary";
import s from "./OrderSuccessSection.module.css";
import type { WooCommerceOrder } from "@/lib/bfbApi";
import {
  calculatePrice,
  getPriceSellRegistry,
} from "@/lib/priceUtils";

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
  const [productMetaById, setProductMetaById] = useState<
    Record<number, Array<{ key: string; value: string }>>
  >({});

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const token = useAuthStore((s) => s.token);
  const effectiveIsLoggedIn =
    isLoggedIn ||
    !!token ||
    (typeof window !== "undefined" &&
      (!!localStorage.getItem("bfb_token") ||
        !!localStorage.getItem("bfb_token_old")));
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
      try {
        if (orderId) {
          const response = await fetch(`/api/wc/orders/${orderId}`);
          if (response.ok) {
            const orderData = await response.json();
            setOrder(orderData);
          }
        }
      } catch (error) {
        // Помилка обробляється мовчки
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Підтягуємо meta_data продуктів (для proce_sell_registry), щоб перерахувати totals як у checkout/cart
  useEffect(() => {
    const run = async () => {
      if (!order?.line_items || order.line_items.length === 0) return;
      const ids = Array.from(
        new Set(order.line_items.map((it) => it.product_id).filter(Boolean))
      ) as number[];
      if (ids.length === 0) return;

      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`/api/wc/v3/products/${encodeURIComponent(String(id))}`);
            const product = res.ok ? await res.json() : null;
            const meta = Array.isArray(product?.meta_data) ? product.meta_data : [];
            const normalized: Array<{ key: string; value: string }> = meta.map(
              (m: { key: unknown; value: unknown }) => ({
                key: String(m.key),
                value: m.value === null || m.value === undefined ? "" : String(m.value),
              })
            );
            return { id, meta: normalized };
          })
        );

        setProductMetaById((prev) => {
          const next = { ...prev };
          for (const r of results) next[r.id] = r.meta;
          return next;
        });
      } catch {
        // ignore
      }
    };
    run();
  }, [order?.line_items]);

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

  const orderComputed = React.useMemo(() => {
    if (!order?.line_items || order.line_items.length === 0) {
      return {
        finalTotal: safeTotal,
        discount: discount,
      };
    }

    let totalFinal = 0;
    let totalOriginal = 0;

    for (const it of order.line_items) {
      const qty = it.quantity && it.quantity > 0 ? it.quantity : 1;
      const lineTotal = Number(it.total || 0);
      const lineSubtotal = Number(it.subtotal || 0);
      const unitWcPrice = lineTotal / qty;
      const unitRegular = lineSubtotal > 0 ? lineSubtotal / qty : 0;
      const salePrice =
        unitWcPrice > 0 && unitRegular > 0 && unitWcPrice < unitRegular
          ? unitWcPrice
          : undefined;

      const priceSellRegistry = getPriceSellRegistry({
        metaData: productMetaById[it.product_id],
      });

      const calc = calculatePrice({
        price: unitWcPrice,
        regularPrice: unitRegular,
        salePrice,
        isLoggedIn: effectiveIsLoggedIn,
        priceSellRegistry,
      });

      totalFinal += calc.finalPrice * qty;
      totalOriginal += calc.originalPrice * qty;
    }

    const discountAmount =
      totalOriginal > totalFinal ? totalOriginal - totalFinal : 0;

    return {
      finalTotal: totalFinal,
      discount: discountAmount,
    };
  }, [order?.line_items, productMetaById, effectiveIsLoggedIn, safeTotal, discount]);

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
              <OrderProducts orderNumber={orderNumber} order={order} />
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
                safeTotal={orderComputed.finalTotal}
                discount={orderComputed.discount}
                deliveryCost={0}
                finalTotal={orderComputed.finalTotal}
              />
            </div>
          </div>
        </div>
      </div>
      <CheckoutFooter />
    </>
  );
}
