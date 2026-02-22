"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CATEGORIES } from "@/lib/constants";

interface Expense {
  _id: string;
  date: string;
  amount: number;
  category: string;
  notes: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  onUpdate: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-100 text-orange-800",
  Medical: "bg-red-100 text-red-800",
  Transportation: "bg-sky-100 text-sky-800",
  Utilities: "bg-amber-100 text-amber-800",
  Entertainment: "bg-violet-100 text-violet-800",
  Shopping: "bg-pink-100 text-pink-800",
  "Wifi Bill": "bg-blue-100 text-blue-800",
  "TV Bill": "bg-indigo-100 text-indigo-800",
  "Electricity Bill": "bg-yellow-100 text-yellow-800",
  Petrol: "bg-rose-100 text-rose-800",
  Other: "bg-slate-100 text-slate-700",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toInputDate(dateStr: string): string {
  return new Date(dateStr).toISOString().split("T")[0];
}

export default function ExpenseList({ expenses, loading, onUpdate }: ExpenseListProps) {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setEditDate(toInputDate(expense.date));
    setEditAmount(String(expense.amount));
    setEditCategory(expense.category);
    setEditNotes(expense.notes);
    setEditError("");
  }

  function closeEdit() {
    setEditingExpense(null);
    setEditError("");
  }

  async function handleEditSave() {
    if (!editingExpense) return;
    setEditError("");
    const parsedAmount = parseFloat(editAmount);
    if (!editAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setEditError("Please enter a valid amount greater than 0");
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/expenses/${editingExpense._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDate,
          amount: parsedAmount,
          category: editCategory,
          notes: editNotes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      closeEdit();
      onUpdate();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      onUpdate();
    } finally {
      setDeletingId(null);
    }
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Expense Report", 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      14,
      28
    );

    const rows = expenses.map((exp) => [
      formatDate(exp.date),
      exp.category,
      `Rs. ${exp.amount.toFixed(2)}`,
      exp.notes || "—",
    ]);

    autoTable(doc, {
      startY: 42,
      head: [["Date", "Category", "Amount", "Notes"]],
      body: rows,
      foot: [["", "Total", `Rs. ${total.toFixed(2)}`, ""]],
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 10 },
      bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 4, lineColor: [226, 232, 240], lineWidth: 0.1 },
      columnStyles: { 2: { halign: "right" } },
    });

    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total expenses: ${expenses.length} items`, 14, finalY);
    doc.save("expense-report.pdf");
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="mt-3 text-sm text-slate-500">Loading expenses...</p>
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Expense</h3>

            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {editError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Rs.)</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={closeEdit}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Expenses
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({expenses.length} {expenses.length === 1 ? "item" : "items"})
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {expenses.length > 0 && (
              <button
                onClick={exportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
            )}
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-xl font-bold text-primary-700">Rs. {total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No expenses found</p>
            <p className="text-sm text-slate-400 mt-1">Add your first expense above to get started.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Category</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Amount</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Notes</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-700">{formatDate(expense.date)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">Rs. {expense.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{expense.notes || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEdit(expense)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            disabled={deletingId === expense._id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {expenses.map((expense) => (
                <div key={expense._id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other}`}>
                        {expense.category}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
                    </div>
                    {expense.notes && <p className="text-sm text-slate-500 truncate">{expense.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-semibold text-slate-900">Rs. {expense.amount.toFixed(2)}</p>
                    <button onClick={() => openEdit(expense)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(expense._id)} disabled={deletingId === expense._id} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
