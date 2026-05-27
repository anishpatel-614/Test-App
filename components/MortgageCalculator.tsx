"use client";

import { useState, useMemo } from "react";
import AmortizationChart from "./AmortizationChart";
import AmortizationTable from "./AmortizationTable";

export interface AmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  totalInterestPaid: number;
}

function calcMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (annualRate === 0) return principal / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

function buildAmortization(
  principal: number,
  annualRate: number,
  termYears: number
): AmortizationRow[] {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  const payment = calcMonthlyPayment(principal, annualRate, termYears);
  let balance = principal;
  let totalInterestPaid = 0;
  const rows: AmortizationRow[] = [];

  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const principalPaid = payment - interest;
    balance = Math.max(0, balance - principalPaid);
    totalInterestPaid += interest;
    rows.push({
      month: i,
      year: Math.ceil(i / 12),
      payment,
      principal: principalPaid,
      interest,
      balance,
      totalInterestPaid,
    });
  }
  return rows;
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const fmtFull = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState(400000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [downPaymentAmt, setDownPaymentAmt] = useState(80000);
  const [interestRate, setInterestRate] = useState(6.875);
  const [termYears, setTermYears] = useState(30);
  const [propertyTax, setPropertyTax] = useState(3600);
  const [homeInsurance, setHomeInsurance] = useState(1200);
  const [pmi, setPmi] = useState(0);
  const [showTable, setShowTable] = useState(false);

  const loanAmount = homePrice - downPaymentAmt;

  const monthlyPayment = useMemo(
    () => (loanAmount > 0 ? calcMonthlyPayment(loanAmount, interestRate, termYears) : 0),
    [loanAmount, interestRate, termYears]
  );

  const amortization = useMemo(
    () => (loanAmount > 0 ? buildAmortization(loanAmount, interestRate, termYears) : []),
    [loanAmount, interestRate, termYears]
  );

  const totalInterest = amortization.length > 0 ? amortization[amortization.length - 1].totalInterestPaid : 0;
  const totalCost = loanAmount + totalInterest;
  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = homeInsurance / 12;
  const effectivePmi = downPaymentPct < 20 ? pmi : 0;
  const totalMonthly = monthlyPayment + monthlyTax + monthlyInsurance + effectivePmi;

  const handleHomePriceChange = (val: number) => {
    setHomePrice(val);
    const amt = Math.round((downPaymentPct / 100) * val);
    setDownPaymentAmt(amt);
  };

  const handleDownPct = (val: number) => {
    setDownPaymentPct(val);
    setDownPaymentAmt(Math.round((val / 100) * homePrice));
  };

  const handleDownAmt = (val: number) => {
    setDownPaymentAmt(val);
    setDownPaymentPct(homePrice > 0 ? Math.round((val / homePrice) * 100 * 10) / 10 : 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
            Loan Details
          </h3>

          <InputField
            label="Home Price"
            value={homePrice}
            onChange={handleHomePriceChange}
            prefix="$"
            min={50000}
            max={5000000}
            step={1000}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Down Payment</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  value={downPaymentAmt}
                  onChange={(e) => handleDownAmt(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={0}
                  max={homePrice}
                />
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={downPaymentPct}
                  onChange={(e) => handleDownPct(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={0}
                  max={100}
                  step={0.5}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Loan Term</label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 15, 20, 30].map((y) => (
                <button
                  key={y}
                  onClick={() => setTermYears(y)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    termYears === y
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {y} yr
                </button>
              ))}
            </div>
          </div>

          <InputField
            label="Interest Rate"
            value={interestRate}
            onChange={setInterestRate}
            suffix="%"
            min={0.1}
            max={20}
            step={0.125}
            decimals={3}
          />

          <div className="border-t border-slate-100 pt-4">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide mb-4">
              Monthly Costs
            </h3>

            <InputField
              label="Property Tax (annual)"
              value={propertyTax}
              onChange={setPropertyTax}
              prefix="$"
              min={0}
              max={50000}
              step={100}
            />
            <div className="mt-4">
              <InputField
                label="Home Insurance (annual)"
                value={homeInsurance}
                onChange={setHomeInsurance}
                prefix="$"
                min={0}
                max={20000}
                step={100}
              />
            </div>
            {downPaymentPct < 20 && (
              <div className="mt-4">
                <InputField
                  label="PMI (monthly)"
                  value={pmi}
                  onChange={setPmi}
                  prefix="$"
                  min={0}
                  max={1000}
                  step={10}
                />
                <p className="text-xs text-amber-600 mt-1">
                  PMI typically required when down payment &lt; 20%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Monthly Payment Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-md p-6 text-white">
            <p className="text-blue-100 text-sm font-medium mb-1">
              Estimated Monthly Payment
            </p>
            <div className="text-5xl font-bold tracking-tight mb-4">
              {fmtFull(totalMonthly)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <PaymentPill label="Principal & Interest" value={fmtFull(monthlyPayment)} />
              <PaymentPill label="Property Tax" value={fmt(monthlyTax)} />
              <PaymentPill label="Insurance" value={fmt(monthlyInsurance)} />
              {downPaymentPct < 20 && <PaymentPill label="PMI" value={fmt(effectivePmi)} />}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Loan Amount" value={fmt(loanAmount)} />
            <StatCard label="Down Payment" value={`${fmt(downPaymentAmt)} (${downPaymentPct}%)`} />
            <StatCard label="Total Interest" value={fmt(totalInterest)} highlight />
            <StatCard label="Total Cost" value={fmt(totalCost)} />
          </div>

          {/* Chart */}
          {amortization.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">
                Principal vs Interest Over Time
              </h3>
              <AmortizationChart data={amortization} termYears={termYears} />
            </div>
          )}
        </div>
      </div>

      {/* Amortization Table Toggle */}
      {amortization.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            onClick={() => setShowTable((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-800">
              Full Amortization Schedule ({termYears * 12} payments)
            </span>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${showTable ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTable && <AmortizationTable data={amortization} />}
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step,
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className={`w-full ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-8" : "pr-3"} py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function PaymentPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/15 rounded-xl px-3 py-2">
      <p className="text-blue-100 text-xs mb-0.5">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        highlight
          ? "bg-amber-50 border-amber-200"
          : "bg-white border-slate-200"
      } shadow-sm`}
    >
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p
        className={`font-bold text-base ${
          highlight ? "text-amber-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
