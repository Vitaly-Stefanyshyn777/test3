import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginApi, getMyProfile } from "../lib/auth";

function readInitialAuth(): {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  isHydrated: boolean;
} {
  return { token: null, user: null, isLoggedIn: false, isHydrated: false };
}
const initial = readInitialAuth();

export interface AuthUser {
  id?: string;
  email?: string;
  nicename?: string;
  displayName?: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isHydrated: boolean;
  setAuth: (token: string, user?: AuthUser | null) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
  checkTokenValidity: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: initial.user,
      token: initial.token,
      isLoggedIn: initial.isLoggedIn,
      isHydrated: initial.isHydrated,

      setAuth: (token: string, user: AuthUser | null = null) => {
        set({ token, user, isLoggedIn: true });
      },

      setUser: (user: AuthUser | null) => {
        set({ user });
      },

      clear: () => {
        set({ token: null, user: null, isLoggedIn: false });
      },

      initAuth: () => {
        set({ isHydrated: true });
      },

      checkTokenValidity: async () => {
        const { token, user } = get();

        if (!token) {
          return false;
        }

        try {
          type UserProfile = {
            id?: number | string;
            name?: string;
            first_name?: string;
            last_name?: string;
            email?: string;
            user_email?: string;
            slug?: string;
            meta?: { img_link_data_avatar?: string } | null;
            avatar?: string;
            avatar_urls?: Record<string, string>;
          };

          const profile = (await getMyProfile()) as UserProfile | null;

          if (!profile) {
            return false;
          }

          // SSOT: first_name + last_name має бути головним джерелом імені
          const fullName = `${profile?.first_name ?? ""} ${
            profile?.last_name ?? ""
          }`.trim();
          const resolvedName = fullName || profile?.name || "";
          const resolvedEmail =
            profile?.email || profile?.user_email || user?.email;

          // Зберігаємо попередній avatar навіть якщо стор ще порожній (беремо з localStorage)
          let previousSavedAvatar: string | undefined;
          try {
            const raw = localStorage.getItem("bfb_user");
            if (raw) {
              previousSavedAvatar =
                (JSON.parse(raw) as AuthUser | null)?.avatar || undefined;
            }
          } catch {}

          const nextUser: AuthUser = {
            id: String(profile?.id || user?.id || ""),
            email: resolvedEmail,
            nicename: profile?.slug || user?.nicename,
            displayName: resolvedName || user?.displayName,
            // Пріоритет на клієнті: meta.img_link_data_avatar → avatar → avatar_urls["96"] → попередній user.avatar
            // Додатково: не перезаписуємо клієнтський uploads-URL, якщо сервер повертає порожнє/граватар
            avatar: (() => {
              const metaAvatar = profile?.meta?.img_link_data_avatar;
              const anyAvatar = profile?.avatar;
              const avatar96 = profile?.avatar_urls?.["96"];

              const serverCandidate =
                metaAvatar || anyAvatar || avatar96 || undefined;
              const serverHasUploads =
                typeof serverCandidate === "string" &&
                serverCandidate.includes("/wp-content/uploads/");
              const clientHasUploads =
                typeof user?.avatar === "string" &&
                user.avatar.includes("/wp-content/uploads/");

              if (!serverHasUploads && clientHasUploads) {
                return user!.avatar;
              }

              return serverCandidate || user?.avatar || previousSavedAvatar;
            })(),
          };

          set({ user: nextUser, isLoggedIn: true });
          return true;
        } catch {
          return true;
        }
      },

      login: async (credentials) => {
        try {
          const data = await loginApi(credentials);

          // Після логіну одразу отримуємо числовий id через /users/me
          let numericId: string | undefined;
          try {
            const me = await getMyProfile();
            if (me?.id) numericId = String(me.id);
          } catch {}

          const user = {
            id: numericId || data.user_nicename,
            email: data.user_email,
            displayName: data.user_display_name,
          };

          set({ user, token: data.token, isLoggedIn: true });
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        set({ user: null, token: null, isLoggedIn: false });
        try {
          await fetch("/api/set-user-cookie", { method: "DELETE" });
        } catch {}
      },
    }),
    {
      name: "bfb-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);
