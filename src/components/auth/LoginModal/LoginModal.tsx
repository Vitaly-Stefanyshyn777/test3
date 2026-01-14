"use client";

import { useForm } from "react-hook-form";
import { useLogin } from "@/lib/useMutation";
import { useScrollLock } from "../../hooks/useScrollLock";
import LoginModalHeader from "./LoginModalHeader";
import LoginForm, { type LoginFormValues } from "./LoginForm";
import s from "./LoginModal.module.css";
import { useState, useCallback } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: LoginFormValues) => Promise<void>;
  onOpenRegister: () => void;
  onOpenResetPassword?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenResetPassword,
}: LoginModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>();

  const loginMutation = useLogin();
  useScrollLock(isOpen);

  const handleSwitchToRegister = () => {
    onClose(); // 1. Закриваємо модалку логіну через пропс
    onOpenRegister();
  };

  const handleForgotPassword = useCallback(() => {
    onClose(); // Закриваємо модалку логіну
    onOpenResetPassword?.(); // Відкриваємо модалку скидання пароля (якщо функція існує)
  }, [onClose, onOpenResetPassword]);

  if (!isOpen) return null;

  const submit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        username: values.username,
        password: values.password,
      });
      onClose();
    } catch (error) {
      // Встановлюємо помилки валідації для обох полів
      setError("username", {
        type: "manual",
        message: "Невірний логін або пароль",
      });
      setError("password", {
        type: "manual",
        message: "Невірний логін або пароль",
      });
    }
  };

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <LoginModalHeader onClose={onClose} />
        <LoginForm
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={submit}
          isSubmitting={isSubmitting}
          isPending={loginMutation.isPending}
          onSwitchToRegister={handleSwitchToRegister}
          onForgotPassword={handleForgotPassword}
          isError={loginMutation.isError}
        />
      </div>
    </div>
  );
}
