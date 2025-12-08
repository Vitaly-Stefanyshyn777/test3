import React from "react";
import styles from "./Multiline.module.css";

interface MultilineProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: React.ReactNode;
  label?: string;
  wrapperClassName?: string;
  textareaClassName?: string;
  hasError?: boolean;
  supportingText?: string;
}

export const Multiline: React.FC<MultilineProps> = ({
  icon,
  label,
  wrapperClassName = "",
  textareaClassName = "",
  hasError = false,
  supportingText = "Supporting text",
  id,
  ...textareaProps
}) => {
  const textareaId =
    id ||
    (label
      ? `${label.replace(/\s+/g, "-").toLowerCase()}-textarea`
      : undefined);

  return (
    <div
      className={`${styles.fieldWrapper} ${wrapperClassName}`}
      data-error={hasError ? "true" : "false"}
    >
      <div className={styles.textareaWrapper}>
        {icon && <div className={styles.textareaIcon}>{icon}</div>}
        <textarea
          id={textareaId}
          {...textareaProps}
          placeholder=" "
          className={`${styles.textarea} ${textareaClassName}`}
        />
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
          </label>
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

export default Multiline;
