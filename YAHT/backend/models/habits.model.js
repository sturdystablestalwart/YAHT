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
    reminderSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      time: {
        type: String,
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:mm"],
        default: "09:00",
      },
      days: {
        type: [Number],
        validate: {
          validator: function (days) {
            return days.every((day) => day >= 0 && day <= 6);
          },
          message: "Days must be between 0 (Sunday) and 6 (Saturday)",
        },
        default: [0, 1, 2, 3, 4, 5, 6],
      },
      lastSent: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;
