"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-100 text-orange-800",
  Medical: "bg-red-100 text-red-800",
  Transportation: "bg-sky-100 text-sky-800",
  Utilities: "bg-amber-100 text-amber-800",
  Entertainment: "bg-violet-100 text-violet-800",
  Shopping: "bg-pink-100 text-pink-800",
  Other: "bg-slate-100 text-slate-700",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ExpenseList({ expenses, loading }: ExpenseListProps) {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  function exportPDF() {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(5, 150, 105); // primary-600
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Expense Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 14, 28);

    // Table
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
      foot: [["", "", `Rs. ${total.toFixed(2)}`, ""]],
      headStyles: {
        fillColor: [5, 150, 105],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      columnStyles: {
        2: { halign: "right" },
      },
    });

    // Total summary below table
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Expenses
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({expenses.length} {expenses.length === 1 ? "item" : "items"})
              </span>
            </h2>
          </div>
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
            <p className="text-xl font-bold text-primary-700">
              Rs. {total.toFixed(2)}
            </p>
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
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Category
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Amount
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other
                        }`}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">
                      Rs. {expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                      {expense.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {expenses.map((expense) => (
              <div key={expense._id} className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other
                      }`}
                    >
                      {expense.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                  {expense.notes && (
                    <p className="text-sm text-slate-500 truncate">{expense.notes}</p>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900 ml-4">
                  Rs. {expense.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
