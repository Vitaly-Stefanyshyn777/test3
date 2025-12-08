"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import s from "./ContactsSection.module.css";
import ContactInfo from "./ContactInfo/ContactInfo";
import ContactForm, { ContactFormValues } from "./ContactForm/ContactForm";
import { ThemeSettingsPost } from "../../../lib/bfbApi";
import { useThemeSettingsQuery } from "../../hooks/useWpQueries";
import { useContactQuestion } from "../../../lib/useMutation";

const ContactsSection: React.FC = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettingsPost[]>([]);
  const { data, isLoading, isError } = useThemeSettingsQuery();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ContactFormValues>();

  const formValues = watch();
  const isFormFilled = !!(
    formValues.name?.trim() &&
    formValues.phone?.trim() &&
    formValues.email?.trim() &&
    formValues.nickname?.trim()
  );

  const contactMutation = useContactQuestion();

  useEffect(() => {
    if (data && Array.isArray(data)) setThemeSettings(data);
  }, [data]);

  const onSubmit = async (data: ContactFormValues) => {
    const payload: {
      name: string;
      email?: string;
      phone?: string;
      nickname?: string;
      question?: string;
    } = { name: data.name };
    if (data.email) payload.email = data.email;
    if (data.phone) payload.phone = data.phone;
    if (data.nickname) payload.nickname = data.nickname;
    if (data.question) payload.question = data.question;

    contactMutation.mutate(payload, {
      onSuccess: () => {
        reset();
      },
      onError: () => {
        // Silent error handling
      },
    });
  };

  return (
    <section className={s.contactSection}>
      <div className={s.header}>
        <p className={s.subtitle}>Зв’яжись з нами</p>
        <h2 className={s.title}>
          {themeSettings[0]?.acf?.input_text_phone?.trim() ||
            (isLoading
              ? "Завантаження…"
              : isError
              ? "Дані не прийшли"
              : "Маєте питання щодо навчання?")}
        </h2>
      </div>
      <div className={s.container}>
        <div className={s.formWrapper}>
          <ContactForm
            register={register}
            errors={errors}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting || contactMutation.isPending}
            isPending={contactMutation.isPending}
            isError={!!contactMutation.isError}
            isFormFilled={isFormFilled}
          />
        </div>
        <div className={s.innerContainer}>
          <ContactInfo />
        </div>
      </div>
    </section>
  );
};

export default ContactsSection;
