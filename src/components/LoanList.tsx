"use client";

import { useState } from "react";

interface Loan {
  _id: string;
  date: string;
  amount: number;
  lender: string;
  notes: string;
  paid: boolean;
  paidDate?: string;
}

interface LoanListProps {
  loans: Loan[];
  loading: boolean;
  onUpdate: () => void;
}

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

export default function LoanList({ loans, loading, onUpdate }: LoanListProps) {
  const unpaidTotal = loans.filter((l) => !l.paid).reduce((sum, l) => sum + l.amount, 0);
  const paidTotal = loans.filter((l) => l.paid).reduce((sum, l) => sum + l.amount, 0);

  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editLender, setEditLender] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openEdit(loan: Loan) {
    setEditingLoan(loan);
    setEditDate(toInputDate(loan.date));
    setEditAmount(String(loan.amount));
    setEditLender(loan.lender);
    setEditNotes(loan.notes);
    setEditError("");
  }

  function closeEdit() {
    setEditingLoan(null);
    setEditError("");
  }

  async function handleEditSave() {
    if (!editingLoan) return;
    setEditError("");
    const parsedAmount = parseFloat(editAmount);
    if (!editAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setEditError("Please enter a valid amount greater than 0");
      return;
    }
    if (!editLender.trim()) {
      setEditError("Please enter who gave the loan");
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/loans/${editingLoan._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDate,
          amount: parsedAmount,
          lender: editLender,
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

  async function togglePaid(loan: Loan) {
    setTogglingId(loan._id);
    try {
      await fetch(`/api/loans/${loan._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: !loan.paid }),
      });
      onUpdate();
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/loans/${id}`, { method: "DELETE" });
      onUpdate();
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
        <p className="mt-3 text-sm text-slate-500">Loading loans...</p>
      </div>
    );
  }

  const unpaidLoans = loans.filter((l) => !l.paid);
  const paidLoans = loans.filter((l) => l.paid);

  return (
    <>
      {/* Edit Modal */}
      {editingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Loan</h3>

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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Borrowed From</label>
                <input
                  type="text"
                  value={editLender}
                  onChange={(e) => setEditLender(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Loans
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({loans.length} {loans.length === 1 ? "entry" : "entries"})
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Outstanding</p>
              <p className="text-xl font-bold text-orange-500">Rs. {unpaidTotal.toFixed(2)}</p>
            </div>
            {paidTotal > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Paid Back</p>
                <p className="text-lg font-semibold text-slate-400">Rs. {paidTotal.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        {loans.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No loans recorded</p>
            <p className="text-sm text-slate-400 mt-1">Record a loan above to keep track of what you owe.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Unpaid loans */}
            {unpaidLoans.length > 0 && (
              <div>
                {unpaidLoans.length < loans.length && (
                  <p className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                    Unpaid ({unpaidLoans.length})
                  </p>
                )}
                {unpaidLoans.map((loan) => (
                  <LoanRow
                    key={loan._id}
                    loan={loan}
                    onEdit={openEdit}
                    onToggle={togglePaid}
                    onDelete={handleDelete}
                    togglingId={togglingId}
                    deletingId={deletingId}
                  />
                ))}
              </div>
            )}

            {/* Paid loans */}
            {paidLoans.length > 0 && (
              <div>
                <p className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                  Paid Back ({paidLoans.length})
                </p>
                {paidLoans.map((loan) => (
                  <LoanRow
                    key={loan._id}
                    loan={loan}
                    onEdit={openEdit}
                    onToggle={togglePaid}
                    onDelete={handleDelete}
                    togglingId={togglingId}
                    deletingId={deletingId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function LoanRow({
  loan,
  onEdit,
  onToggle,
  onDelete,
  togglingId,
  deletingId,
}: {
  loan: Loan;
  onEdit: (loan: Loan) => void;
  onToggle: (loan: Loan) => void;
  onDelete: (id: string) => void;
  togglingId: string | null;
  deletingId: string | null;
}) {
  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50 ${loan.paid ? "opacity-60" : ""}`}>
      {/* Tick button */}
      <button
        onClick={() => onToggle(loan)}
        disabled={togglingId === loan._id}
        title={loan.paid ? "Mark as unpaid" : "Mark as paid"}
        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-50 ${
          loan.paid
            ? "bg-green-500 border-green-500 text-white"
            : "border-slate-300 hover:border-green-400 hover:bg-green-50"
        }`}
      >
        {loan.paid && (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${loan.paid ? "line-through text-slate-400" : "text-slate-900"}`}>
            Rs. {loan.amount.toFixed(2)}
          </span>
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            {loan.lender}
          </span>
          <span className="text-xs text-slate-400">{formatDate(loan.date)}</span>
          {loan.paid && loan.paidDate && (
            <span className="text-xs text-green-600">Paid on {formatDate(loan.paidDate)}</span>
          )}
        </div>
        {loan.notes && (
          <p className="text-sm text-slate-500 mt-0.5 truncate">{loan.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!loan.paid && (
          <button
            onClick={() => onEdit(loan)}
            className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(loan._id)}
          disabled={deletingId === loan._id}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
