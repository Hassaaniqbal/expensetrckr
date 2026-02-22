import mongoose, { Schema, Document } from "mongoose";

export interface ISaving extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  amount: number;
  reason: string;
  createdAt: Date;
}

const SavingSchema = new Schema<ISaving>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    reason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Saving ||
  mongoose.model<ISaving>("Saving", SavingSchema);
