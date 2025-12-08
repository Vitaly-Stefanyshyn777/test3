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
            (errors.username?.message as string) || "Заповніть email або username"
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

        <p className={s.privacyText}>
          Натискаючи на кнопку, ви погоджуєтесь з{" "}
          <a href="/privacy" className={s.privacyLink}>
            Політикою конфіденційності
          </a>
        </p>
      </div>
    </form>
  );
}
