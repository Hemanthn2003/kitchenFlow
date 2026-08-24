import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,

    // Password reset records will be stored here
    collection: "passwordresets",
  }
);

const PasswordReset = mongoose.model(
  "PasswordReset",
  passwordResetSchema
);

export default PasswordReset;