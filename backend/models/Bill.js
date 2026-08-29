import mongoose from "mongoose";


/* =========================================================
   BILL ITEM SCHEMA
   ========================================================= */

const billItemSchema =
  new mongoose.Schema(
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


      totalPrice: {
        type: Number,
        required: true,
        min: 0,
      },


      instruction: {
        type: String,
        default: "",
        trim: true,
      },
    },

    {
      _id: false,
    }
  );


/* =========================================================
   BILL SCHEMA
   ========================================================= */

const billSchema =
  new mongoose.Schema(
    {
      /* =====================================================
         BILL NUMBER
         ===================================================== */

      billNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
      },


      /* =====================================================
         TABLE
         ===================================================== */

      tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
        required: true,
      },


      tableNumber: {
        type: Number,
        required: true,
      },


      /* =====================================================
         WAITER

         Waiter who handled the customer/table.
         ===================================================== */

      waiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },


      /* =====================================================
         MANAGER

         Null until a manager generates/finalizes
         the bill.
         ===================================================== */

      managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },


      /* =====================================================
         ORDERS INCLUDED IN BILL
         ===================================================== */

      orderIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      ],


      /* =====================================================
         BILL ITEMS
         ===================================================== */

      items: {
        type: [billItemSchema],
        default: [],
      },


      /* =====================================================
         AMOUNTS
         ===================================================== */

      subtotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },


      totalAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },


      /* =====================================================
         BILL WORKFLOW STATUS

         CHECKOUT
           → waiter requested billing

         GENERATED
           → manager generated/reviewed bill

         PAID
           → payment completed
         ===================================================== */

      status: {
        type: String,

        enum: [
          "CHECKOUT",
          "GENERATED",
          "PAID",
          "CANCELLED",
        ],

        default: "CHECKOUT",

        uppercase: true,

        trim: true,
      },


      /* =====================================================
         PAYMENT STATUS
         ===================================================== */

      paymentStatus: {
        type: String,

        enum: [
          "UNPAID",
          "PAID",
        ],

        default: "UNPAID",

        uppercase: true,

        trim: true,
      },


      /* =====================================================
         PAYMENT METHOD
         ===================================================== */

      paymentMethod: {
        type: String,

        enum: [
          "CASH",
          "CARD",
          "UPI",
        ],

        default: null,

        uppercase: true,

        trim: true,
      },


      /* =====================================================
         TIMESTAMPS FOR BILL WORKFLOW
         ===================================================== */

      checkoutAt: {
        type: Date,
        default: null,
      },


      generatedAt: {
        type: Date,
        default: null,
      },


      paidAt: {
        type: Date,
        default: null,
      },
    },


    /* =====================================================
       MONGOOSE OPTIONS
       ===================================================== */

    {
      timestamps: true,

      collection: "bills",
    }
  );


/* =========================================================
   INDEXES
   ========================================================= */

billSchema.index({
  waiterId: 1,
  createdAt: -1,
});


billSchema.index({
  tableId: 1,
  status: 1,
});


billSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});


/* =========================================================
   MODEL
   ========================================================= */

const Bill =
  mongoose.models.Bill ||
  mongoose.model(
    "Bill",
    billSchema
  );


export default Bill;