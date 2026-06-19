import { useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth/auth.service";

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const search = useSearch({ from: "/" });

  if (isAuthenticated) {
    return null;
  }

  function handleLogin() {
    void authService.loginRedirect();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-12 sm:py-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Bem-vindo ao Crash Game</h2>
        <p className="mt-2 text-muted">Faca login para acessar sua conta e carteira.</p>
      </div>

      {search.session_expired ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          Sua sessao expirou. Faca login novamente.
        </p>
      ) : null}

      {search.auth_error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {search.auth_error}
        </p>
      ) : null}

      <Button type="button" onClick={handleLogin}>
        Entrar com Keycloak
      </Button>

      <p className="text-center text-sm text-muted">
        Usuario de teste: <span className="text-foreground">player</span> /{" "}
        <span className="text-foreground">player123</span>
      </p>
    </div>
  );
}
