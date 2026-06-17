import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
