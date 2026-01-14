import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { EmailIcon, CloseButtonIcon } from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import s from "./ResetPasswordModal.module.css";

export interface ResetPasswordEmailFormValues {
  email: string;
}

interface ResetPasswordEmailFormProps {
  form: {
    register: UseFormRegister<ResetPasswordEmailFormValues>;
    handleSubmit: UseFormHandleSubmit<ResetPasswordEmailFormValues>;
    formState: {
      errors: FieldErrors<ResetPasswordEmailFormValues>;
      isSubmitting: boolean;
    };
  };
  onSubmit: (data: ResetPasswordEmailFormValues) => Promise<void>;
  onBackToLogin: () => void;
  onClose: () => void;
}

export default function ResetPasswordEmailForm({
  form: {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  },
  onSubmit,
  onBackToLogin,
  onClose,
}: ResetPasswordEmailFormProps) {
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
          <InputField
            icon={<EmailIcon />}
            label="Ваша пошта"
            type="email"
            hasError={!!errors.email}
            supportingText={
              (errors.email?.message as string) || "Supporting text"
            }
            labelClassName={s.inputLabel}
            inputBlockClassName={s.inputBlock}
            {...register("email", {
              required: "Введіть email",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Введіть коректний email",
              },
            })}
          />
        </div>

        <div className={s.actionsBlock}>
          <button className={s.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Надсилання..." : "Надіслати"}
          </button>

          <button
            type="button"
            className={s.backButton}
            onClick={onBackToLogin}
          >
            Повернутися до <span className={s.authLink}>Авторизації</span>
          </button>
        </div>
      </form>
    </>
  );
}
