import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

/* =========================================================
   ROUTE IMPORTS
   ========================================================= */

import authRoutes from "./routes/authRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import waiterRoutes from "./routes/waiterRoutes.js";


/* =========================================================
   PATH SETUP
   ========================================================= */

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );


/* =========================================================
   LOAD ENVIRONMENT VARIABLES
   ========================================================= */

dotenv.config({
  path: path.join(
    __dirname,
    "../.env"
  ),
});


/* =========================================================
   EXPRESS APP
   ========================================================= */

const app =
  express();


const PORT =
  process.env.PORT ||
  5000;


/* =========================================================
   CORS
   ========================================================= */

app.use(
  cors({
    origin:
      "http://localhost:5173",

    credentials:
      true,
  })
);


/* =========================================================
   BODY PARSER
   ========================================================= */

app.use(
  express.json()
);


/* =========================================================
   COOKIE PARSER
   ========================================================= */

app.use(
  cookieParser()
);


/* =========================================================
   BASIC API ROUTE
   ========================================================= */

app.get(
  "/",

  (req, res) => {

    return res.status(200).json({
      success:
        true,

      message:
        "KitchenFlow API is running",
    });

  }
);


/* =========================================================
   AUTH ROUTES

   BASE:
   /api/auth
   ========================================================= */

app.use(
  "/api/auth",

  authRoutes
);


/* =========================================================
   MANAGER ROUTES

   BASE:
   /api/manager
   ========================================================= */

app.use(
  "/api/manager",

  managerRoutes
);


/* =========================================================
   ORDER ROUTES

   BASE:
   /api/orders
   ========================================================= */

app.use(
  "/api/orders",

  orderRoutes
);


/* =========================================================
   MENU ROUTES

   BASE:
   /api/menu
   ========================================================= */

app.use(
  "/api/menu",

  menuRoutes
);


/* =========================================================
   WAITER ROUTES

   BASE:
   /api/waiter

   IMPORTANT:
   This MUST come before the API 404 handler.
   ========================================================= */

app.use(
  "/api/waiter",

  waiterRoutes
);


/* =========================================================
   API 404 HANDLER

   IMPORTANT:
   This MUST be after ALL API routes.

   Otherwise it can intercept requests intended
   for routes registered below it.
   ========================================================= */

app.use(
  "/api",

  (req, res) => {

    return res.status(404).json({
      success:
        false,

      message:
        `API route not found: ${req.method} ${req.originalUrl}`,
    });

  }
);




/* =========================================================
   GLOBAL ERROR HANDLER

   This MUST be after all routes.
   ========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "Unhandled server error:",
      error
    );


    return res.status(500).json({
      success:
        false,

      message:
        "Internal server error",
    });

  }
);


/* =========================================================
   MONGODB CONNECTION
   ========================================================= */

const connectDB =
  async () => {

    try {

      if (
        !process.env
          .MONGODB_URI
      ) {

        throw new Error(
          "MONGODB_URI is not defined"
        );

      }


      await mongoose.connect(
        process.env
          .MONGODB_URI
      );


      console.log(
        "MongoDB connected successfully"
      );


      console.log(
        `Database: ${mongoose.connection.name}`
      );

    } catch (error) {

      console.error(
        "MongoDB connection failed"
      );


      console.error(
        error.message
      );


      process.exit(1);

    }

  };


/* =========================================================
   START SERVER
   ========================================================= */

const startServer =
  async () => {

    await connectDB();


    app.listen(
      PORT,

      () => {

        console.log(
          `KitchenFlow server running on port ${PORT}`
        );

      }
    );

  };


/* =========================================================
   START APPLICATION
   ========================================================= */

startServer();