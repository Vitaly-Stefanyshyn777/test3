import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  login,
  register,
  refresh,
  submitTrainerApplication,
  getMyProfile,
  type LoginCredentials,
  type RegisterCredentials,
  type TrainerApplicationCredentials,
} from "./auth";
import {
  submitContactQuestion,
  updateTrainerProfile,
  createWcOrder,
} from "./bfbApi";
import { useAuthStore } from "../store/auth";

export const useLogin = () => {
  const { setAuth, user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      return login(credentials);
    },
    onSuccess: async (data) => {
      // Після логіну одразу отримуємо числовий id через /users/me (як в auth.ts)
      let numericId: string | undefined;
      try {
        const me = await getMyProfile(data.token);
        if (me?.id) numericId = String(me.id);
      } catch {}

      const user = {
        id: numericId || data.user_nicename,
        email: data.user_email,
        displayName: data.user_display_name,
      };

      // Якщо входить новий користувач (не той самий), очищаємо весь кеш
      const newUserId = user.id;
      const oldUserId = currentUser?.id;
      if (oldUserId && newUserId && oldUserId !== newUserId) {
        queryClient.clear();
      }

      setAuth(data.token, user);
      
      // Інвалідуємо queries для оновлення даних
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
      queryClient.invalidateQueries({ queryKey: ["trainer-profile-full"] });
      
      // Після авторизації явно завантажуємо профіль через GET запит,
      // щоб дані (email, first_name, last_name, phone) автоматично заповнили форму PersonalData
      // Виконуємо після setAuth, щоб токен встиг оновитися в store
      setTimeout(async () => {
        try {
          // Чекаємо трохи, щоб сервер встиг обробити авторизацію та токен оновився в store
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          // Завантажуємо профіль через GET запит
          const profile = await getMyProfile(data.token);
          
          if (profile) {
            // Зберігаємо профіль в кеш React Query для всіх можливих queryKey
            // щоб PersonalData автоматично отримав дані
            queryClient.setQueryData(["user-profile", "me", data.token], profile);
            queryClient.setQueryData(["user-profile", "me", null], profile);
            queryClient.setQueryData(["user-profile", "me"], profile);
          }
          
          // Викликаємо refetch для оновлення компонентів (після setQueryData)
          queryClient.refetchQueries({ queryKey: ["user-profile", "me"] });
        } catch (error) {
          console.error("[useLogin] Помилка завантаження профілю після авторизації:", error);
          // Якщо не вдалося завантажити, все одно викликаємо refetch для автоматичного завантаження
          queryClient.refetchQueries({ queryKey: ["user-profile", "me"] });
        }
      }, 0);
    },
    onError: (error: unknown) => {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response
      ) {
      }
    },
  });
};

