import s from "./LoginModal.module.css";
import { CloseButtonIcon } from "@/components/Icons/Icons";

interface LoginModalHeaderProps {
  onClose: () => void;
}

export default function LoginModalHeader({ onClose }: LoginModalHeaderProps) {
  return (
    <div className={s.headerBlock}>
      <div className={s.header}>
        <h2 className={s.headerText}>Вхід до кабінету</h2>
        <button className={s.close} onClick={onClose}>
          <CloseButtonIcon />
        </button>
      </div>
      <p className={s.subtitle}>
        Авторизуйтесь, щоб отримати доступ до особистого кабінету
      </p>
    </div>
  );
}
