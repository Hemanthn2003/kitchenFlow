import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import PasswordReset from "../models/PasswordReset.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";

import { sendPasswordResetOTP } from "../utils/email.js";

const router = express.Router();


/* Cookie Settings */

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge,
});


/* Login */

router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    /*
      Don't reveal whether the email exists.
    */

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(
      user,
      Boolean(rememberMe)
    );

    const accessMaxAge =
      24 * 60 * 60 * 1000;

    const refreshMaxAge = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 3 * 24 * 60 * 60 * 1000;

    res.cookie(
      "accessToken",
      accessToken,
      getCookieOptions(accessMaxAge)
    );

    res.cookie(
      "refreshToken",
      refreshToken,
      getCookieOptions(refreshMaxAge)
    );

    return res.status(200).json({
      message: "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});


/* Refresh Access Token */

router.post("/refresh", async (req, res) => {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const accessToken =
      generateAccessToken(user);

    res.cookie(
      "accessToken",
      accessToken,
      getCookieOptions(
        24 * 60 * 60 * 1000
      )
    );

    return res.status(200).json({
      message: "Access token refreshed",
    });

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
});


/* Current User */

router.get("/me", async (req, res) => {
  try {
    const token =
      req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    const user = await User.findById(
      decoded.id
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });

  } catch (error) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }
});


/* Logout */

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({
    message: "Logged out successfully",
  });
});


/* Send Password Reset OTP */

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email address is required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    /*
      Don't reveal whether an account exists.
    */

    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, an OTP has been sent.",
      });
    }

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    const otpHash = await bcrypt.hash(
      otp,
      10
    );

    await PasswordReset.deleteMany({
      email: normalizedEmail,
    });

    await PasswordReset.create({
      email: normalizedEmail,

      otpHash,

      expiresAt:
        new Date(
          Date.now() +
          10 * 60 * 1000
        ),
    });

    await sendPasswordResetOTP(
      normalizedEmail,
      otp
    );

    return res.status(200).json({
      message:
        "If an account exists with this email, an OTP has been sent.",
    });

  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to process password reset",
    });
  }
});


/* Verify OTP */

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const resetRequest =
      await PasswordReset.findOne({
        email: normalizedEmail,
      }).sort({
        createdAt: -1,
      });

    if (!resetRequest) {
      return res.status(400).json({
        message:
          "OTP not found. Please request a new OTP.",
      });
    }

    if (
      resetRequest.expiresAt < new Date()
    ) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(400).json({
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    const otpCorrect =
      await bcrypt.compare(
        otp,
        resetRequest.otpHash
      );

    if (!otpCorrect) {
      return res.status(400).json({
        message:
          "Enter the correct OTP",
      });
    }

    resetRequest.verified = true;

    await resetRequest.save();

    return res.status(200).json({
      message:
        "OTP verified successfully",
    });

  } catch (error) {

    console.error(
      "OTP verification error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
});
/* Reset Password */

router.post("/reset-password", async (req, res) => {
  try {
    const {
      email,
      newPassword,
      confirmPassword,
    } = req.body;

    /* Check required fields */

    if (
      !email ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }


    /* Check password match */

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }


    /* Password length */

    if (newPassword.length < 8) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters",
      });
    }


    /* Normalize email */

    const normalizedEmail = email
      .trim()
      .toLowerCase();


    /* Find verified OTP request */

    const resetRequest =
      await PasswordReset.findOne({
        email: normalizedEmail,
        verified: true,
      }).sort({
        createdAt: -1,
      });


    /* OTP was not verified */

    if (!resetRequest) {
      return res.status(400).json({
        message:
          "Please verify your OTP first",
      });
    }


    /* Check OTP expiry */

    if (
      resetRequest.expiresAt < new Date()
    ) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(400).json({
        message:
          "Password reset session has expired. Please request a new OTP.",
      });
    }


    /* Find existing user in users collection */

    const user = await User.findOne({
      email: normalizedEmail,
    });


    if (!user) {
      return res.status(404).json({
        message:
          "Unable to find the user account",
      });
    }


    /* Hash new password */

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );


    /* Replace old password */

    user.password = hashedPassword;


    /* Save updated user */

    await user.save();


    /* Delete used password reset record */

    await PasswordReset.deleteMany({
      email: normalizedEmail,
    });


    /* Success */

    return res.status(200).json({
      message:
        "Password updated successfully",
    });

  } catch (error) {

    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to reset password",
    });
  }
});


export default router;