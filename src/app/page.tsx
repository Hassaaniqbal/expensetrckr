"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import InactivityGuard from "@/components/InactivityGuard";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseFilters from "@/components/ExpenseFilters";
import ExpenseList from "@/components/ExpenseList";
import SavingForm from "@/components/SavingForm";
import SavingList from "@/components/SavingList";
import LoanForm from "@/components/LoanForm";
import LoanList from "@/components/LoanList";

interface Expense {
  _id: string;
  date: string;
  amount: number;
  category: string;
  notes: string;
}

interface Saving {
  _id: string;
  date: string;
  amount: number;
  reason: string;
}

interface Loan {
  _id: string;
  date: string;
  amount: number;
  lender: string;
  notes: string;
  paid: boolean;
  paidDate?: string;
}

type Tab = "expenses" | "savings" | "loans";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("expenses");

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Savings state
  const [savings, setSavings] = useState<Saving[]>([]);
  const [savingsLoading, setSavingsLoading] = useState(true);

  // Loans state
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loansLoading, setLoansLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setUsername(data.username))
      .catch(() => router.push("/login"))
      .finally(() => setAuthLoading(false));
  }, [router]);

  const fetchExpenses = useCallback(async () => {
    setExpensesLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterStartDate) params.set("startDate", filterStartDate);
      if (filterEndDate) params.set("endDate", filterEndDate);
      const query = params.toString();
      const res = await fetch(`/api/expenses${query ? `?${query}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setExpenses(await res.json());
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setExpensesLoading(false);
    }
  }, [filterCategory, filterStartDate, filterEndDate]);

  const fetchSavings = useCallback(async () => {
    setSavingsLoading(true);
    try {
      const res = await fetch("/api/savings");
      if (!res.ok) throw new Error("Failed to fetch");
      setSavings(await res.json());
    } catch (error) {
      console.error("Error fetching savings:", error);
    } finally {
      setSavingsLoading(false);
    }
  }, []);

  const fetchLoans = useCallback(async () => {
    setLoansLoading(true);
    try {
      const res = await fetch("/api/loans");
      if (!res.ok) throw new Error("Failed to fetch");
      setLoans(await res.json());
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoansLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && username) {
      fetchExpenses();
      fetchSavings();
      fetchLoans();
    }
  }, [authLoading, username, fetchExpenses, fetchSavings, fetchLoans]);

  function clearFilters() {
    setFilterCategory("");
    setFilterStartDate("");
    setFilterEndDate("");
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!username) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);
  const totalLoansOutstanding = loans.filter((l) => !l.paid).reduce((sum, l) => sum + l.amount, 0);

  return (
    <InactivityGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar username={username} />

        <main className="py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Expenses</p>
                <p className="text-xl font-bold text-red-500">Rs. {totalExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Savings</p>
                <p className="text-xl font-bold text-emerald-600">Rs. {totalSavings.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Loans Owed</p>
                <p className="text-xl font-bold text-orange-500">Rs. {totalLoansOutstanding.toFixed(2)}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("expenses")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "expenses"
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Expenses
              </button>
              <button
                onClick={() => setActiveTab("savings")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "savings"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Savings
              </button>
              <button
                onClick={() => setActiveTab("loans")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "loans"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Loans
                {loans.filter((l) => !l.paid).length > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === "loans" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"
                  }`}>
                    {loans.filter((l) => !l.paid).length}
                  </span>
                )}
              </button>
            </div>

            {/* Expenses Tab */}
            {activeTab === "expenses" && (
              <>
                <ExpenseForm onExpenseAdded={fetchExpenses} />
                <ExpenseFilters
                  category={filterCategory}
                  startDate={filterStartDate}
                  endDate={filterEndDate}
                  onCategoryChange={setFilterCategory}
                  onStartDateChange={setFilterStartDate}
                  onEndDateChange={setFilterEndDate}
                  onClear={clearFilters}
                />
                <ExpenseList
                  expenses={expenses}
                  loading={expensesLoading}
                  onUpdate={fetchExpenses}
                />
              </>
            )}

            {/* Savings Tab */}
            {activeTab === "savings" && (
              <>
                <SavingForm onSavingAdded={fetchSavings} />
                <SavingList
                  savings={savings}
                  loading={savingsLoading}
                  onUpdate={fetchSavings}
                />
              </>
            )}

            {/* Loans Tab */}
            {activeTab === "loans" && (
              <>
                <LoanForm onLoanAdded={fetchLoans} />
                <LoanList
                  loans={loans}
                  loading={loansLoading}
                  onUpdate={fetchLoans}
                />
              </>
            )}

          </div>
        </main>
      </div>
    </InactivityGuard>
  );
}
