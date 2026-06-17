import { PlayerMenu } from "@/components/layout/player-menu";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-primary">Crash Game</h1>
        <PlayerMenu />
      </div>
    </header>
  );
}
