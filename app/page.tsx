import MortgageCalculator from "@/components/MortgageCalculator";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-none">
              MortgageCalc
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">US Mortgage Calculator</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Calculate Your Mortgage
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Estimate your monthly payment, see your full amortization schedule,
            and understand the true cost of your home loan.
          </p>
        </div>
        <MortgageCalculator />
      </div>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-400">
          <p>
            For educational purposes only. Not financial advice. Consult a
            licensed mortgage professional for accurate quotes.
          </p>
        </div>
      </footer>
    </main>
  );
}
