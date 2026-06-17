import type { DebitFailureReason } from "./debit-failure-reason.enum";
import { WALLET_DEBIT_FAILED } from "../routing-keys";

export { WALLET_DEBIT_FAILED };

export interface WalletDebitFailedPayload {
  readonly betId: string;
  readonly reason: DebitFailureReason;
}
