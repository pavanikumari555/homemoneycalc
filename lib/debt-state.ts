export interface DebtRow { name: string; balance: string; rate: string; min: string }
export const MAX_DEBT_ROWS = 15;
export const MAX_DEBT_STATE_LENGTH = 4096;

export const encodeDebtRows = (rows: DebtRow[]) => rows.map(r =>
  [r.name.replace(/[~|]/g, " ").slice(0, 30), r.balance, r.rate, r.min].join("~")).join("|");

/** Reject corrupt/oversized lists as a whole, rather than silently losing rows. */
export function decodeDebtRows(value: string): DebtRow[] | null {
  if (!value || value.length > MAX_DEBT_STATE_LENGTH) return null;
  const parts = value.split("|").map(p => p.split("~"));
  if (parts.length > MAX_DEBT_ROWS || parts.some(p => p.length !== 4 || p[0].length > 30 ||
      p.slice(1).some(n => n.length > 40 || (n.trim() !== "" && !Number.isFinite(Number(n)))))) return null;
  return parts.map(([name, balance, rate, min]) => ({ name, balance, rate, min }));
}
