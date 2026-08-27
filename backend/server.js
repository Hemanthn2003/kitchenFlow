import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";

/* =========================================================
   PATH SETUP
   ========================================================= */

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

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
   APP
   ========================================================= */

const app = express();

const PORT =
  process.env.PORT || 5000;

/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
  cors({
    origin:
      "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  express.json()
);

app.use(
  cookieParser()
);

/* =========================================================
   BASIC ROUTE
   ========================================================= */

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "KitchenFlow API is running",
    });
  }
);

/* =========================================================
   AUTH ROUTES
   ========================================================= */

app.use(
  "/api/auth",
  authRoutes
);

/* =========================================================
   MANAGER ROUTES
   ========================================================= */

app.use(
  "/api/manager",
  managerRoutes
);

/* =========================================================
   ORDER ROUTES
   ========================================================= */

app.use(
  "/api/orders",
  orderRoutes
);

/* =========================================================
   MENU ROUTES
   ========================================================= */

app.use(
  "/api/menu",
  menuRoutes
);

/* =========================================================
   API 404 HANDLER
   ========================================================= */

app.use(
  "/api",
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        `API route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);

/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled server error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);

/* =========================================================
   MONGODB
   ========================================================= */

const connectDB =
  async () => {
    try {
      if (
        !process.env.MONGODB_URI
      ) {
        throw new Error(
          "MONGODB_URI is not defined"
        );
      }

      await mongoose.connect(
        process.env.MONGODB_URI
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

startServer();