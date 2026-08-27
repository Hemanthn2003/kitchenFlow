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
      default: "AVAILABLE",
      trim: true,
      uppercase: true,
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