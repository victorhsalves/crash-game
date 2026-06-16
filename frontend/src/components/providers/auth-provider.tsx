import { useEffect } from "react";
import { authService } from "@/services/auth/auth.service";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    void authService.initialize();
  }, []);

  return children;
}
