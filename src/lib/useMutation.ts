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

// Тип відповіді від кастомного ендпоінту реєстрації
type CustomRegisterResponse = {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      roles?: string[];
      meta?: Record<string, unknown>;
    };
    certificate?: {
      [key: string]: unknown;
    };
    token?: string;
  };
};
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
            queryClient.setQueryData(
              ["user-profile", "me", data.token],
              profile
            );
            queryClient.setQueryData(["user-profile", "me", null], profile);
            queryClient.setQueryData(["user-profile", "me"], profile);
          }

          // Викликаємо refetch для оновлення компонентів (після setQueryData)
          queryClient.refetchQueries({ queryKey: ["user-profile", "me"] });
        } catch (error) {
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

  return useMutation<CustomRegisterResponse, unknown, RegisterCredentials>({
    mutationFn: async (
      credentials: RegisterCredentials
    ): Promise<CustomRegisterResponse> => {
      // Викликаємо register і явно кастуємо результат до CustomRegisterResponse
      // TypeScript може не бачити оновлену сигнатуру, тому використовуємо unknown як проміжний тип
      const result = (await register(
        credentials
      )) as unknown as CustomRegisterResponse;
      return result;
    },
    onSuccess: async (data, variables) => {
      // Кастомний ендпоінт повертає структуру { success, message, data: { user, certificate } }
      const userData = data.data.user;

      // Перевіряємо, чи є токен у відповіді від кастомного ендпоінту
      let authToken: string | null = data.data.token || null;

      // Якщо токену немає в відповіді, робимо автоматичний login
      if (!authToken) {
        try {
          const loginResponse = await login({
            username: variables.email, // Використовуємо email як username
            password: variables.password,
          });
          authToken = loginResponse.token;
        } catch (loginError) {
          // Якщо авторизація не вдалася, встановлюємо користувача без токену
          const user = {
            id: userData.id.toString(),
            email: userData.email || variables.email,
            displayName:
              userData.name ||
              `${variables.first_name} ${variables.last_name}`.trim(),
          };
          setAuth("", user);
          throw loginError;
        }
      }

      // Отримуємо числовий id через /users/me
      let numericId: string | undefined;
      try {
        const me = await getMyProfile(authToken);
        if (me?.id) numericId = String(me.id);
      } catch {}

      const user = {
        id: numericId || userData.id.toString(),
        email: userData.email || variables.email,
        displayName:
          userData.name ||
          `${variables.first_name} ${variables.last_name}`.trim(),
      };

      // При реєстрації нового користувача завжди очищаємо кеш
      const newUserId = user.id;
      const oldUserId = currentUser?.id;
      if (oldUserId && newUserId && oldUserId !== newUserId) {
        queryClient.clear();
      } else if (!oldUserId) {
        queryClient.clear();
      }

      // Встановлюємо авторизацію з токеном
      setAuth(authToken, user);

      // Інвалідуємо queries для оновлення даних
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
      queryClient.invalidateQueries({ queryKey: ["trainer-profile-full"] });

      // Завантажуємо профіль після авторизації (як у useLogin)
      setTimeout(async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const profile = await getMyProfile(authToken);
          if (profile) {
            queryClient.setQueryData(
              ["user-profile", "me", authToken],
              profile
            );
            queryClient.setQueryData(["user-profile", "me", null], profile);
            queryClient.setQueryData(["user-profile", "me"], profile);
            queryClient.refetchQueries({ queryKey: ["user-profile", "me"] });
          }
        } catch (error) {
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
    },
    onError: (error) => {
    },
  });
};
