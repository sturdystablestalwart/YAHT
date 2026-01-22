import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const register = async (req, res, next) => {
  const { email, username, password } = req.body;

  try {
    // Check for existing user (validation handled by middleware)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      throw new AppError(`User with this ${field} already exists`, 400);
    }

    const user = await User.create({
      email,
      username,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        notificationSettings: user.notificationSettings,
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validation handled by middleware
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        notificationSettings: user.notificationSettings,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        notificationSettings: user.notificationSettings,
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateNotificationSettings = async (req, res, next) => {
  try {
    const { enabled, permission, quietHoursStart, quietHoursEnd } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Validation handled by middleware
    if (enabled !== undefined) {
      user.notificationSettings.enabled = enabled;
    }

    if (permission !== undefined) {
      user.notificationSettings.permission = permission;
    }

    if (quietHoursStart !== undefined) {
      user.notificationSettings.quietHours.start = quietHoursStart;
    }

    if (quietHoursEnd !== undefined) {
      user.notificationSettings.quietHours.end = quietHoursEnd;
    }

    await user.save();

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        notificationSettings: user.notificationSettings,
      },
    });
  } catch (err) {
    next(err);
  }
};

export { register, login, getMe, updateNotificationSettings };
