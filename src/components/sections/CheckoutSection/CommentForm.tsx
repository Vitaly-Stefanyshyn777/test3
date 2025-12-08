"use client";
import React from "react";
import { FormData } from "./types";
import s from "./CheckoutSection.module.css";
import Multiline from "@/components/ui/FormFields/Multiline";
import multilineStyles from "@/components/ui/FormFields/Multiline.module.css";

interface CommentFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export default function CommentForm({
  formData,
  setFormData,
}: CommentFormProps) {
  return (
    <div className={s.commentBlock}>
      <h2 className={s.sectionTitle}>Коментар до замовлення</h2>
      <Multiline
        label="Залишити коментар до замовлення"
        value={formData.comment}
        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
        textareaClassName={multilineStyles.textareaWhite}
      />
    </div>
  );
}