export const useRegister = () => {
  const { setAuth, user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => {
      return register(credentials);
    },
    onSuccess: async (data) => {
      const user = {
        id: data.id.toString(),
        email: data.email || "",
        displayName: data.name,
      };

      // При реєстрації нового користувача завжди очищаємо кеш
      const newUserId = user.id;
      const oldUserId = currentUser?.id;
      if (oldUserId && newUserId && oldUserId !== newUserId) {
        queryClient.clear();
      } else if (!oldUserId) {
        // Якщо раніше не було користувача, також очищаємо кеш
        queryClient.clear();
      }

      setAuth("", user);
      
      // Інвалідуємо queries для оновлення даних
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
      queryClient.invalidateQueries({ queryKey: ["trainer-profile-full"] });
      
      // Після реєстрації явно завантажуємо профіль через GET запит,
      // щоб дані (email, first_name, last_name, phone) автоматично заповнили форму PersonalData
      // Виконуємо після setAuth, щоб isLoggedIn встиг оновитися в store
      // Використовуємо два підходи: одразу refetch та через setTimeout для гарантії
      
      // Підхід 1: Негайний refetch (якщо isLoggedIn вже true)
      queryClient.refetchQueries({ queryKey: ["user-profile", "me"] });
      
      // Підхід 2: Завантаження профілю через setTimeout для гарантії
      setTimeout(async () => {
        try {
          // Чекаємо трохи, щоб сервер встиг обробити реєстрацію та isLoggedIn оновився в store
          await new Promise((resolve) => setTimeout(resolve, 800));
          
          // Завантажуємо профіль через GET запит (null для використання httpOnly cookie)
          const profile = await getMyProfile(null);
          
          if (profile) {
            // Оновлюємо user.id з числовим ID з профілю (якщо вони відрізняються)
            const profileId = String((profile as unknown as { id?: number | string })?.id || "");
            const updatedUser = profileId && profileId !== user.id 
              ? { ...user, id: profileId }
              : user;
            
            if (profileId && profileId !== user.id) {
              const { setUser } = useAuthStore.getState();
              setUser(updatedUser);
            }
            
            // Зберігаємо профіль в кеш React Query для всіх можливих queryKey
            // щоб PersonalData автоматично отримав дані
            const { isLoggedIn: currentIsLoggedIn, token: currentToken } = useAuthStore.getState();
            
            // Зберігаємо для різних комбінацій queryKey (без userId, щоб уникнути безкінечних циклів)
            queryClient.setQueryData(["user-profile", "me", null, currentIsLoggedIn], profile);
            queryClient.setQueryData(["user-profile", "me", "", currentIsLoggedIn], profile);
            queryClient.setQueryData(["user-profile", "me", currentToken, currentIsLoggedIn], profile);
            queryClient.setQueryData(["user-profile", "me", null], profile);
            queryClient.setQueryData(["user-profile", "me", ""], profile);
            queryClient.setQueryData(["user-profile", "me"], profile);
            
            // Викликаємо refetch для оновлення компонентів (після setQueryData)
            queryClient.refetchQueries({ queryKey: ["user-profile", "me"] });
          }
        } catch (error) {
          console.error("[useRegister] Помилка завантаження профілю після реєстрації:", error);
          // Якщо не вдалося завантажити, все одно викликаємо refetch для автоматичного завантаження
          queryClient.refetchQueries({ queryKey: ["user-profile", "me"] });
        }
      }, 0);
    },
    onError: (error: unknown) => {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response
      ) {
      }
    },
  });
};

export const useRefresh = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => {
      return refresh();
    },
    onSuccess: (data) => {
      if (data) {
        setAuth("", {
          id: data.id?.toString() || "",
          email: data.email || "",
          displayName: data.name,
        });
      }
    },
    onError: () => {},
  });
};

export const useTrainerApplication = () => {
  return useMutation({
    mutationFn: (credentials: TrainerApplicationCredentials) => {
      return submitTrainerApplication(credentials);
    },
    onSuccess: () => {},
    onError: (error: unknown) => {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response
      ) {
      }
    },
  });
};

export const useContactQuestion = () => {
  return useMutation({
    mutationFn: (payload: {
      name: string;
      email?: string;
      phone?: string;
      nickname?: string;
      question?: string;
    }) => submitContactQuestion(payload),
  });
};

export const useUpdateTrainerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      payload: {
        id?: string | number;
        email?: string;
        password?: string;
        first_name?: string;
        last_name?: string;
        acf?: Record<string, unknown>;
      };
      token?: string;
    }) => updateTrainerProfile(params.payload, params.token),
    onSuccess: () => {
      // Інвалідуємо queries для автоматичного оновлення даних
      queryClient.invalidateQueries({ queryKey: ["user-profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["trainer-profile-full"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
    },
  });
};

export const useCreateWcOrder = () => {
  return useMutation({
    mutationFn: (orderData: {
      payment_method: string;
      payment_method_title: string;
      set_paid: boolean;
      billing: {
        first_name: string;
        last_name: string;
        email: string;
        address_1?: string;
        city: string;
        country: string;
      };
      shipping: {
        first_name: string;
        last_name: string;
        address_1?: string;
        city: string;
        country: string;
      };
      line_items: Array<{
        product_id: number;
        quantity: number;
      }>;
      shipping_lines?: Array<{
        method_id: string;
        method_title: string;
        total: string;
      }>;
      customer_note?: string;
    }) => createWcOrder(orderData),
    onSuccess: (data) => {
      console.log("[useCreateWcOrder] ✅ Замовлення створено:", data);
    },
    onError: (error) => {
      console.error("[useCreateWcOrder] ❌ Помилка:", error);
    },
  });
};
