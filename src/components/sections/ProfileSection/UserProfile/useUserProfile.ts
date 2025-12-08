"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { getMyProfile } from "@/lib/auth";

export function useUserProfile() {
  const authUser = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  // Під час тестування не синхронізуємо з глобальним стором — рендеримо з бекенду
  const [remoteName, setRemoteName] = useState<string>("");
  const [remoteEmail, setRemoteEmail] = useState<string>("");
  const [remoteAvatar, setRemoteAvatar] = useState<string>("");

  const [isReady, setIsReady] = useState(false);

  // Тимчасово відключено читання з localStorage під час тестування

  const displayName = useMemo(() => {
    const raw =
      remoteName ||
      authUser?.displayName ||
      authUser?.nicename ||
      authUser?.id ||
      "Користувач";

    const trimmed = String(raw).replace(/\s+/g, " ").trim();
    const parts = trimmed.split(" ");
    let collapsed = trimmed;
    if (
      parts.length === 2 &&
      parts[0].replace(/!+$/, "") === parts[1].replace(/!+$/, "")
    ) {
      collapsed = parts[0];
    }
    return collapsed.replace(/!+$/, "");
  }, [remoteName, authUser?.displayName, authUser?.nicename, authUser?.id]);

  const email = useMemo(() => {
    return remoteEmail || authUser?.email || "";
  }, [remoteEmail, authUser?.email]);

  const avatar = useMemo(() => {
    return remoteAvatar || authUser?.avatar || "/images/avatar1.png";
  }, [remoteAvatar, authUser?.avatar]);

  useEffect(() => {
    if (isHydrated) {
      const t = setTimeout(() => setIsReady(true), 50);
      return () => clearTimeout(t);
    }
  }, [isHydrated]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!token) return;
        const data = await getMyProfile();
        if (!mounted || !data) return;
        if (process.env.NODE_ENV !== "production") {
          console.log("[useUserProfile] fetched", {
            meta: data?.meta,
            avatar: data?.avatar,
            avatar96: data?.avatar_urls?.["96"],
            topLevelAvatar: (data as unknown as { img_link_data_avatar?: string })
              ?.img_link_data_avatar,
          });
        }
        // SSOT: first_name + last_name має бути головним джерелом імені
        const fullName = `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim();
        const resolvedName = fullName || data?.name || "";
        const resolvedEmail = data?.email || data?.user_email || "";
        const meta = (data?.meta as Record<string, unknown> | undefined) || {};
        const metaValues = Object.values(meta);
        const firstUploadUrl = metaValues.find((v) =>
          typeof v === "string" && v.includes("/wp-content/uploads/")
        ) as string | undefined;

        let topLevelAvatar =
          (data as unknown as { img_link_data_avatar?: string })
            ?.img_link_data_avatar;

        // Якщо бекенд повернув JSON-рядок масиву типу ["https://..."]
        // — витягуємо перший елемент
        if (
          typeof topLevelAvatar === "string" &&
          topLevelAvatar.trim().startsWith("[")
        ) {
          try {
            const parsed = JSON.parse(topLevelAvatar);
            if (Array.isArray(parsed) && typeof parsed[0] === "string") {
              topLevelAvatar = parsed[0];
            }
          } catch {
            // Якщо парсинг не вдався — залишаємо як є
          }
        }

        const serverAvatarCandidate =
          topLevelAvatar ||
          (meta?.["img_link_data_avatar"] as string | undefined) ||
          firstUploadUrl ||
          data?.avatar ||
          data?.avatar_urls?.["96"] ||
          undefined;

        // Якщо сервер повернув порожнє/граватар, а в сторі вже є uploads-URL після аплоаду — залишаємо його
        const clientHasUploads =
          typeof authUser?.avatar === "string" &&
          authUser.avatar.includes("/wp-content/uploads/");
        const hasServerAvatarUrl =
          typeof serverAvatarCandidate === "string" &&
          serverAvatarCandidate.trim().length > 0;

        // Якщо сервер не дав uploads — пробуємо серверний fallback через /api/profile/avatar (адмін-читання)
        if (!hasServerAvatarUrl) {
          try {
            const fallbackRes = await fetch("/api/profile/avatar", {
              method: "GET",
              cache: "no-store",
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (fallbackRes.ok) {
              const j = (await fallbackRes.json()) as { avatar?: string };
              const url = j?.avatar;
              if (typeof url === "string" && url.trim().length > 0) {
                setRemoteName(resolvedName || authUser?.displayName || "");
                setRemoteEmail(resolvedEmail || authUser?.email || "");
                setRemoteAvatar(url);
                return;
              }
            }
          } catch {}
          if (process.env.NODE_ENV !== "production") {
            console.log("[useUserProfile] skip override (no server avatar url)");
          }
          // все одно оновлюємо імʼя/емейл із бекенду
          setRemoteName(resolvedName || authUser?.displayName || "");
          setRemoteEmail(resolvedEmail || authUser?.email || "");
          return;
        }

        // Пріоритет: img_link_data_avatar (top-level/meta) або інший валідний URL з бекенду
        const finalAvatar: string | undefined = serverAvatarCandidate as string;
        if (process.env.NODE_ENV !== "production") {
          console.log("[useUserProfile] resolved avatar", {
            topLevelAvatar,
            metaAvatar: meta?.["img_link_data_avatar"],
            firstUploadUrl,
            avatar: data?.avatar,
            avatar96: data?.avatar_urls?.["96"],
            serverAvatarCandidate,
            hasServerAvatarUrl,
            finalAvatar,
          });
        }
        setRemoteName(resolvedName || authUser?.displayName || "");
        setRemoteEmail(resolvedEmail || authUser?.email || "");
        setRemoteAvatar(finalAvatar || "");
        try {
          if (finalAvatar) {
            const setUser = useAuthStore.getState().setUser;
            setUser({
              id: authUser?.id,
              email: resolvedEmail || authUser?.email,
              nicename: authUser?.nicename,
              displayName: resolvedName || authUser?.displayName,
              avatar: finalAvatar,
            });
          }
        } catch {}
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [
    token,
    authUser?.id,
    authUser?.email,
    authUser?.nicename,
    authUser?.displayName,
    authUser?.avatar,
  ]);

  return { isHydrated, isReady, displayName, email, avatar };
}
