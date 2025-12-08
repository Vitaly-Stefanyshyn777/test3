"use client";
import React from "react";
import { CloseButtonIcon } from "../Icons/Icons";
import s from "./CartModal.module.css";

interface CartHeaderProps {
  onClose: () => void;
}

export default function CartHeader({ onClose }: CartHeaderProps) {
  return (
    <div className={s.header}>
      <h3 className={s.title}>Кошик</h3>
      <button className={s.close} onClick={onClose} aria-label="Закрити">
        <CloseButtonIcon />
      </button>
    </div>
  );
}
