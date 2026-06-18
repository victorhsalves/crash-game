import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <main className="mx-auto flex w-full min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 md:max-w-4xl">
        {children}
      </main>
    </div>
  );
}
