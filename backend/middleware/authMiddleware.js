import jwt from "jsonwebtoken";
import User from "../models/Users.js";


/* =========================================================
   AUTHENTICATE
   ========================================================= */

export const authenticate = async (
  req,
  res,
  next
) => {
  try {

    /* Get access token from cookie */

    const token =
      req.cookies.accessToken;


    if (!token) {
      return res.status(401).json({
        message:
          "Authentication required",
      });
    }


    /* Verify JWT */

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );


    /* Find user */

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


    /* Check whether user is active */

    if (!user.isActive) {
      return res.status(401).json({
        message:
          "User is no longer active",
      });
    }


    /* Update last activity */

    user.lastActiveAt =
      new Date();

    await user.save();


    /* Store authenticated user */

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      currentTable:
        user.currentTable,
    };


    next();

  } catch (error) {

    console.error(
      "Authentication error:",
      error
    );


    return res.status(401).json({
      message:
        "Invalid or expired access token",
    });
  }
};


/* =========================================================
   AUTHORIZE ROLES
   ========================================================= */

export const authorizeRoles = (
  ...roles
) => {

  return (
    req,
    res,
    next
  ) => {

    /* Make sure authentication happened */

    if (!req.user) {
      return res.status(401).json({
        message:
          "Authentication required",
      });
    }


    /* Check user's role */

    if (
      !roles.includes(
        req.user.role
      )
    ) {

      return res.status(403).json({
        message:
          "Access denied",
      });
    }


    next();
  };
};