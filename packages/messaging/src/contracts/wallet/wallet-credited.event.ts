import { WALLET_CREDITED } from "../routing-keys";

export { WALLET_CREDITED };

export interface WalletCreditedPayload {
  readonly betId: string;
}
