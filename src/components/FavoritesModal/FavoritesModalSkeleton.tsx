"use client";
import React from "react";
import Skeleton from "react-loading-skeleton";
import s from "./FavoritesModal.module.css";
import "react-loading-skeleton/dist/skeleton.css";
import { CardSkeleton } from "../ui/CardSkeleton/CardSkeleton";

const FavoritesModalSkeleton: React.FC = () => {
  return (
    <div className={s.backdrop}>
      <div className={s.modal}>
        <div className={s.topbarListBlock}>
          <div className={s.topbar}>
            <Skeleton width={180} height={32} />
            <Skeleton width={46} height={46} borderRadius={10} />
          </div>

          <div className={s.list}>
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <CardSkeleton />
              </div>
            ))}
          </div>
        </div>

        <div className={s.actionsRow}>
          <div className={s.navWrap}>
            <Skeleton width={120} height={32} borderRadius={16} />
          </div>
          <div className={s.buttonsWrap}>
            <Skeleton width={200} height={56} borderRadius={16} />
            <Skeleton width={180} height={56} borderRadius={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesModalSkeleton;
