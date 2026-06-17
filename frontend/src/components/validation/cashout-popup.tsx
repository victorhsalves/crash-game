import { formatMultiplier } from "@/utils/format-multiplier";

interface CashoutPopupProps {
  isOpen: boolean;
  isLoading: boolean;
  multiplier: number | null;
}

export function CashoutPopup({ isOpen, isLoading, multiplier }: CashoutPopupProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center animate-popup-in rounded-xl border border-primary bg-surface/90 px-5 py-3 shadow-lg backdrop-blur-sm">
      <span className="text-sm text-muted">Cashout</span>
      <div className="font-mono text-2xl font-bold text-primary">
        {isLoading || multiplier === null ? "Sacando..." : formatMultiplier(multiplier)}
      </div>
    </div>
  );
}
