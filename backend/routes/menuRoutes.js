import express from "express";

import MenuItem from "../models/MenuItem.js";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   GET ALL MENU ITEMS
   GET /api/menu
   ========================================================= */

router.get(
  "/",
  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const menuItems =
        await MenuItem.find({})
          .sort({
            category: 1,
            name: 1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        menuItems,
      });
    } catch (error) {
      console.error(
        "Get menu items error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch menu items",
      });
    }
  }
);

/* =========================================================
   ADD NEW MENU ITEM
   POST /api/menu
   ========================================================= */

router.post(
  "/",
  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const {
        name,
        category,
        price,
        imageUrl,
        isAvailable,
      } = req.body;

      /* =====================================================
         VALIDATION
         ===================================================== */

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Dish name is required",
        });
      }

      if (
        !category ||
        !category.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Dish category is required",
        });
      }

      if (
        price === undefined ||
        price === null ||
        Number.isNaN(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid price is required",
        });
      }

      /* =====================================================
         CREATE MENU ITEM
         ===================================================== */

      const menuItem =
        await MenuItem.create({
          name: name.trim(),

          category:
            category.trim(),

          price: Number(price),

          imageUrl:
            typeof imageUrl === "string"
              ? imageUrl.trim()
              : "",

          isAvailable:
            typeof isAvailable ===
            "boolean"
              ? isAvailable
              : true,
        });

      return res.status(201).json({
        success: true,
        message:
          "Menu item added successfully",
        menuItem,
      });
    } catch (error) {
      console.error(
        "Add menu item error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to add menu item",
      });
    }
  }
);

/* =========================================================
   UPDATE MENU AVAILABILITY
   PATCH /api/menu/:id/availability
   ========================================================= */

router.patch(
  "/:id/availability",
  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const {
        isAvailable,
      } = req.body;

      if (
        typeof isAvailable !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isAvailable must be true or false",
        });
      }

      const menuItem =
        await MenuItem.findByIdAndUpdate(
          req.params.id,

          {
            $set: {
              isAvailable,
            },
          },

          {
            new: true,
            runValidators: true,
          }
        ).lean();

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message:
            "Menu item not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Menu availability updated",
        menuItem,
      });
    } catch (error) {
      console.error(
        "Menu availability update error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update menu availability",
      });
    }
  }
);

export default router;