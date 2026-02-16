import mongoose, { Schema, Document } from "mongoose";
import { CATEGORIES, type Category } from "@/lib/constants";

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  amount: number;
  category: Category;
  notes: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, enum: CATEGORIES },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Expense ||
  mongoose.model<IExpense>("Expense", ExpenseSchema);
