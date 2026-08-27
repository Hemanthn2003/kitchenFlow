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

import {
  sendPasswordResetOTP,
} from "../utils/email.js";


const router = express.Router();


/* =========================================================
   COOKIE SETTINGS
   ========================================================= */

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge,
});


/* =========================================================
   LOGIN
   ========================================================= */

router.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password,
        rememberMe,
      } = req.body;


      /* -----------------------------------------------
         Validate input
         ----------------------------------------------- */

      if (!email || !password) {

        return res.status(400).json({
          message:
            "Email and password are required",
        });
      }


      /* -----------------------------------------------
         Normalize email
         ----------------------------------------------- */

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      /* -----------------------------------------------
         Find user
         ----------------------------------------------- */

      const user =
        await User.findOne({
          email: normalizedEmail,
        });


      if (!user) {

        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }


      /* -----------------------------------------------
         Compare password
         ----------------------------------------------- */

      const passwordCorrect =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!passwordCorrect) {

        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }


      /* -----------------------------------------------
         Normalize role
         
         This protects us if an old database
         record contains "Manager", "Kitchen",
         "Waiter", etc.
         ----------------------------------------------- */

      const normalizedRole =
        user.role
          ?.toString()
          .trim()
          .toUpperCase();


      const allowedRoles = [
        "ADMIN",
        "MANAGER",
        "KITCHEN",
        "WAITER",
      ];


      if (
        !allowedRoles.includes(
          normalizedRole
        )
      ) {

        return res.status(403).json({
          message:
            "Invalid user role",
        });
      }


      /* -----------------------------------------------
         Make sure database role is normalized
         ----------------------------------------------- */

      user.role =
        normalizedRole;


      /* -----------------------------------------------
         USER IS NOW ONLINE
         ----------------------------------------------- */

      user.isActive = true;

      user.lastActiveAt =
        new Date();


      /*
        If currentTable does not exist
        in an old document, initialize it.
      */

      if (
        user.currentTable ===
        undefined
      ) {

        user.currentTable = null;
      }


      /*
        Mongoose timestamps: true
        automatically updates updatedAt.
        
        DO NOT manually change createdAt.
      */

      await user.save();


      /* -----------------------------------------------
         Generate tokens
         ----------------------------------------------- */

      const accessToken =
        generateAccessToken(
          user
        );


      const refreshToken =
        generateRefreshToken(
          user,
          Boolean(rememberMe)
        );


      /* -----------------------------------------------
         Token expiration
         ----------------------------------------------- */

      const accessMaxAge =
        24 *
        60 *
        60 *
        1000;


      const refreshMaxAge =
        rememberMe
          ? 30 *
            24 *
            60 *
            60 *
            1000
          : 3 *
            24 *
            60 *
            60 *
            1000;


      /* -----------------------------------------------
         Set access token
         ----------------------------------------------- */

      res.cookie(
        "accessToken",
        accessToken,
        getCookieOptions(
          accessMaxAge
        )
      );


      /* -----------------------------------------------
         Set refresh token
         ----------------------------------------------- */

      res.cookie(
        "refreshToken",
        refreshToken,
        getCookieOptions(
          refreshMaxAge
        )
      );


      /* -----------------------------------------------
         Return logged-in user
         ----------------------------------------------- */

      return res.status(200).json({

        message:
          "Login successful",

        user: {

          id: user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          isActive:
            user.isActive,

          currentTable:
            user.currentTable,

          lastActiveAt:
            user.lastActiveAt,

          createdAt:
            user.createdAt,

          updatedAt:
            user.updatedAt,
        },

      });

    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);


/* =========================================================
   REFRESH ACCESS TOKEN
   ========================================================= */

router.post(
  "/refresh",
  async (req, res) => {

    try {

      const refreshToken =
        req.cookies.refreshToken;


      if (!refreshToken) {

        return res.status(401).json({
          message:
            "Refresh token missing",
        });
      }


      const decoded =
        jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );


      const user =
        await User.findById(
          decoded.id
        );


      if (!user) {

        return res.status(401).json({
          message:
            "Invalid refresh token",
        });
      }


      /*
        User must still be active.
      */

      if (!user.isActive) {

        return res.status(401).json({
          message:
            "User is not active",
        });
      }


      /* Update last activity */

      user.lastActiveAt =
        new Date();


      await user.save();


      /* Generate new access token */

      const accessToken =
        generateAccessToken(
          user
        );


      res.cookie(
        "accessToken",
        accessToken,
        getCookieOptions(
          24 *
          60 *
          60 *
          1000
        )
      );


      return res.status(200).json({
        message:
          "Access token refreshed",
      });

    } catch (error) {

      console.error(
        "Refresh token error:",
        error
      );


      return res.status(401).json({
        message:
          "Invalid or expired refresh token",
      });
    }
  }
);


/* =========================================================
   CURRENT USER
   ========================================================= */

router.get(
  "/me",
  async (req, res) => {

    try {

      const token =
        req.cookies.accessToken;


      if (!token) {

        return res.status(401).json({
          message:
            "Not authenticated",
        });
      }


      const decoded =
        jwt.verify(
          token,
          process.env.JWT_ACCESS_SECRET
        );


      const user =
        await User.findById(
          decoded.id
        ).select("-password");


      if (!user) {

        return res.status(401).json({
          message:
            "User not found",
        });
      }


      /*
        If user logged out,
        old token cannot be used.
      */

      if (!user.isActive) {

        return res.status(401).json({
          message:
            "Session is no longer active",
        });
      }


      /* Update activity */

      user.lastActiveAt =
        new Date();


      await user.save();


      return res.status(200).json({
        user,
      });

    } catch (error) {

      return res.status(401).json({
        message:
          "Not authenticated",
      });
    }
  }
);


