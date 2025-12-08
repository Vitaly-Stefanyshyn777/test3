import s from "./RegisterModal.module.css";
import { CloseButtonIcon } from "@/components/Icons/Icons";

interface RegisterModalHeaderProps {
  onClose: () => void;
}

export default function RegisterModalHeader({
  onClose,
}: RegisterModalHeaderProps) {
  return (
    <div className={s.headerBlock}>
      <div className={s.header}>
        <h2 className={s.headerText}>Створіть акаунт</h2>
        <button className={s.close} onClick={onClose}>
          <CloseButtonIcon />
        </button>
      </div>
      <p className={s.subtitle}>
        Отримуйте доступ до навчання, онлайн-тренувань, інвентарю та всіх
        переваг платформи
      </p>
    </div>
  );
}
