import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import {
  EmailIcon,
  NumberIcon,
  UserIcon,
  CertificateIcon,
  PasswordsIcon,
  QuestionIcon,
} from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import PasswordField from "@/components/ui/FormFields/PasswordField";
import TextareaField from "@/components/ui/FormFields/TextareaField";
import s from "./RegisterModal.module.css";

export interface RegisterFormValues {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  certificate?: string;
  comment?: string;
}

interface RegisterFormProps {
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
  handleSubmit: UseFormHandleSubmit<RegisterFormValues>;
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  isSubmitting: boolean;
  isPending: boolean;
  isError: boolean;
}

export default function RegisterForm({
  register,
  errors,
  handleSubmit,
  onSubmit,
  isSubmitting,
  isPending,
  isError,
}: RegisterFormProps) {
  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={s.row}>
        <div className={s.inputGroup}>
          <InputField
            icon={<UserIcon />}
            label="Ваше ім'я та прізвище"
            type="text"
            id="register-form-name-field"
            hasError={!!errors.first_name}
            supportingText="Будь ласка, вкажіть імʼя та прізвище"
            {...register("first_name", { required: true })}
          />
        </div>

        <div className={s.inputGroup}>
          <InputField
            icon={<NumberIcon />}
            label="Ваш номер телефону"
            type="tel"
            id="register-form-phone-field"
            onlyDigits
            hasError={!!errors.phone}
            supportingText="Будь ласка, вкажіть номер телефону"
            {...register("phone", { required: true })}
          />
        </div>
      </div>

      <div className={s.row}>
        <div className={s.inputGroup}>
          <InputField
            icon={<EmailIcon />}
            label="Ваша пошта"
            type="email"
            id="register-form-email-field"
            hasError={!!errors.email}
            supportingText={
              (errors.email?.message as string) ||
              'Електронна адреса має містити знак "@"'
            }
            {...register("email", {
              required: true,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message:
                  'Електронна адреса має містити знак "@" та коректний домен',
              },
            })}
          />
        </div>

        <div className={s.inputGroup}>
          <InputField
            icon={<CertificateIcon />}
            label="Номер сертифіката"
            type="text"
            {...register("certificate")}
          />
        </div>
      </div>

      <div className={s.rowSingle}>
        <TextareaField
          icon={<QuestionIcon />}
          label="Коментар (необов'язково)"
          rows={4}
          {...register("comment")}
        />
      </div>

      <div className={s.rowSingle}>
        <PasswordField
          icon={<PasswordsIcon />}
          label="Пароль"
          hasError={!!errors.password}
          supportingText={
            (errors.password?.message as string) ||
            "Пароль має містити щонайменше 6 символів"
          }
          {...register("password", {
            required: true,
            minLength: {
              value: 6,
              message: "Пароль має містити щонайменше 6 символів",
            },
          })}
        />
      </div>

      {isError && (
        <p className={s.error}>Помилка реєстрації. Спробуйте ще раз.</p>
      )}

      <div className={s.privacyLinkBlock}>
        <button
          className={s.submit}
          type="submit"
          disabled={isSubmitting || isPending}
        >
          {isPending ? "Відправка..." : "Зареєструватись"}
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
