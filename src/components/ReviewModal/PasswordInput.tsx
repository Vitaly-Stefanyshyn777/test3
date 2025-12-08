import { useState } from "react";
import { UseFormRegister } from "react-hook-form";
import { PasswordsIcon } from "@/components/Icons/Icons";
import s from "./ReviewModal.module.css";

interface PasswordInputProps {
  register: UseFormRegister<{ username: string; password: string }>;
}

export default function PasswordInput({ register }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`${s.inputGroup} ${s.passwordGroup}`}>
      <div className={s.inputWrapper}>
        <div className={s.inputIcon}>
          <PasswordsIcon />
        </div>
        <div className={s.inputBlock}>
          <input
            className={s.input}
            placeholder="Пароль"
            type={showPassword ? "text" : "password"}
            {...register("password", { required: true })}
          />
          <button
            type="button"
            className={s.passwordToggle}
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M2.5 2.5L17.5 17.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M9.58333 9.58333C9.58333 10.6874 8.68833 11.5833 7.58333 11.5833C6.47833 11.5833 5.58333 10.6874 5.58333 9.58333C5.58333 8.47833 6.47833 7.58333 7.58333 7.58333C8.68833 7.58333 9.58333 8.47833 9.58333 9.58333Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M17.5 10C17.5 10 15 15 10 15C5 15 2.5 10 2.5 10C2.5 10 5 5 10 5C15 5 17.5 10 17.5 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M17.5 10C17.5 10 15 5 10 5C5 5 2.5 10 2.5 10C2.5 10 5 15 10 15C15 15 17.5 10 17.5 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
