import { apiRequest } from "./http.helper";
import { E2E_CONFIG } from "./config";

export interface WalletDto {
  id: string;
  playerId: string;
  balance: string;
  createdAt: string;
}

export async function getWallet(token: string): Promise<WalletDto | null> {
  const response = await apiRequest<WalletDto>("/wallets/me", { token });

  if (response.status === 404) {
    return null;
  }

  if (response.status !== 200) {
    throw new Error(`Failed to get wallet: ${response.status} ${JSON.stringify(response.data)}`);
  }

  return response.data;
}

export async function createWallet(token: string): Promise<WalletDto> {
  const response = await apiRequest<WalletDto>("/wallets", {
    method: "POST",
    token,
  });

  if (response.status === 201) {
    return response.data;
  }

  if (response.status === 409) {
    const existing = await getWallet(token);

    if (existing === null) {
      throw new Error("Wallet already exists but could not be retrieved");
    }

    return existing;
  }

  throw new Error(`Failed to create wallet: ${response.status} ${JSON.stringify(response.data)}`);
}

export async function creditWallet(walletId: string, amountCents: number, referenceId?: string): Promise<void> {
  const response = await apiRequest("/wallets/credit", {
    method: "POST",
    body: {
      walletId,
      amountCents,
      referenceId: referenceId ?? `e2e-credit-${crypto.randomUUID()}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Failed to credit wallet: ${response.status} ${JSON.stringify(response.data)}`);
  }
}

export async function debitWallet(walletId: string, amountCents: number, referenceId?: string): Promise<void> {
  const response = await apiRequest("/wallets/debit", {
    method: "POST",
    body: {
      walletId,
      amountCents,
      referenceId: referenceId ?? `e2e-debit-${crypto.randomUUID()}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Failed to debit wallet: ${response.status} ${JSON.stringify(response.data)}`);
  }
}

export async function ensureWalletBalance(token: string, targetBalanceCents: number): Promise<WalletDto> {
  let wallet = await createWallet(token);
  let currentBalance = parseBalanceCents(wallet);
  const targetBalance = BigInt(targetBalanceCents);

  if (currentBalance > targetBalance) {
    await debitWallet(wallet.id, Number(currentBalance - targetBalance), `e2e-reset-debit-${crypto.randomUUID()}`);
  } else if (currentBalance < targetBalance) {
    await creditWallet(wallet.id, Number(targetBalance - currentBalance), `e2e-reset-credit-${crypto.randomUUID()}`);
  }

  wallet = (await getWallet(token))!;

  return wallet;
}

export async function setupWallet(token: string, targetBalanceCents: number): Promise<WalletDto> {
  return ensureWalletBalance(token, targetBalanceCents);
}

export function parseBalanceCents(wallet: WalletDto): bigint {
  return BigInt(wallet.balance);
}

export async function waitForWalletBalance(
  token: string,
  predicate: (balance: bigint) => boolean,
  timeoutMs: number = E2E_CONFIG.defaultTimeoutMs,
): Promise<WalletDto> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const wallet = await getWallet(token);

    if (wallet !== null && predicate(parseBalanceCents(wallet))) {
      return wallet;
    }

    await new Promise((resolve) => setTimeout(resolve, E2E_CONFIG.pollIntervalMs));
  }

  throw new Error("Timed out waiting for wallet balance condition");
}
