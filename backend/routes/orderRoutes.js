import express from "express";

import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Table from "../models/Table.js";
import User from "../models/Users.js";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   GET ALL ORDERS FOR MANAGER
   GET /api/orders
   ========================================================= */

router.get(
  "/",
  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const orders = await Order.find({})
        .sort({
          createdAt: -1,
        })
        .lean();

      const tables = await Table.find({}).lean();

      const menuItems = await MenuItem.find({}).lean();

      const users = await User.find({})
        .select("_id name email role")
        .lean();

      /* =====================================================
         LOOKUP MAPS
         ===================================================== */

      const tableMap = new Map();

      tables.forEach((table) => {
        tableMap.set(
          String(table._id),
          table
        );
      });

      const menuMap = new Map();

      menuItems.forEach((item) => {
        menuMap.set(
          String(item._id),
          item
        );
      });

      const userMap = new Map();

      users.forEach((user) => {
        userMap.set(
          String(user._id),
          user
        );
      });

      /* =====================================================
         ENRICH ORDERS
         ===================================================== */

      const enrichedOrders = orders.map(
        (order) => {
          const table = tableMap.get(
            String(order.tableId)
          );

          const createdBy = userMap.get(
            String(order.createdBy)
          );

          let displayStatus = String(
            order.status || "NEW"
          )
            .trim()
            .toUpperCase();

          /*
             Database READY = UI COOKED
          */

          if (displayStatus === "READY") {
            displayStatus = "COOKED";
          }

          const items = Array.isArray(
            order.items
          )
            ? order.items
            : [];

          const enrichedItems = items.map(
            (item) => {
              const menuItem =
                menuMap.get(
                  String(item.menuItemId)
                );

              return {
                ...item,

                name:
                  item.name ||
                  menuItem?.name ||
                  "Unknown Dish",

                imageUrl:
                  item.imageUrl ||
                  item.image ||
                  menuItem?.imageUrl ||
                  "",

                quantity:
                  Number(item.quantity) || 1,

                instruction:
                  item.instruction || "",

                unitPrice:
                  Number(item.unitPrice) || 0,
              };
            }
          );

          const total =
            enrichedItems.reduce(
              (sum, item) =>
                sum +
                (Number(item.unitPrice) || 0) *
                  (Number(item.quantity) || 1),
              0
            );

          return {
            ...order,

            tableNumber:
              table?.tableNumber ?? null,

            createdByUser: createdBy
              ? {
                  _id: createdBy._id,
                  name: createdBy.name,
                  email: createdBy.email,
                  role: createdBy.role,
                }
              : null,

            displayStatus,

            items: enrichedItems,

            total,
          };
        }
      );

      return res.status(200).json({
        success: true,
        orders: enrichedOrders,
      });
    } catch (error) {
      console.error(
        "Manager orders error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch orders",
      });
    }
  }
);

/* =========================================================
   UPDATE ORDER STATUS
   PATCH /api/orders/:id/status
   ========================================================= */

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const requestedStatus = String(
        req.body?.status || ""
      )
        .trim()
        .toUpperCase();

      const allowedStatuses = [
        "ORDERED",
        "PROCESSING",
        "COOKED",
        "SERVED",
      ];

      if (
        !allowedStatuses.includes(
          requestedStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status",
        });
      }

      /*
         Manager UI uses COOKED.
         Database can continue using READY.
      */

      const databaseStatus =
        requestedStatus === "COOKED"
          ? "READY"
          : requestedStatus;

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,

          {
            $set: {
              status: databaseStatus,
            },
          },

          {
            new: true,
            runValidators: true,
          }
        ).lean();

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Order status updated",
        status: requestedStatus,
        order,
      });
    } catch (error) {
      console.error(
        "Order status update error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update order status",
      });
    }
  }
);

export default router;