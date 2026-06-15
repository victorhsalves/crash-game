export interface DebitWalletInput {
  readonly walletId: string;
  readonly amountCents: number;
  readonly referenceId?: string | null;
}
