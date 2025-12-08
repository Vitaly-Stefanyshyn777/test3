import { useState } from "react";
import { UseFormRegister } from "react-hook-form";
import { PasswordsIcon } from "@/components/Icons/Icons";
import s from "./RegisterModal.module.css";

export interface RegisterFormValues {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  certificate?: string;
}

interface RegisterPasswordInputProps {
  register: UseFormRegister<RegisterFormValues>;
}

export default function RegisterPasswordInput({
  register,
}: RegisterPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  return (
    <div className={s.rowSingle}>
      <div className={s.inputWrapper}>
        <div className={s.inputIcon}>
          <PasswordsIcon />
        </div>
        <div className={s.inputBlock}>
          <input
            className={s.input}
            placeholder="Пароль"
            type={showPassword ? "text" : "password"}
            {...register("password", { minLength: 6 })}
          />
          <button
            type="button"
            className={s.passwordToggle}
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <PasswordsIcon />
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
