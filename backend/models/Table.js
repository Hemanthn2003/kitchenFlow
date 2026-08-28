import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "OCCUPIED",
        "BILL_REQUESTED",
      ],
      default: "AVAILABLE",
      trim: true,
      uppercase: true,
    },

    waiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    billRequestedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "tables",
  }
);

const Table =
  mongoose.models.Table ||
  mongoose.model("Table", tableSchema);

export default Table;