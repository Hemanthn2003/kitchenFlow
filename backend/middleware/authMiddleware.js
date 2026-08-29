import jwt from "jsonwebtoken";
import User from "../models/Users.js";


/* =========================================================
   AUTHENTICATE
   ========================================================= */

export const authenticate =
  async (
    req,
    res,
    next
  ) => {

    try {

      const token =
        req.cookies.accessToken;


      if (!token) {

        return res
          .status(401)
          .json({
            message:
              "Authentication required",
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
        ).select(
          "-password"
        );


      if (!user) {

        return res
          .status(401)
          .json({
            message:
              "User not found",
          });

      }


      /*
        Only deny the request if the user
        represented by THIS token is inactive.
      */

      if (!user.isActive) {

        return res
          .status(401)
          .json({
            message:
              "User is no longer active",
          });

      }


      req.user = {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          String(
            user.role || ""
          )
            .trim()
            .toUpperCase(),

        isActive:
          user.isActive,

        currentTable:
          user.currentTable,

      };


      next();

    } catch (error) {

      console.error(
        "Authentication error:",
        error
      );


      return res
        .status(401)
        .json({
          message:
            "Invalid or expired access token",
        });

    }

  };


/* =========================================================
   AUTHORIZE ROLES
   ========================================================= */

export const authorizeRoles =
  (...roles) => {

    const allowedRoles =
      roles.map(
        (role) =>
          String(
            role || ""
          )
            .trim()
            .toUpperCase()
      );


    return (
      req,
      res,
      next
    ) => {

      if (!req.user) {

        return res
          .status(401)
          .json({
            message:
              "Authentication required",
          });

      }


      const userRole =
        String(
          req.user.role || ""
        )
          .trim()
          .toUpperCase();


      if (
        !allowedRoles.includes(
          userRole
        )
      ) {

        return res
          .status(403)
          .json({
            message:
              "Access denied",
          });

      }


      next();

    };

  };