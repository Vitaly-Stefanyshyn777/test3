import React, { useState } from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { NumberIcon, UserIcon, QuestionIcon, EmailIcon } from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import PasswordField from "@/components/ui/FormFields/PasswordField";
import s from "./ReviewModal.module.css";
import TextareaField from "../ui/FormFields/TextareaField";

export interface LoginFormValues {
  first_name: string;
  last_name?: string;
  phone: string;
  question?: string;
  rating: number;
  email?: string; // Додаємо email для WooCommerce відгуків
}

interface StarIconProps {
  filled: boolean;
  className?: string;
}

const StarIcon: React.FC<StarIconProps> = ({ filled, className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M7.08876 0.552577C7.32825 -0.184471 8.37097 -0.184471 8.61045 0.552578L9.91514 4.56798C10.0222 4.8976 10.3294 5.12077 10.676 5.12077H14.898C15.673 5.12077 15.9952 6.11246 15.3683 6.56798L11.9526 9.04964C11.6722 9.25335 11.5548 9.61445 11.6619 9.94406L12.9666 13.9595C13.2061 14.6965 12.3625 15.3094 11.7355 14.8539L8.31984 12.3722C8.03945 12.1685 7.65977 12.1685 7.37938 12.3722L3.96367 14.8539C3.3367 15.3094 2.49312 14.6965 2.7326 13.9595L4.03729 9.94406C4.14438 9.61445 4.02706 9.25335 3.74667 9.04964L0.330963 6.56798C-0.296008 6.11246 0.0262122 5.12077 0.801191 5.12077H5.02324C5.36982 5.12077 5.67698 4.8976 5.78408 4.56798L7.08876 0.552577Z"
      fill={filled ? "#8B5CF6" : "#C0C0C0"}
    />
  </svg>
);

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
  const [rating, setRating] = useState<number>(3);

  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="hidden" value={rating} {...register("rating")} />

      <div className={s.fieldsBlock}>
        <div className={s.inputGroup}>
          <InputField
            icon={<UserIcon />}
            label="Ваше ім’я та прізвище"
            type="text"
            hasError={!!errors.first_name}
            supportingText={
              (errors.first_name?.message as string) ||
              "Будь ласка, вкажіть імʼя та прізвище"
            }
            {...register("first_name", { required: true })}
          />

          <InputField
            icon={<NumberIcon />}
            label="Ваш номер телефону"
            type="tel"
            onlyDigits
            hasError={!!errors.phone}
            supportingText={
              (errors.phone?.message as string) ||
              "Будь ласка, вкажіть номер телефону"
            }
            {...register("phone", { required: true })}
          />
          <InputField
            icon={<EmailIcon />}
            label="Ваш email"
            type="email"
            hasError={!!errors.email}
            supportingText={
              (errors.email?.message as string) ||
              "Будь ласка, вкажіть email"
            }
            {...register("email", { 
              required: true,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Невірний формат email"
              }
            })}
          />
          <div className={s.rowSingle}>
            <TextareaField
              icon={<QuestionIcon />}
              label="Ваш коментар"
              rows={4}
              hasError={!!errors.question}
              supportingText={
                (errors.question?.message as string) ||
                "Будь ласка, залиште коментар"
              }
              {...register("question", { required: "Коментар обов'язковий" })}
            />
          </div>
        </div>
      </div>

      <div className={s.ratingRow}>
        <span className={s.ratingLabel}>Оцінка:</span>
        <div className={s.stars}>
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1;
            const filled = value <= rating;
            return (
              <button
                key={value}
                type="button"
                className={s.starButton}
                onClick={() => setRating(value)}
              >
                <StarIcon filled={filled} className={s.star} />
              </button>
            );
          })}
        </div>
      </div>

      {isError && (
        <p className={s.error}>Помилка відправки заявки. Спробуйте ще раз.</p>
      )}

      <div className={s.privacyLinkBlock}>
        <button
          className={s.submit}
          type="submit"
          disabled={isSubmitting || isPending}
        >
          {isPending ? "Завантаження..." : "Залишити відгук"}
        </button>
        {/* 
        <p className={s.privacyText}>
          Натискаючи на кнопку, ви погоджуєтесь з{" "}
          <a href="/privacy" className={s.privacyLink}>
            Політикою конфіденційності
          </a>
        </p> */}
      </div>
    </form>
  );
}
