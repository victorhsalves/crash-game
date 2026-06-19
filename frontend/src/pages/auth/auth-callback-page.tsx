import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { emptyHomeSearch } from "@/router/search";
import { authService } from "@/services/auth/auth.service";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/callback" });

  useEffect(() => {
    async function processCallback() {
      if (search.error) {
        const message =
          search.error === "access_denied"
            ? "Login cancelado."
            : search.error_description ?? "Falha na autenticacao.";

        await navigate({ to: "/", search: { ...emptyHomeSearch, auth_error: message } });
        return;
      }

      if (!search.code || !search.state) {
        await navigate({
          to: "/",
          search: { ...emptyHomeSearch, auth_error: "Resposta de autenticacao invalida." },
        });
        return;
      }

      try {
        const returnTo = await authService.handleCallback(search.code, search.state);
        await navigate({ to: returnTo });
      } catch (callbackError) {
        const message =
          callbackError instanceof Error
            ? callbackError.message
            : "Falha na autenticacao.";

        await navigate({ to: "/", search: { ...emptyHomeSearch, auth_error: message } });
      }
    }

    void processCallback();
  }, [navigate, search.code, search.error, search.error_description, search.state]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
