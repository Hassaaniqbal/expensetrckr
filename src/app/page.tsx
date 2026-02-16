"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import InactivityGuard from "@/components/InactivityGuard";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseFilters from "@/components/ExpenseFilters";
import ExpenseList from "@/components/ExpenseList";

interface Expense {
  _id: string;
  date: string;
  amount: number;
  category: string;
  notes: string;
}

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

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
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterStartDate) params.set("startDate", filterStartDate);
      if (filterEndDate) params.set("endDate", filterEndDate);

      const query = params.toString();
      const res = await fetch(`/api/expenses${query ? `?${query}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (!authLoading && username) {
      fetchExpenses();
    }
  }, [authLoading, username, fetchExpenses]);

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

  return (
    <InactivityGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar username={username} />

        <main className="py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
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

            <ExpenseList expenses={expenses} loading={loading} />
          </div>
        </main>
      </div>
    </InactivityGuard>
  );
}
