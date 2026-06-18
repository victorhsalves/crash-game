import { Link } from "@tanstack/react-router";
import logoCrashGame from "@/assets/logo-crash-game.png";
import { AppNav } from "@/components/layout/app-nav";
import { PlayerMenu } from "@/components/layout/player-menu";

export function AppHeader() {
  return (
    <header className="shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link to="/dashboard" className="shrink-0">
          <img
            src={logoCrashGame}
            alt="Crash Game"
            className="w-20 h-10 max-w-none sm:w-[100px]"
          />
        </Link>
        <AppNav />
        <PlayerMenu />
      </div>
    </header>
  );
}
