import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { EmailIcon, PasswordsIcon } from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import PasswordField from "@/components/ui/FormFields/PasswordField";
import s from "./LoginModal.module.css";

export interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginFormProps {
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  handleSubmit: UseFormHandleSubmit<LoginFormValues>;
  onSubmit: (data: LoginFormValues) => Promise<void>;
  onSwitchToRegister: () => void;
  onForgotPassword?: () => void;
  isSubmitting: boolean;
  isPending: boolean;
  isError: boolean;
}

export default function LoginForm({
  register,
  errors,
  handleSubmit,
  onSubmit,
  isSubmitting,
  isPending,
  isError,
  onSwitchToRegister,
  onForgotPassword,
}: LoginFormProps) {
  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={s.inputGroup}>
        <InputField
          icon={<EmailIcon />}
          label="Ваш email або username"
          type="text"
          hasError={!!errors.username}
          supportingText={
            (errors.username?.message as string) ||
            "Заповніть email або username"
          }
          labelClassName={s.loginInputLabel}
          inputBlockClassName={s.loginInputBlock}
          {...register("username", { required: true })}
        />

        <PasswordField
          icon={<PasswordsIcon />}
          label="Пароль"
          hasError={!!errors.password}
          supportingText={
            (errors.password?.message as string) || "Введіть пароль"
          }
          labelClassName={s.loginPasswordLabel}
          eyeBtnClassName={s.loginPasswordEyeBtn}
          inputBlockClassName={s.loginPasswordBlock}
          {...register("password", { required: true })}
        />
      </div>

      <div className={s.privacyLinkBlock}>
        <button
          className={s.submit}
          type="submit"
          disabled={isSubmitting || isPending}
        >
          {isPending ? "Вхід..." : "Увійти"}
        </button>

        <div className={s.bottomLinksBlock}>
          {/* Посилання на скидання пароля */}
          {onForgotPassword && (
            <div className={s.forgotPasswordBlock}>
              <button
                type="button"
                className={s.forgotPasswordButton}
                onClick={onForgotPassword}
              >
                Забули пароль?
              </button>
            </div>
          )}

          <div className={s.registerSwitchBlock}>
            <span className={s.registerText}>У мене немає акаунту?</span>
            <button
              type="button" // Важливо: запобігає відправці форми
              className={s.registerButton}
              onClick={onSwitchToRegister} // ✅ Викликаємо функцію перемикання
            >
              Зареєструватися
            </button>
          </div>
        </div>

        <p className={s.privacyText}>
          Натискаючи на кнопку, ви погоджуєтесь з{" "}
          <a href="/privacy-policy" className={s.privacyLink}>
            Політикою конфіденційності
          </a>
        </p>
      </div>
    </form>
  );
}
