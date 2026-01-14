"use client";
import { useState, useEffect, useRef } from "react";
import { useUserProfileQuery } from "./useUserProfileQuery";
import { useAuthStore } from "@/store/auth";
import { FormData } from "@/components/sections/CheckoutSection/types";

export function useCheckoutUI(setFormData: (data: Partial<FormData>) => void) {
  const { data: userProfile, isLoading: isUserProfileLoading } =
    useUserProfileQuery();
  const isLoggedIn = useAuthStore((st) => st.isLoggedIn);

  // Стан мобільності
  const [isMobile, setIsMobile] = useState(false);

  // Стан skeleton для підсумку
  const [isSummarySkeleton, setIsSummarySkeleton] = useState(true);

  // Ref для відстеження, чи вже було автозаповнення
  const hasAutoFilledRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsSummarySkeleton(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Автозаповнення форми даними користувача
  useEffect(() => {
    if (
      userProfile &&
      isLoggedIn &&
      !isUserProfileLoading &&
      !hasAutoFilledRef.current
    ) {
      const updates: Partial<FormData> = {};

      const normalize = (s: string) =>
        String(s || "")
          .replace(/[.!]+$/g, "")
          .trim();

      const firstName = normalize(userProfile.first_name || "");
      let lastName = normalize(userProfile.last_name || "");

      if (firstName && lastName && firstName === lastName) {
        lastName = "";
      }

      if (firstName) {
        updates.firstName = firstName;
      }

      if (lastName) {
        updates.lastName = lastName;
      }

      if (userProfile.email || userProfile.user_email) {
        updates.email = userProfile.email || userProfile.user_email || "";
      }

      const acf = (userProfile.acf || {}) as Record<string, unknown>;
      const meta = (userProfile.meta || {}) as Record<string, string>;

      const phone =
        (acf.phone as string) ||
        meta.input_text_social_phone ||
        meta.phone ||
        userProfile.social_phone ||
        "";
      if (phone) {
        updates.phone = phone;
      }

      // Перевіряємо, чи є що оновити
      if (Object.keys(updates).length > 0) {
        setFormData(updates);
        hasAutoFilledRef.current = true; // Позначаємо, що автозаповнення відбулося
      }
    }
  }, [userProfile, isLoggedIn, isUserProfileLoading, setFormData]);

  return {
    isMobile,
    isSummarySkeleton,
  };
}
