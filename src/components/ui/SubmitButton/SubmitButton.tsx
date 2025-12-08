import React from "react";
import styles from "./SubmitButton.module.css";

interface SubmitButtonProps {
  isPending?: boolean;
  isSubmitting?: boolean;
  isFormFilled?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isPending = false,
  isSubmitting = false,
  isFormFilled = true,
  disabled = false,
  children = "Залишити заявку",
  className = "",
}) => {
  const isDisabled = disabled || isSubmitting || isPending || !isFormFilled;
  const displayText = isPending ? "Відправка..." : children;

  return (
    <button
      className={`${styles.submit} ${
        !isFormFilled ? styles.submitInactive : ""
      } ${className}`}
      type="submit"
      disabled={isDisabled}
    >
      {displayText}
    </button>
  );
};

export default SubmitButton;


