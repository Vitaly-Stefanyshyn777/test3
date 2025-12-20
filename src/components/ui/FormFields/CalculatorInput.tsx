import React from "react";
import styles from "./CalculatorInput.module.css";
import { CloseCheckBorderIcon } from "@/components/Icons/Icons";
// !!! Припустімо, ви імпортуєте вашу іконку:
// import { CloseCheckBorderIcon } from "@/components/Icons/Icons";

// Визначення заглушки для іконки, якщо ви не надали її
<CloseCheckBorderIcon />;

interface CalculatorInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  hasError?: boolean;
  supportingText?: string;
  onlyDigits?: boolean;
  showClearButton?: boolean; // Додаємо пропс для контролю
}

export const CalculatorInput: React.FC<CalculatorInputProps> = ({
  icon,
  label,
  wrapperClassName = "",
  inputClassName = "",
  hasError = false,
  supportingText = "",
  id,
  onlyDigits,
  showClearButton = true, // За замовчуванням увімкнено
  ...inputProps
}) => {
  // Розбиваємо props для доступу до onChange та value
  const { onChange, inputMode, pattern, value = "", ...restProps } = inputProps;

  const inputId =
    id ||
    (label ? `${label.replace(/\s+/g, "-").toLowerCase()}-field` : undefined);

  // 1. ЛОГІКА ОЧИЩЕННЯ ПОЛЯ
  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Запобігаємо відправці форми

    if (typeof onChange === "function") {
      // Створюємо синтетичну подію для Formik/контрольованого інпуту
      const syntheticEvent = {
        target: {
          value: "",
          name: restProps.name, // Потрібно для Formik
          id: inputId,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    }
  };

  // 2. ЛОГІКА ЗМІНИ З ВАЛІДАЦІЄЮ
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    let value = event.target.value;
    if (onlyDigits) {
      // Фільтруємо лише цифри
      value = value.replace(/[^\d]/g, "");
      event.target.value = value;
    }

    if (typeof onChange === "function") {
      onChange(event);
    }
  };

  // 3. УМОВИ ВІДОБРАЖЕННЯ ІКОНКИ
  const isValuePresent = value !== "";
  const showClear = showClearButton && isValuePresent && !hasError;
  const showError = hasError && supportingText;

  return (
    <div
      className={`${styles.fieldWrapper} ${wrapperClassName}`}
      data-error={showError ? "true" : "false"}
    >
      <div className={styles.inputWrapper}>
        {icon && <div className={styles.inputIcon}>{icon}</div>}

        <div className={styles.inputBlock}>
          <input
            id={inputId}
            {...restProps}
            value={value} // Використовуємо value з пропсів
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

        {/* ІКОНКА ОЧИЩЕННЯ (Відображається, коли поле заповнене і немає помилки) */}
        {showClear && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Очистити поле"
          >
            <CloseCheckBorderIcon />
          </button>
        )}

        {/* ІКОНКА ПОМИЛКИ (Відображається лише, коли є помилка) */}
        {showError && (
          <img
            src="/Danger.svg"
            alt=""
            aria-hidden="true"
            className={styles.errorIcon}
          />
        )}
      </div>

      {showError && (
        <div className={styles.supportingTextWrapper}>
          <span className={styles.supportingText}>{supportingText}</span>
        </div>
      )}
    </div>
  );
};

export default CalculatorInput;
