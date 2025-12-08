"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./OrderSuccessSection.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const OrderHeaderSkeleton: React.FC = () => {
  return (
    <div className={s.headerBlock}>
      <div className={s.iconContainer}>
        <Skeleton width={24} height={24} />
      </div>
      <div className={s.thanBlock}>
        <Skeleton width={200} height={20} className={s.thankYou} style={{ marginBottom: 8 }} />
        <Skeleton width={320} height={40} className={s.successTitle} />
      </div>
    </div>
  );
};

export default OrderHeaderSkeleton;


