// Importing Necessary Modules
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import sequelize from "./config/database.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import { UserRouter } from "./routes/user.routes.js";
import { ConnectionError, DatabaseError, ValidationError } from "sequelize";

// Load Environment Variables
config();

// Initialize Express App
const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Test API Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "The API is running...",
  });
});

// Routes
app.use("/api/user", UserRouter);

// Handle Undefined Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found!",
  });
});

// Error Middleware
app.use(errorMiddleware);

// Database Connection Function with Error Handling
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    await sequelize.sync();
  } catch (error) {
    if (error instanceof ConnectionError) {
      console.error("Database connection error:", error.message);
    } else if (error instanceof ValidationError) {
      console.error(
        "Database validation error:",
        error.errors.map((e) => e.message).join(", ")
      );
    } else if (error instanceof DatabaseError) {
      console.error("General database error:", error.message);
    } else {
      console.error("Unknown database error:", error.message);
    }

    process.exit(1);
  }
};

// Connect to Database
connectDB();

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// Graceful Shutdown Handling
const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("Process terminated.");
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});
