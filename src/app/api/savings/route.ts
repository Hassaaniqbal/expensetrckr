import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Saving from "@/models/Saving";

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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filter: Record<string, unknown> = { userId };

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

    const savings = await Saving.find(filter).sort({ date: -1 }).lean();
    return NextResponse.json(savings);
  } catch (error) {
    console.error("GET /api/savings error:", error);
    return NextResponse.json({ error: "Failed to fetch savings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const { date, amount, reason } = await request.json();

    if (!date || !amount) {
      return NextResponse.json({ error: "Date and amount are required" }, { status: 400 });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const saving = await Saving.create({
      userId,
      date: new Date(date),
      amount,
      reason: reason || "",
    });

    return NextResponse.json(saving, { status: 201 });
  } catch (error) {
    console.error("POST /api/savings error:", error);
    return NextResponse.json({ error: "Failed to create saving" }, { status: 500 });
  }
}
