import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    frequency: {
      target: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      period: {
        type: String,
        required: true,
        enum: ["day", "week", "month"],
        default: "day",
      },
    },
    description: {
      type: String,
      required: false,
    },
    dateStarted: {
      type: Date,
      required: false,
    },
    dateAbandoned: {
      type: Date,
      required: false,
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;
