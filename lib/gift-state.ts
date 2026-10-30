export interface GiftInputRow { name: string; amount: string }
export const MAX_GIFT_STATE_LENGTH = 512;
export const cleanGiftName = (s: string) => s.replace(/[~|]/g, " ").slice(0, 12);
export const cleanGiftAmount = (s: string) => {
  if (!s.trim()) return "";
  const value=Number(s);
  return Number.isFinite(value) ? String(Math.min(10_000_000,Math.max(0,value))) : "";
};
export const encodeGiftRows = (rows: GiftInputRow[]) => rows.map(r => [cleanGiftName(r.name),cleanGiftAmount(r.amount)].join("~")).join("|");
export function validGiftState(value: string) {
  if (value === "") return true;
  const rows=value.split("|").map(r=>r.split("~"));
  return value.length<=MAX_GIFT_STATE_LENGTH && rows.length<=10 && rows.every(r=>r.length===2 && r[0].length<=12 && r[1].length<=24 && (r[1]==="" || (Number.isFinite(Number(r[1])) && Number(r[1])>=0 && Number(r[1])<=10_000_000)));
}
