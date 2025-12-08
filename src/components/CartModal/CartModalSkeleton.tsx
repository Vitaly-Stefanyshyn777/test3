"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./CartModal.module.css";
import "react-loading-skeleton/dist/skeleton.css";

const CartModalSkeleton: React.FC = () => {
  return (
    <div className={s.backdrop}>
      <div className={s.modal}>
        <div className={s.topbarListBlock}>
          <div className={s.header}>
            <Skeleton width={200} height={32} className={s.title} />
            <Skeleton width={46} height={46} borderRadius={10} className={s.close} />
          </div>

          <div className={s.bodyTwoCols}>
            <div className={s.leftList}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <Skeleton width={72} height={72} borderRadius={8} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
                    <Skeleton width="40%" height={16} />
                  </div>
                </div>
              ))}
            </div>

            <div className={s.rightSummary}>
              <div className={s.summaryBlock}>
                <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
                <div className={s.progressTrack}>
                  <Skeleton width="60%" height="100%" />
                </div>
              </div>

              <div className={s.summaryRows}>
                <Skeleton width="60%" height={18} />
                <Skeleton width="40%" height={18} />
                <Skeleton width="50%" height={24} />
              </div>

              <div className={s.summaryButtons}>
                <Skeleton width="100%" height={56} borderRadius={16} />
                <Skeleton width="100%" height={56} borderRadius={16} />
              </div>
            </div>
          </div>

          <div className={s.recommendations}>
            <div className={s.recoHeader}>
              <Skeleton width={200} height={24} className={s.recoTitle} />
              <Skeleton width={100} height={20} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton width="100%" height={180} borderRadius={16} />
                  <Skeleton width="80%" height={18} style={{ marginTop: 8 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModalSkeleton;


