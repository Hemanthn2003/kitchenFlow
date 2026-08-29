import mongoose from "mongoose";


/* =========================================================
   ORDER ITEM SCHEMA
   ========================================================= */

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    instruction: {
      type: String,
      default: "",
      trim: true,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },

  {
    /*
      Your existing order items do NOT show
      their own _id, so don't generate one.
    */
    _id: false,
  }
);


/* =========================================================
   ORDER SCHEMA
   ========================================================= */

const orderSchema = new mongoose.Schema(
  {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    status: {
  type: String,

  enum: [
    "NEW",
    "ORDERED",
    "PROCESSING",
    "READY",
    "COOKED",
    "SERVED",
    "ORDER_COMPLETED",
  ],

  default: "NEW",

  uppercase: true,

  trim: true,
},

    items: {
      type: [orderItemSchema],

      default: [],
    },
  },

  {
    timestamps: true,

    /*
      VERY IMPORTANT:
      This matches your existing MongoDB collection.
    */
    collection: "orders",
  }
);


/* =========================================================
   MONGOOSE MODEL
   ========================================================= */

const Order =
  mongoose.models.Order ||
  mongoose.model(
    "Order",
    orderSchema
  );


export default Order;