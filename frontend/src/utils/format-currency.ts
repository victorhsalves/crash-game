export function formatCurrencyFromCents(cents: string): string {
  const value = Number(cents) / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
