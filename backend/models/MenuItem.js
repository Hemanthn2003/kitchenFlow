import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
      Image URL/path.
      Existing menu items can have this empty.
    */
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    /*
      Manager can control whether
      the dish is available.
    */
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "menuItems",
  }
);


/*
  Prevent OverwriteModelError when
  the server reloads.
*/
const MenuItem =
  mongoose.models.MenuItem ||
  mongoose.model(
    "MenuItem",
    menuItemSchema
  );


export default MenuItem;