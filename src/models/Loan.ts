import mongoose, { Schema, Document } from "mongoose";

export interface ILoan extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  amount: number;
  lender: string;
  notes: string;
  paid: boolean;
  paidDate?: Date;
  createdAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    lender: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    paid: { type: Boolean, default: false },
    paidDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Loan ||
  mongoose.model<ILoan>("Loan", LoanSchema);
