import { describe, expect, it } from "vitest";
import { calculateTop30Totals } from "../lib/gmgnData";

const sampleRows = [
  { address: "0x1", buyUsd: 1200, sellUsd: 200 },
  { address: "0x2", buyUsd: 300, sellUsd: 900 },
  { address: "0x3", buyUsd: 500, sellUsd: 100 }
];

describe("calculateTop30Totals", () => {
  it("aggregates total buy, sell, and net flow", () => {
    const totals = calculateTop30Totals(sampleRows);

    expect(totals.totalBuyUsd).toBe(2000);
    expect(totals.totalSellUsd).toBe(1200);
    expect(totals.netUsd).toBe(800);
  });
});
