import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import habitRoutes from "./routes/habit.routes.js";
import authRoutes from "./routes/auth.routes.js";
import completionRoutes from "./routes/completion.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1996;

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/completions", completionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Global error handler (must be after routes)
app.use(errorHandler);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running at http://localhost:${PORT}/`);
});
