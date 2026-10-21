"use client";

import { useMemo, useState } from "react";
import { calcAutoLoan, usd } from "@/lib/calc";

export default function AutoLoanCalculator() {
  const [price, setPrice] = useState("35000");
  const [down, setDown] = useState("3000");
  const [tradeIn, setTradeIn] = useState("8000");
  const [owed, setOwed] = useState("2000");
  const [tax, setTax] = useState("7");
  const [fees, setFees] = useState("500");
  const [rate, setRate] = useState("8");
  const [term, setTerm] = useState("60");
  const [taxCredit, setTaxCredit] = useState(true);

  const result = useMemo(
    () =>
      calcAutoLoan({
        vehiclePrice: parseFloat(price) || 0,
        downPayment: parseFloat(down) || 0,
        tradeInValue: parseFloat(tradeIn) || 0,
        amountOwedOnTrade: parseFloat(owed) || 0,
        salesTaxPercent: parseFloat(tax) || 0,
        fees: parseFloat(fees) || 0,
        annualRatePercent: parseFloat(rate) || 0,
        termMonths: parseFloat(term) || 60,
        taxCreditOnTradeIn: taxCredit,
      }),
    [price, down, tradeIn, owed, tax, fees, rate, term, taxCredit]
  );

  return (
    <div className="card">
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="price" label="Vehicle price ($)" value={price} set={setPrice} />
        <Field id="down" label="Down payment ($)" value={down} set={setDown} />
        <Field id="tradeIn" label="Trade-in value ($)" value={tradeIn} set={setTradeIn} />
        <Field id="owed" label="Still owed on trade-in ($)" value={owed} set={setOwed} />
        <Field id="tax" label="Sales tax (%)" value={tax} set={setTax} step="0.1" />
        <Field id="fees" label="Fees ($)" value={fees} set={setFees} />
        <Field id="rate" label="Interest rate / APR (%)" value={rate} set={setRate} step="0.01" />
        <div>
          <label className="label-field" htmlFor="term">Loan term (months)</label>
          <select id="term" className="input-field" value={term} onChange={(e) => setTerm(e.target.value)}>
            {[36, 48, 60, 72, 84].map((m) => (
              <option key={m} value={m}>{m} months</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input id="taxCredit" type="checkbox" checked={taxCredit}
            onChange={(e) => setTaxCredit(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-ivy-600 focus:ring-ivy-500" />
          <label htmlFor="taxCredit" className="text-sm text-slate-700">
            My state taxes the price after trade-in (most states do)
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-ivy-50 p-5">
        <div className="text-sm text-slate-600">Estimated monthly payment</div>
        <div className="mt-1 text-3xl font-extrabold text-ivy-700">{usd(result.monthlyPayment)}</div>
        <div className="mt-1 text-sm text-slate-600">for {term} months</div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-100">
            <Row label="Net trade-in (value − owed)" value={usd(result.netTradeIn)} />
            <Row label="Taxable amount" value={usd(result.taxableAmount)} />
            <Row label="Sales tax" value={usd(result.salesTax)} />
            <Row label="Amount financed (loan)" value={usd(result.loanAmount)} />
            <Row label="Total interest" value={usd(result.totalInterest)} />
            <Row label="Total of payments" value={usd(result.totalLoanCost)} bold />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ id, label, value, set, step }: {
  id: string; label: string; value: string; set: (v: string) => void; step?: string;
}) {
  return (
    <div>
      <label className="label-field" htmlFor={id}>{label}</label>
      <input id={id} type="number" inputMode="decimal" min="0" step={step}
        className="input-field" value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className={bold ? "bg-slate-50 font-semibold text-slate-900" : "text-slate-700"}>
      <td className="px-4 py-2.5">{label}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{value}</td>
    </tr>
  );
}
