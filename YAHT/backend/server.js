import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import habitRoutes from "./routes/habit.routes.js";
import authRoutes from "./routes/auth.routes.js";
import completionRoutes from "./routes/completion.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1996;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/completions", completionRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running at http://localhost:${PORT}/`);
});
