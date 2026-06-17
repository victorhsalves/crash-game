import { WalletIcon } from "@/components/icons/wallet-icon";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { formatCurrencyFromCents } from "@/utils/format-currency";

export function WalletBar() {
  const { isAuthenticated, isInitialized } = useAuth();
  const walletQuery = useWallet();

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  const balanceLabel = walletQuery.isLoading
    ? "—"
    : walletQuery.data
      ? formatCurrencyFromCents(walletQuery.data.balance)
      : "—";

  return (
    <div className="shrink-0 border-b border-border px-4 py-3">
      <div className="inline-flex items-center gap-2.5 rounded-lg border border-primary px-4 py-2 text-base font-medium text-white">
        <WalletIcon className="h-7 w-7 text-primary" />
        <span>{balanceLabel}</span>
      </div>
    </div>
  );
}
