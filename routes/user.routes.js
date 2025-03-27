// Importing Necessary Moduels
import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  sendOTP,
} from "../controllers/users.controller.js";

const router = Router();

// Send Otp
router.post("/send-otp", sendOTP);

// Register User
router.post("/register", registerUser);

// Login User
router.post("/login", loginUser);

// Logout User
router.get("/logout", logoutUser);

export { router as UserRouter };
