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
    <div className="animate-popup-in flex min-w-[7.5rem] flex-col items-center rounded-xl border-2 border-primary bg-surface/90 px-4 py-2 shadow-lg backdrop-blur-sm sm:min-w-[8.5rem] sm:px-6 sm:py-3">
      <span className="text-sm text-muted">Cashout</span>
      <div className="font-mono text-lg font-semibold text-primary sm:text-xl">
        {isLoading || multiplier === null ? "Sacando..." : formatMultiplier(multiplier)}
      </div>
    </div>
  );
}
