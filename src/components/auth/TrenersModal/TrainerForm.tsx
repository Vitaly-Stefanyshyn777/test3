import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import {
  EmailIcon,
  InstagramIcon,
  NumberIcon,
  QuestionIcon,
  UserIcon,
} from "../../Icons/Icons";
import InputField from "../../ui/FormFields/InputField";
import TextareaField from "../../ui/FormFields/TextareaField";
import s from "./TrenersModal.module.css";

export interface TrainerFormValues {
  name: string;
  phone: string;
  email: string;
  instagram: string;
  comment?: string;
}

interface TrainerFormProps {
  register: UseFormRegister<TrainerFormValues>;
  errors: FieldErrors<TrainerFormValues>;
  handleSubmit: UseFormHandleSubmit<TrainerFormValues>;
  onSubmit: (data: TrainerFormValues) => Promise<void>;
  isSubmitting: boolean;
  isPending: boolean;
  isError: boolean;
}

export default function TrainerForm({
  register,
  errors,
  handleSubmit,
  onSubmit,
  isSubmitting,
  isPending,
  isError,
}: TrainerFormProps) {
  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={s.row}>
        <div className={s.inputGroup}>
          <InputField
            icon={<UserIcon />}
            label="Ваше ім'я та прізвище"
            type="text"
            id="trainer-form-name-field"
            hasError={!!errors.name}
            supportingText="Будь ласка, вкажіть імʼя та прізвище"
            {...register("name", { required: true })}
          />
        </div>

        <div className={s.inputGroup}>
          <InputField
            icon={<NumberIcon />}
            label="Ваш номер телефону"
            type="tel"
            id="trainer-form-phone-field"
            hasError={!!errors.phone}
            supportingText="Невірний номер"
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
            id="trainer-form-email-field"
            hasError={!!errors.email}
            supportingText={
              (errors.email?.message as string) ||
              "Будь ласка, вкажіть коректну пошту"
            }
            {...register("email", {
              required: true,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Некоректний email",
              },
            })}
          />
        </div>

        <div className={s.inputGroup}>
          <InputField
            icon={<InstagramIcon />}
            label="Нікнейм Instagram"
            type="text"
            hasError={!!errors.instagram}
            supportingText="Будь ласка, вкажіть нікнейм Instagram"
            {...register("instagram", { required: true })}
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
      {isError && (
        <p className={s.error}>Помилка відправки заявки. Спробуйте ще раз.</p>
      )}

      <div className={s.privacyLinkBlock}>
        <button
          className={s.submit}
          type="submit"
          disabled={isSubmitting || isPending}
        >
          {isPending ? "Відправка..." : "Залишити заявку"}
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
