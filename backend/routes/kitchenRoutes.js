import express from "express";

import Order from "../models/Order.js";
import Table from "../models/Table.js";
import Users from "../models/Users.js";
import MenuItem from "../models/MenuItem.js";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();


/* =========================================================
   GET KITCHEN ORDERS

   GET /api/kitchen/orders

   Kitchen sees only:

   ORDERED
   PROCESSING

   COOKED orders are not returned.
   ========================================================= */

router.get(
  "/orders",
  authenticate,
  authorizeRoles("KITCHEN"),

  async (req, res) => {
    try {
      const orders =
        await Order.find({
          status: {
            $in: [
              "ORDERED",
              "PROCESSING",
            ],
          },
        })
          .sort({
            createdAt: 1,
          })
          .lean();


      /* =====================================================
         TABLE INFORMATION
         ===================================================== */

      const tableIds =
        orders
          .map(
            (order) =>
              order.tableId
          )
          .filter(Boolean);


      const tables =
        tableIds.length > 0
          ? await Table.find({
              _id: {
                $in: tableIds,
              },
            })
              .select(
                "_id tableNumber"
              )
              .lean()
          : [];


      const tableMap =
        new Map();


      tables.forEach(
        (table) => {
          tableMap.set(
            String(
              table._id
            ),
            table
          );
        }
      );


      /* =====================================================
         WAITER INFORMATION
         ===================================================== */

      const waiterIds =
        orders
          .map(
            (order) =>
              order.createdBy
          )
          .filter(Boolean);


      const waiters =
        waiterIds.length > 0
          ? await Users.find({
              _id: {
                $in: waiterIds,
              },
            })
              .select(
                "_id name email imageUrl"
              )
              .lean()
          : [];


      const waiterMap =
        new Map();


      waiters.forEach(
        (waiter) => {
          waiterMap.set(
            String(
              waiter._id
            ),
            waiter
          );
        }
      );


      /* =====================================================
         MENU ITEM INFORMATION
         
         Order items only store menuItemId.
         The actual imageUrl is stored in MenuItem.
         ===================================================== */

      const menuItemIds = [
        ...new Set(
          orders
            .flatMap(
              (order) =>
                Array.isArray(
                  order.items
                )
                  ? order.items.map(
                      (item) =>
                        item?.menuItemId
                    )
                  : []
            )
            .filter(Boolean)
            .map(
              (id) =>
                String(id)
            )
        ),
      ];


      const menuItems =
        menuItemIds.length > 0
          ? await MenuItem.find({
              _id: {
                $in: menuItemIds,
              },
            })
              .select(
                "_id name imageUrl"
              )
              .lean()
          : [];


      const menuItemMap =
        new Map();


      menuItems.forEach(
        (menuItem) => {
          menuItemMap.set(
            String(
              menuItem._id
            ),
            menuItem
          );
        }
      );


      /* =====================================================
         ENRICH ORDERS
         ===================================================== */

      const enrichedOrders =
        orders.map(
          (order) => {
            const table =
              tableMap.get(
                String(
                  order.tableId
                )
              );


            const waiter =
              waiterMap.get(
                String(
                  order.createdBy
                )
              );


            /* =================================================
               ENRICH EACH ORDER ITEM WITH MENU IMAGE
               ================================================= */

            const enrichedItems =
              Array.isArray(
                order.items
              )
                ? order.items.map(
                    (item) => {
                      const menuItem =
                        menuItemMap.get(
                          String(
                            item?.menuItemId
                          )
                        );


                      return {
                        ...item,

                        /*
                          Keep the original
                          order item name.
                        */
                        name:
                          item?.name ||
                          menuItem?.name ||
                          "Unknown Dish",

                        /*
                          This is the important
                          field for KitchenOrderList.
                        */
                        imageUrl:
                          menuItem?.imageUrl ||
                          "",
                      };
                    }
                  )
                : [];


            return {
              ...order,

              items:
                enrichedItems,

              tableNumber:
                table?.tableNumber ??
                null,

              createdByUser:
                waiter
                  ? {
                      _id:
                        waiter._id,

                      name:
                        waiter.name,

                      email:
                        waiter.email,

                      imageUrl:
                        waiter.imageUrl ||
                        "",
                    }
                  : null,

              displayStatus:
                order.status,
            };
          }
        );


      return res.status(200).json({
        success: true,

        orders:
          enrichedOrders,
      });
    } catch (error) {
      console.error(
        "Kitchen orders error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to fetch kitchen orders",
      });
    }
  }
);


/* =========================================================
   UPDATE KITCHEN ORDER STATUS

   PATCH
   /api/kitchen/orders/:id/status

   Allowed transitions:

   ORDERED
      ↓
   PROCESSING

   PROCESSING
      ↓
   COOKED
   ========================================================= */

router.patch(
  "/orders/:id/status",
  authenticate,
  authorizeRoles("KITCHEN"),

  async (req, res) => {
    try {
      const orderId =
        req.params.id;


      const requestedStatus =
        String(
          req.body?.status || ""
        )
          .trim()
          .toUpperCase();


      /* =====================================================
         VALID STATUS
         ===================================================== */

      if (
        requestedStatus !==
          "PROCESSING" &&
        requestedStatus !==
          "COOKED"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid kitchen order status",
        });
      }


      /* =====================================================
         FIND ORDER
         ===================================================== */

      const order =
        await Order.findById(
          orderId
        );


      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found",
        });
      }


      const currentStatus =
        String(
          order.status || ""
        )
          .trim()
          .toUpperCase();


      /* =====================================================
         ORDERED → PROCESSING
         ===================================================== */

      if (
        requestedStatus ===
          "PROCESSING" &&
        currentStatus !==
          "ORDERED"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Only ORDERED orders can be started",
        });
      }


      /* =====================================================
         PROCESSING → COOKED
         ===================================================== */

      if (
        requestedStatus ===
          "COOKED" &&
        currentStatus !==
          "PROCESSING"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Only PROCESSING orders can be marked as prepared",
        });
      }


      /* =====================================================
         UPDATE STATUS
         ===================================================== */

      order.status =
        requestedStatus;


      /*
       * These fields are optional.
       *
       * If your Order schema does not contain them,
       * Mongoose will simply ignore them because they
       * are not defined in the schema.
       */

      if (
        requestedStatus ===
        "PROCESSING"
      ) {
        order.processingAt =
          new Date();
      }


      if (
        requestedStatus ===
        "COOKED"
      ) {
        order.cookedAt =
          new Date();
      }


      await order.save();


      return res.status(200).json({
        success: true,

        message:
          requestedStatus ===
          "PROCESSING"
            ? "Order preparation started"
            : "Order marked as prepared",

        order: {
          ...order.toObject(),

          displayStatus:
            requestedStatus,
        },
      });
    } catch (error) {
      console.error(
        "Kitchen status update error:",
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