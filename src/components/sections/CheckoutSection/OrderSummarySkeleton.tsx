"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./CheckoutSection.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const OrderSummarySkeleton: React.FC = () => {
  return (
    <div className={s.summaryCard}>
      <div className={s.summaryHeader}>
        <Skeleton width={120} height={28} />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Skeleton width={80} height={32} />
          <Skeleton width={24} height={24} />
        </div>
      </div>
      <div className={s.summaryDivider}></div>

      <div className={s.summaryList}>
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className={s.item}>
            <div className={s.itemMain}>
              <Skeleton width={144} height={115} borderRadius={12} />
              <div className={s.contentCol}>
                <Skeleton width="80%" height={18} style={{ marginBottom: 8 }} />
                <Skeleton width="50%" height={16} style={{ marginBottom: 12 }} />
                <div className={s.controlsBlock}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Skeleton width={32} height={32} borderRadius={8} />
                    <Skeleton width={24} height={24} />
                    <Skeleton width={32} height={32} borderRadius={8} />
                  </div>
                  <div className={s.priceWrap}>
                    <Skeleton width={80} height={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.summaryDivider}></div>
      <div className={s.totals}>
        <div className={s.row}>
          <Skeleton width={140} height={18} />
          <Skeleton width={80} height={20} />
        </div>
        <div className={s.row}>
          <Skeleton width={140} height={18} />
          <Skeleton width={80} height={20} />
        </div>
        <div className={s.row}>
          <Skeleton width={180} height={18} />
          <Skeleton width={160} height={16} />
        </div>
      </div>

      <div className={s.summaryDivider}></div>
      <div className={s.rowStrong}>
        <Skeleton width={80} height={24} />
        <Skeleton width={120} height={28} />
      </div>
    </div>
  );
};

export default OrderSummarySkeleton;


