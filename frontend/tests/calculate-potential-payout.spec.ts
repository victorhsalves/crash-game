import { describe, expect, test } from "bun:test";
import { calculatePotentialPayoutReais } from "../src/utils/calculate-potential-payout";

describe("calculatePotentialPayoutReais", () => {
  test("computes payout for 1000 cents at 2.50x", () => {
    expect(calculatePotentialPayoutReais(1000, 2.5)).toBe(25);
  });

  test("computes payout for 100 cents at 1.01x", () => {
    expect(calculatePotentialPayoutReais(100, 1.01)).toBe(1.01);
  });

  test("computes payout for 1000 cents at 2.51x", () => {
    expect(calculatePotentialPayoutReais(1000, 2.51)).toBe(25.1);
  });

  test("computes payout for 100_000 cents at 10.00x", () => {
    expect(calculatePotentialPayoutReais(100_000, 10)).toBe(10_000);
  });

  test("floors fractional cents", () => {
    expect(calculatePotentialPayoutReais(333, 1.333)).toBe(4.42);
  });
});
