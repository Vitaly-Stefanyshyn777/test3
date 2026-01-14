"use client";

import { CloseButtonIcon, SuccessIcon } from "@/components/Icons/Icons";
import s from "./ResetPasswordSuccessModal.module.css";

interface ResetPasswordSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPasswordSuccessModal({
  isOpen,
  onClose,
}: ResetPasswordSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <button className={s.close} onClick={onClose}>
          <CloseButtonIcon />
        </button>

        <div className={s.icon}>
          <SuccessIcon />
        </div>

        <div className={s.titleBlock}>
          <h3 className={s.title}>Пароль успішно змінено!</h3>
          <p className={s.description}>Тепер ви можете увійти на платформу</p>
        </div>

        <button className={s.primary} onClick={onClose}>
          Увійти
        </button>
      </div>
    </div>
  );
}

