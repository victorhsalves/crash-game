import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { defaultHomeSearch } from "@/router/search";
import { authApi } from "@/services/auth/auth.api";
import { authService } from "@/services/auth/auth.service";
import { ApiError } from "@/services/api/api-error";

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.register({ username, email, password });
      await authService.login(username, password);
      await navigate({ to: "/dashboard" });
    } catch (registerError) {
      if (registerError instanceof ApiError && registerError.status === 409) {
        setError("Usuario ou email ja existe.");
        return;
      }

      setError(
        registerError instanceof Error ? registerError.message : "Falha ao criar conta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-12 sm:py-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Criar conta</h2>
        <p className="mt-2 text-muted">Preencha os dados para comecar a jogar.</p>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
            minLength={3}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
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
            autoComplete="new-password"
            required
            minLength={8}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Confirmar password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-primary"
          />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Ja tem conta?{" "}
        <button
          type="button"
          onClick={() => void navigate({ to: "/", search: defaultHomeSearch })}
          className="text-primary underline-offset-2 hover:underline"
        >
          Entrar
        </button>
      </p>
    </div>
  );
}
