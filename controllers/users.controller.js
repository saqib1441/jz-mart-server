import asyncHandler from "../middlewares/asyncHandler.js";
import { Op } from "sequelize";
import otpGenerator from "otp-generator";
import User from "../models/user.model.js";
import OTP from "../models/otpModel.js";
import ErrorHandler from "../middlewares/errorHandler.js";
import { sendEmail } from "../utils/sendMail.js";
import { comparePassword, hashPassword } from "../utils/passHandler.js";
import sendToken from "../utils/sendToken.js";

// Generate a 6-digit OTP using otp-generator
const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
};

// @desc    Send OTP for email verification
// @route   POST /api/user/send-otp
// @access  Public
export const sendOTP = asyncHandler(async (req, res, next) => {
  const { email, purpose } = req.body;

  await OTP.destroy({
    where: { expiresAt: { [Op.gt]: Date.now() } },
  });

  if (!email || !purpose) {
    return next(new ErrorHandler(400, "Email and purpose are required."));
  }

  // Check if the user already exists (only if the purpose is "register")
  if (purpose === "register") {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(
        new ErrorHandler(400, "User is already registered with this email.")
      );
    }
  }

  // Delete old OTPs for this email before generating a new one
  await OTP.destroy({ where: { email } });

  const otpCode = generateOTP();
  await OTP.create({
    email,
    otp: otpCode,
    purpose,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
  });

  const subject = "JZ Mart - User Verification";

  try {
    await sendEmail(email, subject, otpCode);
    res.status(200).json({
      success: true,
      message: "OTP sent successfully please check your email.",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(500, "Failed to send OTP. Try again later."));
  }
});

// @desc    Verify OTP and Register User
// @route   POST /api/user/register
// @access  Public
export const registerUser = asyncHandler(async (req, res, next) => {
  const { fullname, email, password, otp, purpose } = req.body;

  const isExist = await User.findOne({ where: { email } });
  if (isExist) {
    return next(new ErrorHandler(400, "User already exists."));
  }

  const otpRecord = await OTP.findOne({
    where: { email, otp, purpose, expiresAt: { [Op.gt]: Date.now() } },
  });

  if (!otpRecord) {
    // Remove expired OTPs
    await OTP.destroy({
      where: { email, expiresAt: { [Op.lte]: Date.now() } },
    });
    return next(new ErrorHandler(400, "Invalid or expired OTP"));
  }

  const hashedPassword = await hashPassword(password);

  try {
    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });

    // Delete OTP after successful verification
    await OTP.destroy({ where: { email } });

    const user = {
      id: newUser.id,
      fullname: newUser.fullname,
      email: newUser.email,
    };

    const message = "User registered successfully";
    sendToken(user, message, res);
  } catch (error) {
    console.log(error);
    return next(
      new ErrorHandler(500, "User registration failed. Try again later.")
    );
  }
});

// @desc    Login User
// @route   POST /api/user/login
// @access  Public

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  const comparedPassword = await comparePassword(password, user.password);

  if (!user || !comparedPassword) {
    return next(new ErrorHandler(401, "Invalid credentials"));
  }

  const message = "User logged in successfully";

  sendToken(user, message, res);
});

// @desc    Logout User
// @route   POST /api/user/logout
// @access  Public

export const logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "User logged out successfully!",
  });
});
