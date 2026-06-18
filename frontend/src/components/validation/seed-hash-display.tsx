import { useCallback, useState } from "react";
import { CheckIcon } from "@/components/icons/check-icon";
import { CopyIcon } from "@/components/icons/copy-icon";

interface SeedHashDisplayProps {
  serverSeedHash: string | null;
  roundStatus: string | null;
}

function truncateHash(hash: string): string {
  return hash.length <= 8 ? hash : `${hash.slice(0, 8)}...`;
}

export function SeedHashDisplay({ serverSeedHash, roundStatus }: SeedHashDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (serverSeedHash === null) {
      return;
    }

    try {
      await navigator.clipboard.writeText(serverSeedHash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [serverSeedHash]);

  if (roundStatus !== "BETTING" && roundStatus !== "RUNNING") {
    return null;
  }

  if (serverSeedHash === null) {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute top-3 left-3 z-10 flex items-center gap-1 py-0.5">
      <span className="font-mono text-xs text-muted" title={serverSeedHash}>
        {truncateHash(serverSeedHash)}
      </span>
      <button
        type="button"
        className={`rounded p-1 text-muted transition-colors hover:text-foreground ${copied ? "text-primary" : ""}`}
        onClick={() => void handleCopy()}
        aria-label="Copiar seed hash"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}
