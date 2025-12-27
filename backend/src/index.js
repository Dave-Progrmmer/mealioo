import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import mealPlanRoutes from "./routes/mealPlan.routes.js";
import calorieRoutes from "./routes/calorie.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Rate Limiting Configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests",
    message: "You have exceeded the rate limit. Please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limit for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    error: "Too many authentication attempts",
    message: "Too many login/register attempts. Please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Database Connection Middleware (Ensures connection before processing requests)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({
      message: "Service Unavailable: Database connection failed",
      error: err.message,
    });
  }
});

// Routes with specific rate limiting for auth
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/mealplans", mealPlanRoutes);
app.use("/api/calories", calorieRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Mealio API is running" });
});

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mealio")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Conditional listen for local development
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
