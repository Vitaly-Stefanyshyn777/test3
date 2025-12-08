"use client";

import React, { useEffect, useState } from "react";
import { useCartStore, selectCartTotal } from "../../../store/cart";
import CheckoutHeader from "../../layout/CheckoutHeader/CheckoutHeader";
import CheckoutFooter from "../../layout/CheckoutFooter/CheckoutFooter";
import OrderHeader from "./OrderHeader";
import OrderHeaderSkeleton from "./OrderHeaderSkeleton";
import OrderProducts from "./OrderProducts";
import OrderDetails from "./OrderDetails";
import OrderSummary from "./OrderSummary";
import s from "./OrderSuccessSection.module.css";

interface OrderData {
  fullName: string;
  lastName: string;
  phone: string;
  email: string;
  hasDifferentRecipient: boolean;
  recipientName?: string;
  recipientLastName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  deliveryType: string;
  city: string;
  branch: string;
  house?: string;
  building?: string;
  apartment?: string;
  paymentMethod: string;
  comment: string;
}

export default function OrderSuccessSection() {
  const total = useCartStore(selectCartTotal);
  const itemsMap = useCartStore((st) => st.items);
  const items = Object.values(itemsMap);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
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
    const savedOrderData = localStorage.getItem("orderData");
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData));
    }
  }, []);

  const orderNumber = `№${Math.floor(Math.random() * 900000) + 100000}`;

  const formattedDate = new Date().toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const deliveryCost = safeTotal >= 1999 ? 0 : 100;
  const finalTotal = safeTotal - discount + deliveryCost;

  const firstNameRaw = orderData?.fullName?.trim() || "";
  const lastNameRaw = orderData?.lastName?.trim() || "";
  const phoneRaw = orderData?.phone?.trim() || "";

  const deliveryType = orderData?.deliveryType || "branch";
  const cityRaw = orderData?.city?.trim() || "";
  const branchRaw = orderData?.branch?.trim() || "";
  const houseRaw = orderData?.house?.trim() || "";
  const buildingRaw = orderData?.building?.trim() || "";
  const apartmentRaw = orderData?.apartment?.trim() || "";

  const paymentMethodDisplay = (orderData?.paymentMethod?.trim() || "").length
    ? (orderData?.paymentMethod as string)
    : "Не вказано";

  const recipientNameRaw = orderData?.recipientName?.trim() || "";
  const recipientLastNameRaw = orderData?.recipientLastName?.trim() || "";
  const recipientPhoneRaw = orderData?.recipientPhone?.trim() || "";

  const deliveryAddressParts: string[] = [];
  if (cityRaw) deliveryAddressParts.push(cityRaw);
  if (deliveryType === "courier") {
    if (houseRaw) deliveryAddressParts.push(`вул. ${houseRaw}`);
    if (buildingRaw) deliveryAddressParts.push(`корп. ${buildingRaw}`);
    if (apartmentRaw) deliveryAddressParts.push(`кв. ${apartmentRaw}`);
  } else {
    deliveryAddressParts.push(branchRaw || "Відділення не вказано");
  }
  const deliveryAddress = deliveryAddressParts.filter(Boolean).length
    ? deliveryAddressParts.join(", ")
    : "Адреса не вказана";

  const hasAltRecipient = !!orderData?.hasDifferentRecipient;
  const chosenFirstName = hasAltRecipient ? recipientNameRaw : firstNameRaw;
  const chosenLastName = hasAltRecipient ? recipientLastNameRaw : lastNameRaw;
  const recipientDisplay =
    chosenFirstName || chosenLastName
      ? `${chosenFirstName}${
          chosenFirstName && chosenLastName ? " " : ""
        }${chosenLastName}`
      : "Одержувач не вказаний";

  const chosenPhone = hasAltRecipient ? recipientPhoneRaw : phoneRaw;
  const phoneDisplay = chosenPhone.length ? chosenPhone : "Телефон не вказано";

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

            <OrderProducts orderNumber={orderNumber} />

            <div className={s.productsBlock}>
              <OrderDetails
                formattedDate={formattedDate}
                deliveryAddress={deliveryAddress}
                paymentMethodDisplay={paymentMethodDisplay}
                recipientDisplay={recipientDisplay}
                phoneDisplay={phoneDisplay}
              />

              <OrderSummary
                safeTotal={safeTotal}
                discount={discount}
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
