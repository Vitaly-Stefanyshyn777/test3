import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  login,
  register,
  refresh,
  submitTrainerApplication,
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
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      return login(credentials);
    },
    onSuccess: (data) => {
      const user = {
        id: data.user_nicename,
        email: data.user_email,
        displayName: data.user_display_name,
      };

      setAuth(data.token, user);
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
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
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => {
      return register(credentials);
    },
    onSuccess: (data) => {
      const user = {
        id: data.id.toString(),
        email: data.email || "",
        displayName: data.name,
      };
      setAuth("", user);
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach"] });
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
