import logoCrashGame from "@/assets/logo-crash-game.png";
import { PlayerMenu } from "@/components/layout/player-menu";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <div className="flex h-10 w-[250px] shrink-0 items-center justify-center overflow-hidden">
          <img
            src={logoCrashGame}
            alt="Crash Game"
            className="w-[100px] max-w-none"
          />
        </div>
        <PlayerMenu />
      </div>
    </header>
  );
}
