import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { to: "/dashboard" as const, label: "Dashboard", shortLabel: "Dash" },
  { to: "/crash-game" as const, label: "Crash Game", shortLabel: "Crash" },
];

export function AppNav() {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  return (
    <nav className="flex items-center gap-1 sm:gap-2" aria-label="Navegacao principal">
      {navLinks.map(({ to, label, shortLabel }) => (
        <Link
          key={to}
          to={to}
          className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground sm:px-3 sm:py-2 sm:text-sm"
          activeProps={{
            className:
              "rounded-lg bg-surface-hover px-2 py-1.5 text-xs font-medium text-primary sm:px-3 sm:py-2 sm:text-sm",
          }}
        >
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
