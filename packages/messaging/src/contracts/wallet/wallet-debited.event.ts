import { WALLET_DEBITED } from "../routing-keys";

export { WALLET_DEBITED };

export interface WalletDebitedPayload {
  readonly betId: string;
}
