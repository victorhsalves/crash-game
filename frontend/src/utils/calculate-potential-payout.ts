export function calculatePotentialPayoutReais(
  amountCents: number,
  multiplier: number,
): number {
  const basisPoints = Math.round(multiplier * 100);
  return Math.floor((amountCents * basisPoints) / 100) / 100;
}
