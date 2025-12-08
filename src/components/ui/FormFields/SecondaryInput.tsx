import React from "react";
import styles from "./SecondaryInput.module.css";

interface SecondaryInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  hasError?: boolean;
  supportingText?: string;
  onlyDigits?: boolean;
}

export const SecondaryInput: React.FC<SecondaryInputProps> = ({
  icon,
  label,
  wrapperClassName = "",
  inputClassName = "",
  hasError = false,
  supportingText = "Supporting text",
  id,
  onlyDigits,
  ...inputProps
}) => {
  const { onChange, inputMode, pattern, ...restProps } = inputProps;
  const inputId =
    id ||
    (label ? `${label.replace(/\s+/g, "-").toLowerCase()}-field` : undefined);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    let value = event.target.value;
    if (onlyDigits) {
      value = value.replace(/\D/g, "");
      event.target.value = value;
    }
    if (typeof onChange === "function") {
      onChange(event);
    }
  };

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
            {...restProps}
            inputMode={onlyDigits ? "numeric" : inputMode}
            pattern={onlyDigits ? "\\d*" : pattern}
            onChange={handleChange}
            placeholder=" "
            className={`${styles.input} ${inputClassName}`}
          />
          {label && (
            <label htmlFor={inputId} className={styles.label}>
              {label}
            </label>
          )}
        </div>
        {hasError && (
          <img
            src="/Danger.svg"
            alt=""
            aria-hidden="true"
            className={styles.errorIcon}
          />
        )}
      </div>
      {hasError && (
        <div className={styles.supportingTextWrapper}>
          <span className={styles.supportingText}>{supportingText}</span>
        </div>
      )}
    </div>
  );
};

export default SecondaryInput;
