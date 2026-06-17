import { useCallback, useState } from "react";

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1000;

function clampAmount(value: number): number {
  return Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, value));
}

export function useBetAmount() {
  const [amount, setAmountState] = useState(MIN_AMOUNT);

  const increment = useCallback(() => {
    setAmountState((current) => clampAmount(current + 1));
  }, []);

  const decrement = useCallback(() => {
    setAmountState((current) => clampAmount(current - 1));
  }, []);

  const setAmount = useCallback((value: number) => {
    setAmountState(clampAmount(value));
  }, []);

  return { amount, increment, decrement, setAmount };
}
