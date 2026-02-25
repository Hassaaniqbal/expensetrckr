import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Loan from "@/models/Loan";

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
    const loans = await Loan.find({ userId }).sort({ paid: 1, date: -1 }).lean();
    return NextResponse.json(loans);
  } catch (error) {
    console.error("GET /api/loans error:", error);
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const { date, amount, lender, notes } = await request.json();

    if (!date || !amount || !lender) {
      return NextResponse.json(
        { error: "Date, amount, and lender are required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const loan = await Loan.create({
      userId,
      date: new Date(date),
      amount,
      lender: lender.trim(),
      notes: notes || "",
      paid: false,
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    console.error("POST /api/loans error:", error);
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 });
  }
}
