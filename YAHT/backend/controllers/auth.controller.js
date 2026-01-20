import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const register = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    if (!email || !username || !password) {
      return res.status(400).json({
        message: "Please provide email, username, and password",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return res.status(400).json({
        message: `User with this ${field} already exists`,
      });
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
    console.error("Registration error:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({
      message: "An error occurred during registration",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
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
    console.error("Login error:", err);
    res.status(500).json({
      message: "An error occurred during login",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
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
    console.error("Get profile error:", err);
    res.status(500).json({
      message: "An error occurred while fetching profile",
    });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const { enabled, permission, quietHoursStart, quietHoursEnd } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (enabled !== undefined) {
      user.notificationSettings.enabled = enabled;
    }

    if (permission !== undefined) {
      if (!["default", "granted", "denied"].includes(permission)) {
        return res.status(400).json({
          message: "Invalid permission value",
        });
      }
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
    console.error("Update notification settings error:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({
      message: "An error occurred while updating notification settings",
    });
  }
};

export { register, login, getMe, updateNotificationSettings };
