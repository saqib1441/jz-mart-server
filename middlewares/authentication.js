import User from "../models/user.model.js";
import asyncHandler from "./asyncHandler.js";
import ErrorHandler from "./errorHandler.js";
import jwt from "jsonwebtoken";

// Middleware to check if the user is logged in
export const isLoggedIn = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  // Check if there is no token
  if (!token) {
    return next(
      new ErrorHandler(400, "Please login first to access this resource.")
    );
  }

  try {
    // Decode the token and verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID in the database
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler(404, "User not found, please login again."));
    }
    next(); // Continue to the next middleware
  } catch (error) {
    return next(new ErrorHandler(401, "Invalid or expired token."));
  }
});

// Middleware to check if the user is authorized
export const isAuthorized = (roles = []) => {
  // If roles is a string, we make it an array
  if (typeof roles === "string") {
    roles = [roles];
  }

  return asyncHandler(async (req, res, next) => {
    // Check if user is logged in
    if (!req.user) {
      return next(new ErrorHandler(400, "User not logged in"));
    }

    // Check if the user has the necessary role(s)
    if (!roles.length || roles.includes(req.user.role)) {
      return next(); // User has the required role, continue to next middleware
    } else {
      return next(
        new ErrorHandler(
          403,
          "You do not have permission to access this resource."
        )
      );
    }
  });
};
