"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useScrollLock } from "../../hooks/useScrollLock";
import api from "@/lib/api";
import ResetPasswordEmailForm, {
  type ResetPasswordEmailFormValues,
} from "./ResetPasswordEmailForm";
import ResetPasswordConfirm from "./ResetPasswordConfirm";
import ResetPasswordCodeForm, {
  type ResetPasswordCodeFormValues,
} from "./ResetPasswordCodeForm";
import ResetPasswordNewPasswordForm, {
  type ResetPasswordNewPasswordFormValues,
} from "./ResetPasswordNewPasswordForm";
import ResetPasswordSuccessModal from "./ResetPasswordSuccessModal";
import s from "./ResetPasswordModal.module.css";

type ResetPasswordStep = "email" | "code" | "newPassword" | "success";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  initialStep?: "email" | "newPassword";
}

function ResetPasswordModal({
  isOpen,
  onClose,
  onOpenLogin,
  initialStep = "email",
}: ResetPasswordModalProps) {
  const [step, setStep] = useState<ResetPasswordStep>(initialStep);
  const [userEmail, setUserEmail] = useState("");
  const [resetCode, setResetCode] = useState("");

  useScrollLock(isOpen);

  // Скидаємо step при відкритті модалки з новим initialStep
  React.useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
    }
  }, [isOpen, initialStep]);

  const emailForm = useForm<ResetPasswordEmailFormValues>();
  const codeForm = useForm<ResetPasswordCodeFormValues>();
  const newPasswordForm = useForm<ResetPasswordNewPasswordFormValues>();

  const handleEmailSubmit = async (data: ResetPasswordEmailFormValues) => {
    try {
      // Викликаємо API для відправки коду на email
      await api.post("/api/proxy", { email: data.email }, {
        params: { path: "/wp-json/bdpwr/v1/reset-password" },
      });

      setUserEmail(data.email);
      setStep("code");
    } catch (error) {
      console.error("Error sending reset password email:", error);
      emailForm.setError("email", {
        message: "Помилка при відправці листа. Спробуйте ще раз.",
      });
    }
  };

  const handleCodeSubmit = async (data: ResetPasswordCodeFormValues) => {
    try {
      // Перевіряємо код через API
      await api.post("/api/proxy", {
        email: userEmail,
        code: data.code,
      }, {
        params: { path: "/wp-json/bdpwr/v1/validate-code" },
      });

      setResetCode(data.code);
      setStep("newPassword");
    } catch (error) {
      console.error("Error validating reset code:", error);
      codeForm.setError("code", {
        message: "Невірний код підтвердження",
      });
    }
  };

  const handleNewPasswordSubmit = async (
    data: ResetPasswordNewPasswordFormValues
  ) => {
    try {
      // Змінюємо пароль через API
      await api.post("/api/proxy", {
        email: userEmail,
        code: resetCode,
        password: data.password,
      }, {
        params: { path: "/wp-json/bdpwr/v1/set-password" },
      });

      setStep("success");
    } catch (error) {
      console.error("Error setting new password:", error);
      newPasswordForm.setError("password", {
        message: "Помилка при зміні паролю. Спробуйте ще раз.",
      });
    }
  };

  const handleBackToLogin = () => {
    setStep("email");
    emailForm.reset();
    codeForm.reset();
    newPasswordForm.reset();
    setUserEmail("");
    setResetCode("");
    onClose(); // Закриваємо ResetPasswordModal перед відкриттям LoginModal
    onOpenLogin();
  };

  const handleBackToEmail = () => {
    setStep("email");
    codeForm.reset();
    newPasswordForm.reset();
    setResetCode("");
    onClose(); // Закриваємо ResetPasswordModal перед відкриттям LoginModal
    onOpenLogin();
  };

  const handleBackToCode = () => {
    setStep("code");
    newPasswordForm.reset();
  };

  const handleResendEmail = async () => {
    try {
      // Повторно надсилаємо код на email
      await api.post("/api/proxy", { email: userEmail }, {
        params: { path: "/wp-json/bdpwr/v1/reset-password" },
      });
      // Можна додати повідомлення про успішну повторну відправку
    } catch (error) {
      console.error("Error resending reset code:", error);
    }
  };

  const handleSuccessClose = () => {
    setStep("email");
    emailForm.reset();
    codeForm.reset();
    newPasswordForm.reset();
    setUserEmail("");
    setResetCode("");
    onOpenLogin();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Основна модалка */}
      <div className={s.backdrop} onClick={onClose}>
        <div
          className={`${s.modal} ${
            step === "code"
              ? s.modalCode
              : step === "newPassword"
              ? s.modalNewPassword
              : s.modalEmail
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {step === "email" && (
            <ResetPasswordEmailForm
              form={emailForm}
              onSubmit={handleEmailSubmit}
              onBackToLogin={handleBackToLogin}
              onClose={onClose}
            />
          )}

          {step === "code" && (
            <ResetPasswordCodeForm
              form={codeForm}
              email={userEmail}
              onSubmit={handleCodeSubmit}
              onBackToEmail={handleBackToEmail}
              onResendEmail={handleResendEmail}
              onClose={onClose}
            />
          )}

          {step === "newPassword" && (
            <ResetPasswordNewPasswordForm
              form={newPasswordForm}
              onSubmit={handleNewPasswordSubmit}
              onBackToEmail={handleBackToEmail}
              onClose={onClose}
            />
          )}
        </div>
      </div>

      {/* Попап успіху */}
      {step === "success" && (
        <ResetPasswordSuccessModal isOpen={true} onClose={handleSuccessClose} />
      )}
    </>
  );
}

export default ResetPasswordModal;
