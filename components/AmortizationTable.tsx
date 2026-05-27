"use client";

import { useState } from "react";
import type { AmortizationRow } from "./MortgageCalculator";

interface Props {
  data: AmortizationRow[];
}

const fmtC = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PAGE_SIZE = 24;

export default function AmortizationTable({ data }: Props) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const rows = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Month
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Payment
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Principal
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Interest
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Balance
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Total Interest
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={row.month}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-2.5 text-slate-600">
                  <span className="font-medium">{row.month}</span>
                  <span className="text-slate-400 text-xs ml-1.5">
                    (Yr {row.year})
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-slate-800">
                  {fmtC(row.payment)}
                </td>
                <td className="px-4 py-2.5 text-right text-blue-600">
                  {fmtC(row.principal)}
                </td>
                <td className="px-4 py-2.5 text-right text-amber-600">
                  {fmtC(row.interest)}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-700">
                  {fmtC(row.balance)}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-500">
                  {fmtC(row.totalInterestPaid)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing months {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
