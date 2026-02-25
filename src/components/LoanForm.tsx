"use client";

import { useState } from "react";

interface LoanFormProps {
  onLoanAdded: () => void;
}

type LoanType = "borrowed" | "lent";

export default function LoanForm({ onLoanAdded }: LoanFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [loanType, setLoanType] = useState<LoanType>("borrowed");
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [person, setPerson] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    if (!person.trim()) {
      setError(loanType === "borrowed" ? "Please enter who gave the loan" : "Please enter who you lent to");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, amount: parsedAmount, type: loanType, person, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add loan");
      }

      setDate(today);
      setAmount("");
      setPerson("");
      setNotes("");
      onLoanAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const isBorrowed = loanType === "borrowed";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBorrowed ? "bg-orange-100" : "bg-blue-100"}`}>
          <svg className={`w-4 h-4 ${isBorrowed ? "text-orange-600" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Record a Loan</h2>
      </div>

      {/* Type Toggle */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4">
        <button
          type="button"
          onClick={() => setLoanType("borrowed")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            isBorrowed ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span>I Borrowed</span>
        </button>
        <button
          type="button"
          onClick={() => setLoanType("lent")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            !isBorrowed ? "bg-blue-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span>I Lent</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="loan-date" className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="loan-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent ${
              isBorrowed ? "focus:ring-orange-500" : "focus:ring-blue-500"
            }`}
          />
        </div>

        <div>
          <label htmlFor="loan-amount" className="block text-sm font-medium text-slate-700 mb-1">
            Amount (Rs.)
          </label>
          <input
            type="number"
            id="loan-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
            className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent ${
              isBorrowed ? "focus:ring-orange-500" : "focus:ring-blue-500"
            }`}
          />
        </div>

        <div>
          <label htmlFor="loan-person" className="block text-sm font-medium text-slate-700 mb-1">
            {isBorrowed ? "Borrowed From" : "Lent To"}
          </label>
          <input
            type="text"
            id="loan-person"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder={isBorrowed ? "e.g. Ali, Bank, Friend..." : "e.g. Ahmed, Brother..."}
            required
            className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent ${
              isBorrowed ? "focus:ring-orange-500" : "focus:ring-blue-500"
            }`}
          />
        </div>

        <div>
          <label htmlFor="loan-notes" className="block text-sm font-medium text-slate-700 mb-1">
            Notes (optional)
          </label>
          <input
            type="text"
            id="loan-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. For rent, Emergency..."
            className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent ${
              isBorrowed ? "focus:ring-orange-500" : "focus:ring-blue-500"
            }`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`mt-4 w-full sm:w-auto px-6 py-2.5 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          isBorrowed
            ? "bg-orange-500 hover:bg-orange-600 focus:ring-orange-500"
            : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
        }`}
      >
        {loading ? "Adding..." : isBorrowed ? "Record Borrowed Loan" : "Record Lent Loan"}
      </button>
    </form>
  );
}
