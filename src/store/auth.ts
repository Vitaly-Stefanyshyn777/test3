import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginApi, getMyProfile } from "@/lib/auth";
import { useCartStore } from "./cart";
import { useFavoriteStore } from "./favorites";

const initial = {
  token: null,
  user: null,
  isLoggedIn: false,
  isHydrated: false,
};

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
  isLoginModalOpen: boolean;
  setAuth: (token: string, user?: AuthUser | null) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
  checkTokenValidity: () => Promise<boolean>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

function saveTokenToStorage(token: string) {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("bfb_token", token);
    localStorage.setItem("bfb_token_old", token);
  }
}

function loadUserData(userId: string) {
  const cartStore = useCartStore.getState();
  const favoriteStore = useFavoriteStore.getState();

  const tokenInStorage =
    typeof window !== "undefined" &&
    (localStorage.getItem("bfb_token") || localStorage.getItem("bfb_token_old"));

  if (!tokenInStorage) return;

  setTimeout(async () => {
    try {
      await cartStore.loadUserData(userId);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await favoriteStore.loadUserData(userId);
    } catch (err) {
      // Silently handle errors
    }
  }, 200);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: initial.user,
      token: initial.token,
      isLoggedIn: initial.isLoggedIn,
      isHydrated: initial.isHydrated,
      isLoginModalOpen: false,

      setAuth: (token: string, user: AuthUser | null = null) => {
        saveTokenToStorage(token);
        set({ token, user, isLoggedIn: true });

        if (user?.id) {
          loadUserData(user.id);
        }
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

          const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
          const resolvedName = fullName || profile?.name || "";
          const resolvedEmail = profile?.email || profile?.user_email || user?.email;

          let previousSavedAvatar: string | undefined;
          try {
            const raw = localStorage.getItem("bfb_user");
            if (raw) {
              previousSavedAvatar = (JSON.parse(raw) as AuthUser | null)?.avatar || undefined;
            }
          } catch {}

          const nextUser: AuthUser = {
            id: String(profile?.id || user?.id || ""),
            email: resolvedEmail,
            nicename: profile?.slug || user?.nicename,
            displayName: resolvedName || user?.displayName,
            avatar: (() => {
              const metaAvatar = profile?.meta?.img_link_data_avatar;
              const anyAvatar = profile?.avatar;
              const avatar96 = profile?.avatar_urls?.["96"];

              const serverCandidate = metaAvatar || anyAvatar || avatar96 || undefined;
              const serverHasUploads =
                typeof serverCandidate === "string" &&
                serverCandidate.includes("/wp-content/uploads/");
              const clientHasUploads =
                typeof user?.avatar === "string" && user.avatar.includes("/wp-content/uploads/");

              if (!serverHasUploads && clientHasUploads) {
                return user!.avatar;
              }

              return serverCandidate || user?.avatar || previousSavedAvatar;
            })(),
          };

          set({ user: nextUser, isLoggedIn: true });
          saveTokenToStorage(token);

          if (nextUser?.id) {
            loadUserData(nextUser.id);
          }

          return true;
        } catch {
          return true;
        }
      },

      login: async (credentials) => {
        try {
          const data = await loginApi(credentials);

          if (typeof window !== "undefined" && data.token) {
            saveTokenToStorage(data.token);
            await fetch("/api/set-user-cookie", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: data.token }),
            }).catch(() => {});
          }

          const user = {
            id: data.user_nicename,
            email: data.user_email,
            displayName: data.user_display_name,
          };

          set({ user, token: data.token, isLoggedIn: true });

          let numericId: string | undefined;
          try {
            const me = await getMyProfile(data.token);
            if (me?.id) {
              numericId = String(me.id);
              set({ user: { ...user, id: numericId } });
            }
          } catch {}

          const finalUserId = numericId || user.id;
          if (finalUserId) {
            loadUserData(finalUserId);
          }
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        const { user } = get();
        const userId = user?.id;

        const cartStore = useCartStore.getState();
        const favoriteStore = useFavoriteStore.getState();

        cartStore.close();
        favoriteStore.close();

        if (userId) {
          cartStore.setUserId(userId);
          favoriteStore.setUserId(userId);
        }

        cartStore.loadUserData(null).catch(() => {});
        favoriteStore.loadUserData(null).catch(() => {});

        set({ user: null, token: null, isLoggedIn: false });

        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("bfb_token");
            localStorage.removeItem("bfb_token_old");
            localStorage.removeItem("wp_jwt");
            localStorage.removeItem("wp_jwt_override");
            localStorage.removeItem("bfb-auth");
            localStorage.removeItem("bfb_user");
            localStorage.removeItem("trainer_certificates_preview");
            localStorage.removeItem("orderData");
            localStorage.removeItem("userLocationConfirmed");
            localStorage.removeItem("userLocation");
          } catch (error) {
          }
        }

        try {
          await fetch("/api/set-user-cookie", { method: "DELETE" });
        } catch {}
      },

      openLoginModal: () => set({ isLoginModalOpen: true }),
      closeLoginModal: () => set({ isLoginModalOpen: false }),
    }),
    {
      name: "bfb-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== "undefined") {
          localStorage.setItem("bfb_token", state.token);
        }
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);
