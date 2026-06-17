import type { BetPlacedPayload } from "@crash/messaging";

export interface ProcessBetPlacedInput {
  readonly payload: BetPlacedPayload;
}
