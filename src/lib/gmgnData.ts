export type AddressFlow = {
  address: string;
  buyUsd: number;
  sellUsd: number;
};

export type FlowTotals = {
  totalBuyUsd: number;
  totalSellUsd: number;
  netUsd: number;
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const pickFirst = <T>(...values: T[]): T | undefined =>
  values.find((value) => value !== undefined);

const pickAddress = (row: Record<string, unknown>): string => {
  const value = pickFirst(
    row.address,
    row.holder,
    row.wallet,
    row.owner,
    row.account
  );
  return typeof value === "string" ? value : "";
};

const pickBuyUsd = (row: Record<string, unknown>): number =>
  toNumber(
    pickFirst(
      row.buyUsd,
      row.buy_usd,
      row.buyAmountUsd,
      row.buy_amount_usd,
      row.buy
    )
  );

const pickSellUsd = (row: Record<string, unknown>): number =>
  toNumber(
    pickFirst(
      row.sellUsd,
      row.sell_usd,
      row.sellAmountUsd,
      row.sell_amount_usd,
      row.sell
    )
  );

const extractRows = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const record = payload as Record<string, unknown>;
  return (
    extractRows(record.data) ||
    extractRows(record.items) ||
    extractRows(record.list) ||
    extractRows(record.rows) ||
    []
  );
};

export const normalizeAddressFlows = (payload: unknown): AddressFlow[] => {
  const rows = extractRows(payload);
  return rows
    .filter((row): row is Record<string, unknown> =>
      Boolean(row && typeof row === "object")
    )
    .map((row) => ({
      address: pickAddress(row),
      buyUsd: pickBuyUsd(row),
      sellUsd: pickSellUsd(row)
    }))
    .filter((row) => row.address.length > 0)
    .slice(0, 30);
};

export const calculateTop30Totals = (rows: AddressFlow[]): FlowTotals => {
  const totals = rows.reduce(
    (acc, row) => {
      acc.totalBuyUsd += row.buyUsd;
      acc.totalSellUsd += row.sellUsd;
      return acc;
    },
    { totalBuyUsd: 0, totalSellUsd: 0, netUsd: 0 }
  );

  totals.netUsd = totals.totalBuyUsd - totals.totalSellUsd;
  return totals;
};
