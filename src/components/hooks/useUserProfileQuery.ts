"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/auth";
import { adminRequest } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export type WpUserMe = {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  user_email?: string;
  social_phone?: string;
  social_telegram?: string;
  social_instagram?: string;
  meta?: Record<string, string>;
  avatar?: string;
  acf?: Record<string, unknown>; // РЕДАГУВАННЯ: додаємо acf для отримання контактних даних
};

export function useUserProfileQuery() {
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    // Додаємо token та isLoggedIn до queryKey щоб оновлювати при зміні стану авторизації
    // Не додаємо userId, щоб уникнути безкінечних циклів (userId може змінюватися після завантаження профілю)
    queryKey: ["user-profile", "me", token, isLoggedIn],
    queryFn: async () => {
      // Передаємо токен з authStore в getMyProfile
      // getMyProfile також перевірить localStorage як fallback
      const data = (await getMyProfile(token)) as unknown as WpUserMe;
      return data;
    },
    // Запит виконується якщо є токен або користувач залогінений (може бути httpOnly cookie)
    // Якщо немає токена і не залогінений - запит не виконується
    enabled: !!token || isLoggedIn,
    staleTime: 60_000,
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: number | string;
      body: {
        first_name?: string;
        last_name?: string;
        email?: string;
        meta?: Record<string, unknown>;
      };
    }) => {
      const res = await adminRequest({
        method: "PATCH",
        url: "/api/proxy",
        params: {
          path: `/wp-json/wp/v2/users/${encodeURIComponent(
            String(payload.id)
          )}`,
        },
        data: payload.body,
      });
      return res.data as unknown;
    },
    onSuccess: () => {
      // Інвалідуємо всі queries, пов'язані з профілем, щоб обидва компоненти отримали актуальні дані
      qc.invalidateQueries({ queryKey: ["user-profile", "me"] });
      qc.invalidateQueries({ queryKey: ["trainer-profile-full"] });
    },
  });
}
