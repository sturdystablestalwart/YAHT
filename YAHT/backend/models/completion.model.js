import mongoose from "mongoose";

const completionSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

completionSchema.index({ habitId: 1, completedAt: -1 });
completionSchema.index({ userId: 1, completedAt: -1 });

const Completion = mongoose.model("Completion", completionSchema);

export default Completion;
