import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    /* =======================================================
       NAME
       ======================================================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },


    /* =======================================================
       EMAIL
       ======================================================= */

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },


    /* =======================================================
       PASSWORD
       ======================================================= */

    password: {
      type: String,
      required: true,
    },


    /* =======================================================
       ROLE
       ======================================================= */

    role: {
      type: String,

      required: true,

      enum: [
        "ADMIN",
        "MANAGER",
        "KITCHEN",
        "WAITER",
      ],

      uppercase: true,

      trim: true,
    },


    /* =======================================================
       PROFILE IMAGE
       =======================================================

       Store the Cloudinary/image URL here.

       Example:

       imageUrl:
       "https://res.cloudinary.com/...."

       Existing users will simply have:

       imageUrl: ""

       until an image is uploaded.
       ======================================================= */

    imageUrl: {
      type: String,

      default: "",

      trim: true,
    },


    /* =======================================================
       ACTIVE STATUS
       =======================================================

       true  = currently logged in

       false = currently logged out
       ======================================================= */

    isActive: {
      type: Boolean,

      default: false,
    },


    /* =======================================================
       CURRENT TABLE
       =======================================================

       Mainly used for Waiters.

       Example:

       currentTable: 5

       When no table is assigned:

       currentTable: null
       ======================================================= */

    currentTable: {
      type: Number,

      default: null,
    },


    /* =======================================================
       LAST ACTIVE TIME
       =======================================================

       Last time the employee's activity
       was updated.
       ======================================================= */

    lastActiveAt: {
      type: Date,

      default: null,
    },


    /* =======================================================
       LAST LOGIN TIME
       =======================================================

       Updated whenever login is successful.
       ======================================================= */

    lastLoginAt: {
      type: Date,

      default: null,
    },


    /* =======================================================
       LAST LOGOUT TIME
       =======================================================

       Updated whenever logout is successful.
       ======================================================= */

    lastLogoutAt: {
      type: Date,

      default: null,
    },

  },


  /* =========================================================
     MONGOOSE OPTIONS
     ========================================================= */

  {
    timestamps: true,

    collection: "users",
  }
);


/* ===========================================================
   CREATE / GET USER MODEL
   =========================================================== */

const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    userSchema
  );


export default User;