import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

import User from "./models/Users.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({
  path: path.join(__dirname, "../.env"),
});


const testLogin = async () => {

  try {

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("MongoDB connected");

    console.log(
      "Database:",
      mongoose.connection.name
    );

    console.log(
      "Collection:",
      User.collection.name
    );


    const email =
      "waiter@kitchenflow.com";

    const password =
      "Waiter@123";


    console.log(
      "Searching:",
      email
    );


    const user = await User.findOne({
      email: email.toLowerCase(),
    });


    if (!user) {

      console.log(
        "❌ USER NOT FOUND"
      );

      await mongoose.disconnect();

      return;
    }


    console.log(
      "✅ USER FOUND"
    );

    console.log(
      "Name:",
      user.name
    );

    console.log(
      "Email:",
      user.email
    );

    console.log(
      "Role:",
      user.role
    );

    console.log(
      "Active:",
      user.isActive
    );

    console.log(
      "Password hash exists:",
      Boolean(user.password)
    );


    const passwordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );


    console.log(
      "Password matches:",
      passwordCorrect
    );


    if (passwordCorrect) {

      console.log(
        "✅ EMAIL AND PASSWORD ARE CORRECT"
      );

    } else {

      console.log(
        "❌ PASSWORD DOES NOT MATCH THE HASH"
      );

    }


    await mongoose.disconnect();

  } catch (error) {

    console.error(
      "Test failed:",
      error
    );

  }

};


testLogin();