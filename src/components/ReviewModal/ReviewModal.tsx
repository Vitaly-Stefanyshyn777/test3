"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useScrollLock } from "@/components/hooks/useScrollLock";
import ReviewHeader from "./ReviewHeader";
import ReviewForm, { type LoginFormValues } from "./ReviewForm";
import s from "./ReviewModal.module.css";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: LoginFormValues) => Promise<void> | void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<LoginFormValues>({
    defaultValues: {
      rating: 0,
    },
  });

  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);

  useScrollLock(isOpen);

  // Скидаємо форму при відкритті модального вікна
  useEffect(() => {
    if (isOpen) {
      reset({ rating: 0 });
      setValue("rating", 0);
    }
  }, [isOpen, reset, setValue]);

  if (!isOpen) return null;

  const submit = async (values: LoginFormValues) => {
    try {
      setIsError(false);
      setIsPending(true);
      if (onSubmit) {
        await onSubmit(values);
      }
      setIsPending(false);
      reset({ rating: 0 });
      onClose();
    } catch {
      setIsPending(false);
      setIsError(true);
    }
  };

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <ReviewHeader onClose={onClose} />
        <ReviewForm
          key={isOpen ? "open" : "closed"}
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={submit}
          isSubmitting={isSubmitting}
          isPending={isPending}
          isError={isError}
          setValue={setValue}
        />
      </div>
    </div>
  );
}
