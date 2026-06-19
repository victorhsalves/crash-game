export function resolveInitialWalletBalanceCents(): bigint {
  return BigInt(process.env.INITIAL_WALLET_BALANCE_CENTS ?? "2000");
}

export const INITIAL_WALLET_BALANCE_CENTS = resolveInitialWalletBalanceCents();

export const INITIAL_BALANCE_REFERENCE_ID = "initial-balance";
