import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);


/* Load Environment Variables */

dotenv.config({
  path: path.join(
    __dirname,
    "../.env"
  ),
});


/* App */

const app = express();

const PORT =
  process.env.PORT || 5000;


/* Middleware */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());


/* Routes */

app.get("/", (req, res) => {
  res.json({
    message:
      "KitchenFlow API is running",
  });
});

app.use(
  "/api/auth",
  authRoutes
);


/* MongoDB */

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
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


/* Start Server */

const startServer = async () => {
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