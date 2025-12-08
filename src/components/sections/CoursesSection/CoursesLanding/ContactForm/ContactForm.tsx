import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import {
  EmailIcon,
  EmailDoggieIcon,
  NumberIcon,
  QuestionIcon,
  UserIcon,
} from "@/components/Icons/Icons";
import SubmitButton from "@/components/ui/SubmitButton/SubmitButton";
import InputField from "@/components/ui/FormFields/InputField";
import TextareaField from "@/components/ui/FormFields/TextareaField";
import s from "./ContactForm.module.css";

// Вирівнюємо форму на курсах з формою на головній (ContactsSection)
export interface ContactFormValues {
  name: string;
  phone?: string;
  email?: string;
  instagram?: string; // Нікнейм Telegram/Instagram
  comment?: string;
}

interface TrainerFormProps {
  register: UseFormRegister<ContactFormValues>;
  errors: FieldErrors<ContactFormValues>;
  handleSubmit: UseFormHandleSubmit<ContactFormValues>;
  onSubmit: (data: ContactFormValues) => Promise<void>;
  isSubmitting: boolean;
  isPending: boolean;
  isError: boolean;
  isFormFilled?: boolean;
}

export default function ContactForm({
  register,
  errors,
  handleSubmit,
  onSubmit,
  isSubmitting,
  isPending,
  isError,
  isFormFilled = true,
}: TrainerFormProps) {
  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={s.row}>
        <div className={s.inputGroup}>
          <InputField
            icon={<UserIcon />}
            label="Ваше ім'я та прізвище"
            type="text"
            hasError={!!errors.name}
            supportingText="Будь ласка, вкажіть імʼя"
            {...register("name", { required: true })}
          />
        </div>

        <div className={s.inputGroup}>
          <InputField
            icon={<NumberIcon />}
            label="Ваш номер телефону"
            type="tel"
            onlyDigits
            hasError={!!errors.phone}
            supportingText="Невірний номер"
            {...register("phone")}
          />
        </div>
      </div>

      <div className={s.row}>
        <div className={s.inputGroup}>
          <InputField
            icon={<EmailDoggieIcon />}
            label="Нікнейм Telegram/Instagram"
            type="text"
            hasError={!!errors.instagram}
            supportingText={
              (errors.instagram?.message as string) || "Некоректний нікнейм"
            }
            {...register("instagram", {
              pattern: {
                value: /^@?[A-Za-z0-9._]+$/, // optional @ at start
                message: "Некоректний нікнейм",
              },
            })}
          />
        </div>

        <div className={s.inputGroup}>
          <InputField
            icon={<EmailIcon />}
            label="Ваша пошта"
            type="email"
            hasError={!!errors.email}
            supportingText={
              (errors.email?.message as string) ||
              'Електронна адреса має містити знак "@"'
            }
            {...register("email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message:
                  'Електронна адреса має містити знак "@" та коректний домен',
              },
            })}
          />
        </div>
      </div>

      <div className={s.rowSingle}>
        <TextareaField
          icon={<QuestionIcon />}
          label="Ваше питання"
          rows={4}
          {...register("comment")}
        />
      </div>

      {isError && (
        <p className={s.error}>Помилка відправки заявки. Спробуйте ще раз.</p>
      )}

      <div className={s.privacyLinkBlock}>
        <SubmitButton
          isPending={isPending}
          isSubmitting={isSubmitting}
          isFormFilled={isFormFilled}
        />

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
