import { CloseButtonIcon, EmailIcon } from "@/components/Icons/Icons";
import s from "./ResetPasswordModal.module.css";

interface ResetPasswordConfirmProps {
  email: string;
  onBackToEmail: () => void;
  onResendEmail: () => void;
  onClose: () => void;
}

export default function ResetPasswordConfirm({
  email,
  onBackToEmail,
  onResendEmail,
  onClose,
}: ResetPasswordConfirmProps) {
  return (
    <>
      {/* Кнопка закриття */}
      <button className={s.close} onClick={onClose}>
        <CloseButtonIcon />
      </button>

      {/* Заголовок */}
      <div className={s.headerBlock}>
        <div className={s.header}>
          <h2 className={s.headerTitle}>Лист для відновлення надіслано</h2>
        </div>
      </div>

      {/* Контент */}
      <div className={s.confirmContent}>
        {/* <div className={s.emailIcon}>
          <EmailIcon />
        </div> */}

        <div className={s.confirmText}>
          <p className={s.confirmDescription}>
            Ми щойно надіслали посилання для відновлення пароля на вашу
            електронну пошту. Перевірте вхідні та не забудьте перевірити папку
            зі спамом. Не отримали лист на{" "}
            <span className={s.emailHighlight}>{email}</span>?
          </p>
        </div>

        <div className={s.confirmActions}>
          <button className={s.loginButton} onClick={onBackToEmail}>
            Увійти
          </button>
        </div>
      </div>
    </>
  );
}

