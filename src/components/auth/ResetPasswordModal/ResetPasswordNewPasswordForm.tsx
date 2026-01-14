import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { CloseButtonIcon, PasswordsIcon } from "@/components/Icons/Icons";
import PasswordField from "@/components/ui/FormFields/PasswordField";
import s from "./ResetPasswordModal.module.css";

export interface ResetPasswordNewPasswordFormValues {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordNewPasswordFormProps {
  form: {
    register: UseFormRegister<ResetPasswordNewPasswordFormValues>;
    handleSubmit: UseFormHandleSubmit<ResetPasswordNewPasswordFormValues>;
    formState: { errors: FieldErrors<ResetPasswordNewPasswordFormValues>; isSubmitting: boolean };
  };
  onSubmit: (data: ResetPasswordNewPasswordFormValues) => Promise<void>;
  onBackToEmail: () => void;
  onClose: () => void;
}

export default function ResetPasswordNewPasswordForm({
  form: { register, handleSubmit, formState: { errors, isSubmitting } },
  onSubmit,
  onBackToEmail,
  onClose,
}: ResetPasswordNewPasswordFormProps) {
  return (
    <>
      {/* Кнопка закриття */}
      <button className={s.close} onClick={onClose}>
        <CloseButtonIcon />
      </button>

      {/* Заголовок */}
      <div className={s.headerBlock}>
        <div className={s.header}>
          <h2 className={s.headerTitle}>Скинути пароль</h2>
        </div>
      </div>

      {/* Форма */}
      <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={s.inputGroup}>
          <PasswordField
            icon={<PasswordsIcon />}
            label="Створіть новий пароль"
            hasError={!!errors.password}
            supportingText={
              (errors.password?.message as string) || "Мінімум 6 символів"
            }
            labelClassName={s.inputLabel}
            eyeBtnClassName={s.eyeBtn}
            inputBlockClassName={s.inputBlock}
            {...register("password", {
              required: "Введіть новий пароль",
              minLength: {
                value: 6,
                message: "Пароль має містити мінімум 6 символів"
              }
            })}
          />

          <PasswordField
            icon={<PasswordsIcon />}
            label="Підтвердіть новий пароль"
            hasError={!!errors.confirmPassword}
            supportingText={
              (errors.confirmPassword?.message as string) || "Повторіть пароль"
            }
            labelClassName={s.inputLabel}
            eyeBtnClassName={s.eyeBtn}
            inputBlockClassName={s.inputBlock}
            {...register("confirmPassword", {
              required: "Підтвердіть новий пароль",
              validate: (value, formValues) => {
                if (value !== formValues.password) {
                  return "Паролі не співпадають";
                }
                return true;
              }
            })}
          />
        </div>

        <div className={s.actionsBlock}>
          <button
            className={s.submit}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Збереження..." : "Скинути"}
          </button>

          <button
            type="button"
            className={s.backButton}
            onClick={onBackToEmail}
          >
            Повернутися до Авторизації
          </button>
        </div>
      </form>
    </>
  );
}

