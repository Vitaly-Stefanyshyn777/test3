import React, { useState } from "react";
import { EyeIcon, NoEyesIcon } from "@/components/Icons/Icons";
import styles from "./PasswordField.module.css";

interface PasswordFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  inputBlockClassName?: string;
  eyeBtnClassName?: string;
  hasError?: boolean;
  supportingText?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  icon,
  label,
  wrapperClassName = "",
  inputClassName = "",
  labelClassName = "",
  inputBlockClassName = "",
  eyeBtnClassName = "",
  hasError = false,
  supportingText = "Supporting text",
  id,
  ...inputProps
}) => {
  const [visible, setVisible] = useState(false);
  const inputId =
    id ||
    (label
      ? `${label.replace(/\s+/g, "-").toLowerCase()}-password`
      : undefined);

  return (
    <div
      className={`${styles.fieldWrapper} ${wrapperClassName}`}
      data-error={hasError ? "true" : "false"}
    >
      <div className={styles.inputWrapper}>
        {icon && <div className={styles.inputIcon}>{icon}</div>}
        <div className={styles.inputBlock}>
          <input
            id={inputId}
            {...inputProps}
            type={visible ? "text" : "password"}
            placeholder=" "
            className={`${styles.input} ${inputClassName}`}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={`${styles.label} ${labelClassName}`}
            >
              {label}
            </label>
          )}
        </div>
        <button
          type="button"
          className={`${styles.eyeBtn} ${eyeBtnClassName}`}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Сховати пароль" : "Показати пароль"}
        >
          {visible ? <NoEyesIcon /> : <EyeIcon />}
        </button>
        {hasError && (
          <img
            src="/Danger.svg"
            alt=""
            aria-hidden="true"
            className={styles.errorIcon}
          />
        )}
      </div>
      <div className={styles.supportingTextWrapper}>
        <span className={styles.supportingText}>
          {hasError ? supportingText : ""}
        </span>
      </div>
    </div>
  );
};

export default PasswordField;
