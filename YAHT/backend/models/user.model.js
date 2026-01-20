import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    notificationSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      permission: {
        type: String,
        enum: ["default", "granted", "denied"],
        default: "default",
      },
      quietHours: {
        start: {
          type: String,
          match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:mm"],
          default: null,
        },
        end: {
          type: String,
          match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:mm"],
          default: null,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
