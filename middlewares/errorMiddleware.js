import ErrorHandler from "./errorHandler.js";
import { ValidationError, ConnectionError, DatabaseError } from "sequelize";
import jwt from "jsonwebtoken";

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Sequelize Errors
  if (err instanceof ConnectionError) {
    err = new ErrorHandler(
      500,
      "Database connection failed. Please try again later."
    );
  } else if (err instanceof ValidationError) {
    message = err.errors.map((e) => e.message).join(", ");
    err = new ErrorHandler(400, message);
  } else if (err instanceof DatabaseError) {
    err = new ErrorHandler(500, "A database error occurred.");
  }

  // Handle JWT Errors
  if (err instanceof jwt.JsonWebTokenError) {
    err = new ErrorHandler(401, "Invalid Token. Authentication failed.");
  } else if (err instanceof jwt.TokenExpiredError) {
    err = new ErrorHandler(401, "Session expired. Please log in again.");
  }

  res.status(statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorMiddleware;
