import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Modal } from "@/components/ui/modal";
import type { VerificationState } from "@/types/game.types";

interface ProvablyFairModalProps {
  open: boolean;
  onClose: () => void;
  verification: VerificationState;
}

function StatusBadge({ valid, label }: { valid: boolean; label: string }) {
  return (
    <span
      className={
        valid
          ? "rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300"
          : "rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-300"
      }
    >
      {label}: {valid ? "Valido" : "Invalido"}
    </span>
  );
}

function DataRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-xs">
      <span className="text-muted">{label}</span>
      <span className="break-all font-mono">{value ?? "-"}</span>
    </div>
  );
}

export function ProvablyFairModal({ open, onClose, verification }: ProvablyFairModalProps) {
  const { status, result, apiData, errorMessage } = verification;

  return (
    <Modal open={open} onClose={onClose} title="Verificacao Provably Fair">
      <div className="space-y-4 overflow-y-auto p-4">
        {status === "loading" ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <LoadingSpinner />
            Verificando rodada...
          </div>
        ) : null}

        {status === "error" ? (
          <p className="text-sm text-red-300">{errorMessage ?? "Erro ao verificar rodada."}</p>
        ) : null}

        {apiData ? (
          <div className="space-y-2">
            <DataRow label="Round ID" value={apiData.roundId} />
            <DataRow label="Status" value={apiData.status} />
            <DataRow label="Server seed" value={apiData.serverSeed} />
            <DataRow label="Server seed hash" value={apiData.serverSeedHash} />
            <DataRow label="Client seed" value={apiData.clientSeed} />
            <DataRow label="Nonce" value={apiData.nonce} />
            <DataRow label="Crash point" value={apiData.crashPoint} />
            <DataRow label="Calculado" value={apiData.calculatedCrashPoint} />
          </div>
        ) : null}

        {status === "success" && result ? (
          <div className="flex flex-wrap gap-2">
            <StatusBadge valid={result.hashValid} label="Hash" />
            <StatusBadge valid={result.crashPointValid} label="Crash point" />
            <StatusBadge valid={result.isValid} label="Geral" />
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
