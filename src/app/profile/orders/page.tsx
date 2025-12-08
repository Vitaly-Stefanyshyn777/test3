import React from "react";
import ProfileSection from "@/components/sections/ProfileSection/ProfileSection";
import OrdersHistory from "@/components/sections/ProfileSection/OrdersHistory/OrdersHistory";

export default function OrdersPage() {
  return (
    <ProfileSection>
      <OrdersHistory />
    </ProfileSection>
  );
}
