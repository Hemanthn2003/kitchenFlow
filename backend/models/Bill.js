import mongoose from "mongoose";

/* =========================================================
   BILL ITEM SCHEMA

   We store the item name and price as they were at the
   moment the bill was generated.

   This means old bills will NOT change if the Manager
   changes the menu price later.
   ========================================================= */

const billItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
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

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);


/* =========================================================
   BILL SCHEMA
   ========================================================= */

const billSchema = new mongoose.Schema(
  {
    /* -------------------------------------------------------
       BILL NUMBER
       ------------------------------------------------------- */

    billNumber: {
      type: Number,
      required: true,
      unique: true,
    },


    /* -------------------------------------------------------
       TABLE
       ------------------------------------------------------- */

    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    tableNumber: {
      type: Number,
      required: true,
    },


    /* -------------------------------------------------------
       WAITER
       ------------------------------------------------------- */

    waiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    waiterName: {
      type: String,
      required: true,
      trim: true,
    },


    /* -------------------------------------------------------
       ORDERS INCLUDED IN THIS BILL
       ------------------------------------------------------- */

    orderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],


    /* -------------------------------------------------------
       BILL ITEMS
       ------------------------------------------------------- */

    items: {
      type: [billItemSchema],
      default: [],
    },


    /* -------------------------------------------------------
       AMOUNTS
       ------------------------------------------------------- */

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },


    /* -------------------------------------------------------
       PAYMENT
       ------------------------------------------------------- */

    paymentMethod: {
      type: String,

      enum: [
        "CASH",
        "CARD",
        "UPI",
        "OTHER",
      ],

      default: "CASH",
      uppercase: true,
      trim: true,
    },

    paymentStatus: {
      type: String,

      enum: [
        "PENDING",
        "PAID",
        "CANCELLED",
      ],

      default: "PENDING",
      uppercase: true,
      trim: true,
    },


    /* -------------------------------------------------------
       WHO GENERATED THE BILL
       ------------------------------------------------------- */

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    /* -------------------------------------------------------
       BILL GENERATION TIME
       ------------------------------------------------------- */

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "bills",
  }
);


/* =========================================================
   MODEL
   ========================================================= */

const Bill =
  mongoose.models.Bill ||
  mongoose.model("Bill", billSchema);

export default Bill;