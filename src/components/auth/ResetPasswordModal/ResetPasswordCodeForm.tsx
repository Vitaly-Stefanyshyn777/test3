import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { CloseButtonIcon, EmailIcon } from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import s from "./ResetPasswordModal.module.css";

export interface ResetPasswordCodeFormValues {
  code: string;
}

interface ResetPasswordCodeFormProps {
  form: {
    register: UseFormRegister<ResetPasswordCodeFormValues>;
    handleSubmit: UseFormHandleSubmit<ResetPasswordCodeFormValues>;
    formState: {
      errors: FieldErrors<ResetPasswordCodeFormValues>;
      isSubmitting: boolean;
    };
  };
  email: string;
  onSubmit: (data: ResetPasswordCodeFormValues) => Promise<void>;
  onBackToEmail: () => void;
  onResendEmail: () => void;
  onClose: () => void;
}

export default function ResetPasswordCodeForm({
  form: {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  },
  email,
  onSubmit,
  onBackToEmail,
  onResendEmail,
  onClose,
}: ResetPasswordCodeFormProps) {
  return (
    <>
      {/* Кнопка закриття */}
      <button className={s.close} onClick={onClose}>
        <CloseButtonIcon />
      </button>

      {/* Заголовок */}
      <div className={s.headerBlock}>
        <div className={s.header}>
          <h2 className={s.headerTitle}>Введіть код підтвердження</h2>
        </div>
      </div>

      {/* Контент */}
      <div className={s.confirmContent}>
        <div className={s.confirmText}>
          <p className={s.confirmDescription}>
            Ми надіслали код підтвердження на вашу електронну пошту{" "}
            <span className={s.emailHighlight}>{email}</span>.
            Введіть код для продовження скидання паролю.
          </p>
        </div>
      </div>

      {/* Форма */}
      <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={s.inputGroup}>
          <InputField
            icon={<EmailIcon />}
            label="Код підтвердження"
            type="text"
            placeholder="Введіть код"
            hasError={!!errors.code}
            supportingText={
              (errors.code?.message as string) || "Код з 4-6 символів"
            }
            labelClassName={s.inputLabel}
            inputBlockClassName={s.inputBlock}
            {...register("code", {
              required: "Введіть код підтвердження",
              minLength: {
                value: 4,
                message: "Код має містити мінімум 4 символи",
              },
              maxLength: {
                value: 6,
                message: "Код має містити максимум 6 символів",
              },
            })}
          />
        </div>

        <div className={s.actionsBlock}>
          <button className={s.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Перевірка..." : "Підтвердити"}
          </button>

          <button
            type="button"
            className={s.backButton}
            onClick={onBackToEmail}
          >
            Змінити email
          </button>

          <button
            type="button"
            className={s.resendButton}
            onClick={onResendEmail}
          >
            Надіслати код повторно
          </button>
        </div>
      </form>
    </>
  );
}
