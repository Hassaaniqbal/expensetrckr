import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { CATEGORIES } from "@/lib/constants";

function getUserId(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filter: Record<string, unknown> = { userId };

    if (category && CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        (filter.date as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (filter.date as Record<string, Date>).$lte = end;
      }
    }

    const expenses = await Expense.find(filter).sort({ date: -1 }).lean();

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { date, amount, category, notes } = body;

    if (!date || !amount || !category) {
      return NextResponse.json(
        { error: "Date, amount, and category are required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const expense = await Expense.create({
      userId,
      date: new Date(date),
      amount,
      category,
      notes: notes || "",
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
