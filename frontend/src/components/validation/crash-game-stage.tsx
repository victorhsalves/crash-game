import { CashoutPopup } from "@/components/validation/cashout-popup";
import { BetStakeDisplay } from "@/components/validation/bet-stake-display";
import { CrashLineChart } from "@/components/validation/crash-line-chart";
import { MultiplierDisplay } from "@/components/validation/multiplier-display";
import { SeedHashDisplay } from "@/components/validation/seed-hash-display";
import type { BetStatus, CrashChartPhase, CrashCurvePoint, GameRoundStatus } from "@/types/game.types";

interface CrashGameStageProps {
  multiplier: number;
  roundStatus: GameRoundStatus | null;
  serverSeedHash: string | null;
  curvePoints: CrashCurvePoint[];
  chartPhase: CrashChartPhase;
  isCashoutPopupOpen: boolean;
  isCashingOut: boolean;
  cashoutMultiplier: number | null;
  betAmountCents: number | null;
  betStatus: BetStatus | null;
  betPayout: number | null;
}

export function CrashGameStage({
  multiplier,
  roundStatus,
  serverSeedHash,
  curvePoints,
  chartPhase,
  isCashoutPopupOpen,
  isCashingOut,
  cashoutMultiplier,
  betAmountCents,
  betStatus,
  betPayout,
}: CrashGameStageProps) {
  const showBetStake = betAmountCents !== null && betStatus !== null;

  return (
    <div className="relative min-h-0 flex-1 border-b border-border">
      <CrashLineChart points={curvePoints} phase={chartPhase} roundStatus={roundStatus} />
      <SeedHashDisplay serverSeedHash={serverSeedHash} roundStatus={roundStatus} />

      <div className="relative z-[2] flex h-full items-center justify-center">
        <MultiplierDisplay value={multiplier} status={roundStatus} />
      </div>

      {isCashoutPopupOpen ? (
        <div className="pointer-events-none absolute inset-x-0 top-[5%] z-10 flex justify-center px-4">
          <CashoutPopup
            isOpen={isCashoutPopupOpen}
            isLoading={isCashingOut && cashoutMultiplier === null}
            multiplier={cashoutMultiplier}
          />
        </div>
      ) : null}

      {showBetStake ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
          <BetStakeDisplay
            amountCents={betAmountCents}
            roundStatus={roundStatus}
            betStatus={betStatus}
            payout={betPayout}
          />
        </div>
      ) : null}
    </div>
  );
}
