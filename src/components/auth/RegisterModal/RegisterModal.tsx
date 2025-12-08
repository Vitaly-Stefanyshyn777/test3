"use client";

import { useForm } from "react-hook-form";
import { useRegister } from "@/lib/useMutation";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useRegisterResult } from "./useRegisterResult";
import RegisterModalHeader from "./RegisterModalHeader";
import RegisterForm from "./RegisterForm";
import RegisterResultModal from "../RegisterResultModal/RegisterResultModal";
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

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  const registerMutation = useRegister();
  const { result, setSuccess, setError, clearResult } = useRegisterResult();

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const submit = async (values: RegisterFormValues) => {
    try {
      const registerData = {
        username: values.email,
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        certificate: values.certificate,
      };

      await registerMutation.mutateAsync(registerData);
      setSuccess();
    } catch {
      setError();
    }
  };

  const handleResultClose = () => {
    clearResult();
    if (result?.type === "success") onClose();
  };

  const handlePrimaryAction = () => {
    if (result?.type === "success") {
      window.location.href = "/";
    } else {
      window.location.href = "mailto:support@bfb.ua";
    }
  };

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <RegisterModalHeader onClose={onClose} />
        <RegisterForm
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={submit}
          isSubmitting={isSubmitting}
          isPending={registerMutation.isPending}
          isError={registerMutation.isError}
        />
        <RegisterResultModal
          isOpen={!!result}
          type={result?.type === "success" ? "success" : "error"}
          title={
            result?.type === "success"
              ? "Реєстрація пройшла успішно"
              : "Помилка під час реєстрації"
          }
          description={
            result?.type === "success"
              ? "Ви успішно зареєструвались як інструктор BFB. тепер ви можете увійти в особистий кабінет і користуватись усіма доступними розділами"
              : "Не вдалося підтвердити сертифікат. перевірте правильність введеного коду або зверніться до техпідтримки, щоб ми могли допомогти"
          }
          primaryText={
            result?.type === "success"
              ? "На головну"
              : "Зв'язатися з підтримкою"
          }
          onPrimary={handlePrimaryAction}
          onClose={handleResultClose}
        />
      </div>
    </div>
  );
}
