import { CashoutPopup } from "@/components/validation/cashout-popup";
import { BetStakeDisplay } from "@/components/validation/bet-stake-display";
import { CrashLineChart } from "@/components/validation/crash-line-chart";
import { MultiplierDisplay } from "@/components/validation/multiplier-display";
import { RoundBetsPanel } from "@/components/validation/round-bets-panel";
import { SeedHashDisplay } from "@/components/validation/seed-hash-display";
import type { BetStatus, CrashChartPhase, CrashCurvePoint, GameRoundStatus, RoundBetListItem } from "@/types/game.types";

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
  roundBets: RoundBetListItem[];
  roundBetsLoading: boolean;
  currentUsername?: string;
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
  roundBets,
  roundBetsLoading,
  currentUsername,
}: CrashGameStageProps) {
  const showBetStake = betAmountCents !== null && betStatus !== null;

  return (
    <div className="relative min-h-0 flex-1 border-b border-border">
      <CrashLineChart points={curvePoints} phase={chartPhase} roundStatus={roundStatus} />
      <SeedHashDisplay serverSeedHash={serverSeedHash} roundStatus={roundStatus} />
      <RoundBetsPanel
        bets={roundBets}
        currentUsername={currentUsername}
        roundStatus={roundStatus}
        serverSeedHash={serverSeedHash}
        isLoading={roundBetsLoading}
      />

      <div className="relative z-[2] flex h-full items-center justify-center">
        <MultiplierDisplay value={multiplier} status={roundStatus} />
      </div>

      {showBetStake || isCashoutPopupOpen ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4 sm:bottom-6">
          <div className="flex flex-row flex-wrap items-stretch justify-center gap-2 sm:gap-3">
            {showBetStake ? (
              <BetStakeDisplay
                amountCents={betAmountCents}
                roundStatus={roundStatus}
                betStatus={betStatus}
                payout={betPayout}
              />
            ) : null}
            {isCashoutPopupOpen ? (
              <CashoutPopup
                isOpen={isCashoutPopupOpen}
                isLoading={isCashingOut && cashoutMultiplier === null}
                multiplier={cashoutMultiplier}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
