"use client";

import { CloseButtonIcon, ErrotIcon, SuccessIcon } from "../../Icons/Icons";
import s from "./RegisterResultModal.module.css";

interface RegisterResultModalProps {
  isOpen: boolean;
  type: "success" | "error";
  title: string;
  description: string;
  primaryText: string;
  onPrimary: () => void;
  onClose: () => void;
}

export default function RegisterResultModal({
  isOpen,
  type,
  title,
  description,
  primaryText,
  onPrimary,
  onClose,
}: RegisterResultModalProps) {
  if (!isOpen) return null;

  const Icon = () => (
    <div
      className={`${s.icon} ${
        type === "success" ? s.iconSuccess : s.iconError
      }`}
    >
      {type === "success" ? <SuccessIcon /> : <ErrotIcon />}
    </div>
  );

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <button className={s.close} onClick={onClose}>
          <CloseButtonIcon />
        </button>
        <Icon />
        <div className={s.titleBlock}>
          <h3 className={s.title}>{title}</h3>
          <p className={s.description}>{description}</p>
        </div>
        <button className={s.primary} onClick={onPrimary}>
          {primaryText}
        </button>
      </div>
    </div>
  );
}
