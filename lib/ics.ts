// ============================================================================
// CALENDAR FILES (.ics) — user ek click me reminder apne Google/Apple/Outlook calendar
// me daal leta hai. Reminder aata hai -> user site pe wapas. Koi server/email nahi.
// ============================================================================

export interface IcsEvent {
  uid: string;
  title: string;
  date: string; // YYYY-MM-DD (all-day event)
  description?: string;
  url?: string;
  monthly?: boolean; // har mahine repeat
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);
const compact = (d: string) => d.replace(/-/g, "");

function nextDay(d: string): string {
  const t = new Date(`${d}T12:00:00Z`);
  t.setUTCDate(t.getUTCDate() + 1);
  return t.toISOString().slice(0, 10);
}

export function buildIcs(events: IcsEvent[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//HomeMoney Calc//Reminders//EN", "CALSCALE:GREGORIAN"];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@homemoneycalc.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(e.date)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(e.date))}`,
      `SUMMARY:${esc(e.title)}`,
      ...(e.description ? [`DESCRIPTION:${esc(e.description)}`] : []),
      ...(e.url ? [`URL:${e.url}`] : []),
      ...(e.monthly ? ["RRULE:FREQ=MONTHLY"] : []),
      // Reminder: event se ek din pehle subah ~9 baje (all-day start 00:00 se 15 ghante pehle)
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(e.title)}`,
      "TRIGGER:-PT15H",
      "END:VALARM",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, events: IcsEvent[]) {
  const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Agle mahine ki 1 tarikh (YYYY-MM-DD) — monthly check-in reminder isi se shuru. */
export function firstOfNextMonth(from = new Date()): string {
  const d = new Date(Date.UTC(from.getFullYear(), from.getMonth() + 1, 1));
  return d.toISOString().slice(0, 10);
}

// US tax dates (IRS). Weekend/holiday pe IRS agle business day pe shift karta hai — ye dates already shifted hain.
// Har saal update karo (yearly refresh alert yaad dilata hai). Source: irs.gov/filing, Pub 509.
export const TAX_DATES_2027: IcsEvent[] = [
  { uid: "tax-2027-q4-est", title: "Q4 2026 estimated tax payment due", date: "2027-01-15", url: "https://www.irs.gov/payments" },
  { uid: "tax-2027-w2", title: "Employers must send 2026 W-2s (check Box 12 codes TT/TP)", date: "2027-02-01" },
  { uid: "tax-2027-filing", title: "Tax Day: file 2026 return or extension", date: "2027-04-15", url: "https://www.irs.gov/filing" },
];
