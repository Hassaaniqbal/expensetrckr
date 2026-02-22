import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Saving from "@/models/Saving";

function getUserId(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}

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

    const { date, amount, reason } = await request.json();

    if (!date || !amount) {
      return NextResponse.json({ error: "Date and amount are required" }, { status: 400 });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const saving = await Saving.findOneAndUpdate(
      { _id: id, userId },
      { date: new Date(date), amount, reason: reason || "" },
      { new: true }
    );

    if (!saving) {
      return NextResponse.json({ error: "Saving not found" }, { status: 404 });
    }

    return NextResponse.json(saving);
  } catch (error) {
    console.error("PUT /api/savings/[id] error:", error);
    return NextResponse.json({ error: "Failed to update saving" }, { status: 500 });
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

    const saving = await Saving.findOneAndDelete({ _id: id, userId });

    if (!saving) {
      return NextResponse.json({ error: "Saving not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Saving deleted" });
  } catch (error) {
    console.error("DELETE /api/savings/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete saving" }, { status: 500 });
  }
}