/* =========================================================
   LOGOUT
   ========================================================= */

router.post(
  "/logout",
  async (req, res) => {

    try {

      const token =
        req.cookies.accessToken;


      /*
        Find the currently logged-in user
        before deleting the cookies.
      */

      if (token) {

        try {

          const decoded =
            jwt.verify(
              token,
              process.env.JWT_ACCESS_SECRET
            );


          const user =
            await User.findById(
              decoded.id
            );


          if (user) {

            /* Employee becomes OFFLINE */

            user.isActive =
              false;


            /*
              If employee was a waiter,
              remove current table assignment.
            */

            user.currentTable =
              null;


            /*
              Record last activity.
            */

            user.lastActiveAt =
              new Date();


            /*
              updatedAt is automatically
              changed by Mongoose.
            */

            await user.save();
          }

        } catch (tokenError) {

          console.log(
            "Unable to identify user during logout."
          );
        }
      }


      /* -----------------------------------------------
         Clear cookies
         ----------------------------------------------- */

      res.clearCookie(
        "accessToken",
        getCookieOptions(0)
      );


      res.clearCookie(
        "refreshToken",
        getCookieOptions(0)
      );


      return res.status(200).json({
        message:
          "Logged out successfully",
      });

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );


      /*
        Always clear cookies.
      */

      res.clearCookie(
        "accessToken",
        getCookieOptions(0)
      );


      res.clearCookie(
        "refreshToken",
        getCookieOptions(0)
      );


      return res.status(200).json({
        message:
          "Logged out successfully",
      });
    }
  }
);


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

router.post(
  "/forgot-password",
  async (req, res) => {

    try {

      const { email } =
        req.body;


      if (!email) {

        return res.status(400).json({
          message:
            "Email address is required",
        });
      }


      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });


      /*
        Don't reveal whether account exists.
      */

      if (!user) {

        return res.status(200).json({
          message:
            "If an account exists with this email, an OTP has been sent.",
        });
      }


      /* Generate OTP */

      const otp =
        crypto
          .randomInt(
            100000,
            1000000
          )
          .toString();


      /* Hash OTP */

      const otpHash =
        await bcrypt.hash(
          otp,
          10
        );


      /* Delete previous OTP */

      await PasswordReset.deleteMany({
        email:
          normalizedEmail,
      });


      /* Create reset request */

      await PasswordReset.create({

        email:
          normalizedEmail,

        otpHash,

        expiresAt:
          new Date(
            Date.now() +
            10 *
            60 *
            1000
          ),
      });


      /* Send OTP */

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
  }
);


/* =========================================================
   VERIFY OTP
   ========================================================= */

router.post(
  "/verify-otp",
  async (req, res) => {

    try {

      const {
        email,
        otp,
      } = req.body;


      if (!email || !otp) {

        return res.status(400).json({
          message:
            "Email and OTP are required",
        });
      }


      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      const resetRequest =
        await PasswordReset.findOne({
          email:
            normalizedEmail,
        }).sort({
          createdAt: -1,
        });


      if (!resetRequest) {

        return res.status(400).json({
          message:
            "OTP not found. Please request a new OTP.",
        });
      }


      /* Check expiry */

      if (
        resetRequest.expiresAt <
        new Date()
      ) {

        await PasswordReset.deleteOne({
          _id:
            resetRequest._id,
        });


        return res.status(400).json({
          message:
            "OTP has expired. Please request a new OTP.",
        });
      }


      /* Compare OTP */

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


      /* Mark verified */

      resetRequest.verified =
        true;


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
        message:
          "Server error",
      });
    }
  }
);


/* =========================================================
   RESET PASSWORD
   ========================================================= */

router.post(
  "/reset-password",
  async (req, res) => {

    try {

      const {
        email,
        newPassword,
        confirmPassword,
      } = req.body;


      /* Required fields */

      if (
        !email ||
        !newPassword ||
        !confirmPassword
      ) {

        return res.status(400).json({
          message:
            "All fields are required",
        });
      }


      /* Password match */

      if (
        newPassword !==
        confirmPassword
      ) {

        return res.status(400).json({
          message:
            "Passwords do not match",
        });
      }


      /* Password length */

      if (
        newPassword.length < 8
      ) {

        return res.status(400).json({
          message:
            "Password must contain at least 8 characters",
        });
      }


      /* Normalize email */

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();


      /* Find verified reset request */

      const resetRequest =
        await PasswordReset.findOne({
          email:
            normalizedEmail,

          verified:
            true,
        }).sort({
          createdAt: -1,
        });


      if (!resetRequest) {

        return res.status(400).json({
          message:
            "Please verify your OTP first",
        });
      }


      /* Check expiry */

      if (
        resetRequest.expiresAt <
        new Date()
      ) {

        await PasswordReset.deleteOne({
          _id:
            resetRequest._id,
        });


        return res.status(400).json({
          message:
            "Password reset session has expired. Please request a new OTP.",
        });
      }


      /* Find user */

      const user =
        await User.findOne({
          email:
            normalizedEmail,
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


      /* Update password */

      user.password =
        hashedPassword;


      await user.save();


      /* Delete used reset requests */

      await PasswordReset.deleteMany({
        email:
          normalizedEmail,
      });


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
  }
);


export default router;