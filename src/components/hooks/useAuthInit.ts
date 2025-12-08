import { useEffect } from "react";
import { useAuthStore } from "../../store/auth";

export const useAuthInit = () => {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    const timer = setTimeout(() => {
      initAuth();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [initAuth]);
};
