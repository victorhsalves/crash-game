import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth/auth.service";

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authService.login(username, password);
      await navigate({ to: "/dashboard" });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Falha na autenticacao");
    } finally {
      setIsSubmitting(false);
    }
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

      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
            className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Nao tem conta?{" "}
        <button
          type="button"
          onClick={() => void navigate({ to: "/register" })}
          className="text-primary underline-offset-2 hover:underline"
        >
          Criar conta
        </button>
      </p>
    </div>
  );
}
