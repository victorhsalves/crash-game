export interface CreditWalletInput {
  readonly walletId: string;
  readonly amountCents: number;
  readonly referenceId?: string | null;
}
