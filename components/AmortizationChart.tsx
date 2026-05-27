"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AmortizationRow } from "./MortgageCalculator";

interface Props {
  data: AmortizationRow[];
  termYears: number;
}

export default function AmortizationChart({ data, termYears }: Props) {
  const yearlyData = Array.from({ length: termYears }, (_, i) => {
    const year = i + 1;
    const rows = data.filter((r) => r.year === year);
    const principal = rows.reduce((s, r) => s + r.principal, 0);
    const interest = rows.reduce((s, r) => s + r.interest, 0);
    const balance = rows[rows.length - 1]?.balance ?? 0;
    return { year, principal, interest, balance };
  });

  const fmt = (v: number) =>
    v >= 1000
      ? `$${(v / 1000).toFixed(0)}k`
      : `$${v.toFixed(0)}`;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={yearlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          tickFormatter={(v) => `Yr ${v}`}
          interval={termYears > 20 ? 4 : 1}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          tickFormatter={fmt}
          width={55}
        />
        <Tooltip
          formatter={(value, name) => [
            typeof value === "number"
              ? value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
              : value,
            name === "principal" ? "Principal" : "Interest",
          ]}
          labelFormatter={(label) => `Year ${label}`}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
          }}
        />
        <Legend
          formatter={(value) => (value === "principal" ? "Principal" : "Interest")}
          wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
        />
        <Area
          type="monotone"
          dataKey="principal"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#colorPrincipal)"
        />
        <Area
          type="monotone"
          dataKey="interest"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#colorInterest)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
