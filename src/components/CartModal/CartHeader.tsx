"use client";
import React from "react";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import s from "./CartModal.module.css";

interface CartHeaderProps {
  onClose: () => void;
}

export default function CartHeader({ onClose }: CartHeaderProps) {
  return (
    <div className={s.header}>
      <h3 className={s.title}>Кошик</h3>
      <ModalCloseButton onClose={onClose} className={s.close} />
    </div>
  );
}

