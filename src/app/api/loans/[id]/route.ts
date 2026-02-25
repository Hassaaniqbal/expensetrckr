import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Loan from "@/models/Loan";

function getUserId(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}

// Full update (amount, person, date, notes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const { date, amount, person, notes } = await request.json();

    if (!date || !amount || !person) {
      return NextResponse.json(
        { error: "Date, amount, and person are required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const loan = await Loan.findOneAndUpdate(
      { _id: id, userId },
      { date: new Date(date), amount, person: person.trim(), notes: notes || "" },
      { new: true }
    );

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error("PUT /api/loans/[id] error:", error);
    return NextResponse.json({ error: "Failed to update loan" }, { status: 500 });
  }
}

// Toggle paid status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const { paid } = await request.json();

    const loan = await Loan.findOneAndUpdate(
      { _id: id, userId },
      {
        paid,
        paidDate: paid ? new Date() : undefined,
      },
      { new: true }
    );

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error("PATCH /api/loans/[id] error:", error);
    return NextResponse.json({ error: "Failed to update loan" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const loan = await Loan.findOneAndDelete({ _id: id, userId });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Loan deleted" });
  } catch (error) {
    console.error("DELETE /api/loans/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 });
  }
}
