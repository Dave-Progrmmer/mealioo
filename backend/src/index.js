import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

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
