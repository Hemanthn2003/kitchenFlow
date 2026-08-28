import express from "express";
import mongoose from "mongoose";

import Table from "../models/Table.js";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import User from "../models/Users.js";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();


/* =========================================================
   HELPERS
   ========================================================= */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


/* =========================================================
   GET CURRENT WAITER
   =========================================================

   GET /api/waiter/me

   Returns the currently logged-in waiter.
   ========================================================= */

router.get(
  "/me",
  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {
      const userId =
        req.user?.id ||
        req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unable to identify waiter",
        });
      }

      const waiter =
        await User.findById(userId)
          .select(
            "_id name email role imageUrl profileImage isActive currentTable lastActiveAt"
          )
          .lean();

      if (!waiter) {
        return res.status(404).json({
          success: false,
          message: "Waiter not found",
        });
      }

      return res.status(200).json({
        success: true,
        waiter,
      });

    } catch (error) {
      console.error(
        "Waiter profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to fetch waiter profile",
      });
    }
  }
);


/* =========================================================
   GET ALL TABLES
   =========================================================

   GET /api/waiter/tables

   Waiter can see:
   - AVAILABLE tables
   - Tables occupied by another waiter
   - Tables occupied by themselves
   - BILL_REQUESTED tables

   The waiter can only operate on their own tables.
   ========================================================= */

router.get(
  "/tables",
  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {
      const userId =
        req.user?.id ||
        req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unable to identify waiter",
        });
      }

      const tables =
        await Table.find({})
          .sort({
            tableNumber: 1,
          })
          .populate({
            path: "waiterId",
            select:
              "_id name email role imageUrl profileImage isActive",
          })
          .lean();


      const formattedTables =
        tables.map((table) => {

          const ownedByMe =
            table.waiterId &&
            String(
              table.waiterId._id
            ) === String(userId);


          return {
            ...table,

            ownedByMe,

            waiter:
              table.waiterId
                ? {
                    _id:
                      table.waiterId._id,

                    name:
                      table.waiterId.name,

                    email:
                      table.waiterId.email,

                    role:
                      table.waiterId.role,

                    imageUrl:
                      table.waiterId.imageUrl ||
                      table.waiterId.profileImage ||
                      "",
                  }
                : null,
          };
        });


      return res.status(200).json({
        success: true,

        tables:
          formattedTables,

        counts: {
          total:
            formattedTables.length,

          available:
            formattedTables.filter(
              (table) =>
                !table.waiterId
            ).length,

          myTables:
            formattedTables.filter(
              (table) =>
                table.ownedByMe
            ).length,

          taken:
            formattedTables.filter(
              (table) =>
                table.waiterId &&
                !table.ownedByMe
            ).length,
        },
      });

    } catch (error) {
      console.error(
        "Waiter tables error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to fetch tables",
      });
    }
  }
);


/* =========================================================
   PICK UP TABLE
   =========================================================

   POST /api/waiter/tables/:id/pickup

   IMPORTANT:
   This uses an atomic query.

   Only a table that STILL has:
      waiterId: null
   can be picked.

   This prevents two waiters from picking
   the same table at the same time.
   ========================================================= */

router.post(
  "/tables/:id/pickup",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {
      const tableId =
        req.params.id;

      const userId =
        req.user?.id ||
        req.user?._id;


      if (
        !isValidObjectId(
          tableId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid table ID",
        });
      }


      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unable to identify waiter",
        });
      }


      /* -----------------------------------------------------
         VERIFY WAITER
         ----------------------------------------------------- */

      const waiter =
        await User.findOne({
          _id: userId,
          role: "WAITER",
          isActive: true,
        }).lean();


      if (!waiter) {
        return res.status(403).json({
          success: false,
          message:
            "Only an active waiter can pick a table",
        });
      }


      /* -----------------------------------------------------
         ATOMIC PICKUP

         This is the critical part.

         The table MUST still have waiterId = null.
         ----------------------------------------------------- */

      const table =
        await Table.findOneAndUpdate(

          {
            _id: tableId,

            waiterId: null,

            status: "AVAILABLE",
          },

          {
            $set: {
              status: "OCCUPIED",

              waiterId: userId,

              assignedAt: new Date(),

              billRequestedAt: null,
            },
          },

          {
           returnDocument: "after",
            runValidators: true,
          }
        );


      /* -----------------------------------------------------
         SOMEONE ELSE TOOK IT
         ----------------------------------------------------- */

      if (!table) {

        const currentTable =
          await Table.findById(
            tableId
          )
            .populate({
              path: "waiterId",
              select:
                "_id name email role",
            })
            .lean();


        if (!currentTable) {
          return res.status(404).json({
            success: false,
            message: "Table not found",
          });
        }


        return res.status(409).json({
          success: false,

          message:
            currentTable.waiterId
              ? `Table ${currentTable.tableNumber} is already taken by ${currentTable.waiterId.name}.`
              : "This table is no longer available.",

          table:
            currentTable,
        });
      }


      /* -----------------------------------------------------
         UPDATE WAITER CURRENT TABLE

         We keep this for compatibility with the
         existing Manager dashboard.

         Since a waiter can have multiple tables,
         currentTable represents the most recently
         picked table.
         ----------------------------------------------------- */

      await User.findByIdAndUpdate(
        userId,

        {
          $set: {
            currentTable:
              table.tableNumber,
          },
        },

        {
          runValidators: true,
        }
      );


      return res.status(200).json({
        success: true,

        message:
          `Table ${table.tableNumber} picked successfully`,

        table,
      });

    } catch (error) {
      console.error(
        "Table pickup error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to pick table",
      });
    }
  }
);


/* =========================================================
   DROP TABLE
   =========================================================

   POST /api/waiter/tables/:id/drop

   Only the waiter who owns the table can drop it.

   IMPORTANT:
   A waiter cannot drop a table that already has
   a bill request.
   ========================================================= */

router.post(
  "/tables/:id/drop",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {
      const tableId =
        req.params.id;

      const userId =
        req.user?.id ||
        req.user?._id;


      if (
        !isValidObjectId(
          tableId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid table ID",
        });
      }


      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unable to identify waiter",
        });
      }


      /* -----------------------------------------------------
         ONLY OWNER CAN DROP
         ----------------------------------------------------- */

      const table =
        await Table.findOne({
          _id: tableId,
          waiterId: userId,
        });


      if (!table) {
        return res.status(403).json({
          success: false,
          message:
            "You do not own this table",
        });
      }


      if (
        table.status ===
        "BILL_REQUESTED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This table has already requested checkout and cannot be dropped.",
        });
      }


      /* -----------------------------------------------------
         CHECK ACTIVE ORDERS

         Do not allow dropping a table that already
         has active orders.
         ----------------------------------------------------- */

      const activeOrders =
        await Order.countDocuments({
          tableId: table._id,

          status: {
            $in: [
              "ORDERED",
              "PROCESSING",
              "READY",
              "COOKED",
            ],
          },
        });


      if (activeOrders > 0) {
        return res.status(400).json({
          success: false,

          message:
            "This table has active orders and cannot be dropped.",
        });
      }


      /* -----------------------------------------------------
         RELEASE TABLE
         ----------------------------------------------------- */

      table.status =
        "AVAILABLE";

      table.waiterId =
        null;

      table.assignedAt =
        null;

      table.billRequestedAt =
        null;

      await table.save();


      /* -----------------------------------------------------
         UPDATE USER

         Only clear currentTable if this was
         the current table.
         ----------------------------------------------------- */

      const waiter =
        await User.findById(
          userId
        );


      if (
        waiter &&
        Number(waiter.currentTable) ===
          Number(table.tableNumber)
      ) {
        waiter.currentTable =
          null;

        await waiter.save();
      }


      return res.status(200).json({
        success: true,

        message:
          `Table ${table.tableNumber} dropped successfully`,

        table,
      });

    } catch (error) {
      console.error(
        "Drop table error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to drop table",
      });
    }
  }
);


/* =========================================================
   GET MY PICKED TABLES
   =========================================================

   GET /api/waiter/my-tables

   Only tables belonging to the logged-in waiter.

   Tables are retained while they are:
   - OCCUPIED
   - BILL_REQUESTED

   They disappear after the table is released.
   ========================================================= */

router.get(
  "/my-tables",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {
      const userId =
        req.user?.id ||
        req.user?._id;


      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unable to identify waiter",
        });
      }


      const tables =
        await Table.find({
          waiterId: userId,

          status: {
            $in: [
              "OCCUPIED",
              "BILL_REQUESTED",
            ],
          },
        })
          .sort({
            tableNumber: 1,
          })
          .lean();


      return res.status(200).json({
        success: true,
        tables,
      });

    } catch (error) {
      console.error(
        "My tables error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch picked tables",
      });
    }
  }
);


/* =========================================================
   GET MENU ITEMS
   =========================================================

   GET /api/waiter/menu-items

   Only available dishes are returned.
   ========================================================= */

router.get(
  "/menu-items",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {

      const menuItems =
        await MenuItem.find({
          isAvailable: true,
        })
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
        "Waiter menu error:",
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
   GET ORDERS FOR A TABLE
   =========================================================

   GET /api/waiter/tables/:id/orders

   Only the waiter who owns the table can view
   its operational orders.
   ========================================================= */

router.get(
  "/tables/:id/orders",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {

      const tableId =
        req.params.id;

      const userId =
        req.user?.id ||
        req.user?._id;


      if (
        !isValidObjectId(
          tableId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid table ID",
        });
      }


      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unable to identify waiter",
        });
      }


      /* -----------------------------------------------------
         VERIFY OWNERSHIP
         ----------------------------------------------------- */

      const table =
        await Table.findOne({
          _id: tableId,
          waiterId: userId,
        }).lean();


      if (!table) {
        return res.status(403).json({
          success: false,
          message:
            "You do not own this table",
        });
      }


      const orders =
        await Order.find({
          tableId: table._id,

          status: {
            $ne: "NEW",
          },
        })
          .sort({
            createdAt: -1,
          })
          .lean();


      return res.status(200).json({
        success: true,

        table,

        orders,
      });

    } catch (error) {
      console.error(
        "Waiter table orders error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch table orders",
      });
    }
  }
);


/* =========================================================
   PLACE ORDER
   =========================================================

   POST /api/waiter/orders

   Body:

   {
     "tableId": "...",

     "items": [
       {
         "menuItemId": "...",
         "quantity": 2,
         "instruction": "Less spicy"
       }
     ]
   }

   The backend obtains the REAL price from MenuItem.

   The waiter cannot manipulate the price from frontend.
   ========================================================= */

router.post(
  "/orders",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {

      const userId =
        req.user?.id ||
        req.user?._id;

      const tableId =
        req.body?.tableId;

      const requestedItems =
        req.body?.items;


      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Unable to identify waiter",
        });
      }


      if (
        !isValidObjectId(
          tableId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid tableId is required",
        });
      }


      if (
        !Array.isArray(
          requestedItems
        ) ||
        requestedItems.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one item is required",
        });
      }


      /* -----------------------------------------------------
         VERIFY TABLE OWNERSHIP
         ----------------------------------------------------- */

      const table =
        await Table.findOne({
          _id: tableId,

          waiterId: userId,

          status: {
            $in: [
              "OCCUPIED",
              "BILL_REQUESTED",
            ],
          },
        });


      if (!table) {
        return res.status(403).json({
          success: false,
          message:
            "You do not own this table",
        });
      }


      if (
        table.status ===
        "BILL_REQUESTED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This table is already in checkout",
        });
      }


      /* -----------------------------------------------------
         NORMALIZE REQUESTED ITEMS
         ----------------------------------------------------- */

      const normalizedItems =
        requestedItems.map(
          (item) => {

            const menuItemId =
              item?.menuItemId;

            const quantity =
              Number(
                item?.quantity
              );

            const instruction =
              String(
                item?.instruction || ""
              ).trim();


            return {
              menuItemId,

              quantity,

              instruction,
            };
          }
        );


      /* -----------------------------------------------------
         VALIDATE ITEM IDS / QUANTITIES
         ----------------------------------------------------- */

      for (
        const item of normalizedItems
      ) {

        if (
          !isValidObjectId(
            item.menuItemId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid menu item ID",
          });
        }


        if (
          !Number.isInteger(
            item.quantity
          ) ||
          item.quantity < 1
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Quantity must be at least 1",
          });
        }


        if (
          item.quantity > 99
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Quantity cannot exceed 99",
          });
        }
      }


      /* -----------------------------------------------------
         FETCH MENU ITEMS

         Only available items can be ordered.
         ----------------------------------------------------- */

      const menuItemIds =
        normalizedItems.map(
          (item) =>
            item.menuItemId
        );


      const menuItems =
        await MenuItem.find({
          _id: {
            $in: menuItemIds,
          },

          isAvailable: true,
        }).lean();


      if (
        menuItems.length !==
        normalizedItems.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected menu items are unavailable",
        });
      }


      const menuMap =
        new Map();


      menuItems.forEach(
        (item) => {

          menuMap.set(
            String(item._id),
            item
          );
        }
      );


      /* -----------------------------------------------------
         BUILD ORDER ITEMS

         Price comes from DB.
         ----------------------------------------------------- */

      const orderItems =
        normalizedItems.map(
          (item) => {

            const menuItem =
              menuMap.get(
                String(
                  item.menuItemId
                )
              );


            return {

              menuItemId:
                menuItem._id,

              name:
                menuItem.name,

              quantity:
                item.quantity,

              instruction:
                item.instruction,

              unitPrice:
                Number(
                  menuItem.price
                ),
            };
          }
        );


      /* -----------------------------------------------------
         CREATE ORDER
         ----------------------------------------------------- */

      const order =
        await Order.create({

          tableId:
            table._id,

          createdBy:
            userId,

          status:
            "ORDERED",

          items:
            orderItems,
        });


      return res.status(201).json({

        success: true,

        message:
          "Order sent to kitchen",

        order,
      });

    } catch (error) {

      console.error(
        "Place waiter order error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to place order",
      });
    }
  }
);


/* =========================================================
   SERVE ORDER
   =========================================================

   PATCH /api/waiter/orders/:id/serve

   Only READY orders can become SERVED.
   Only the waiter who created the order can serve it.
   ========================================================= */

router.patch(
  "/orders/:id/serve",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {

      const orderId =
        req.params.id;

      const userId =
        req.user?.id ||
        req.user?._id;


      if (
        !isValidObjectId(
          orderId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }


      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Unable to identify waiter",
        });
      }


      const order =
        await Order.findOne({
          _id: orderId,

          createdBy: userId,

          status: "READY",
        });


      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Ready order not found or this order does not belong to you",
        });
      }


      order.status =
        "SERVED";


      await order.save();


      return res.status(200).json({
        success: true,

        message:
          "Order marked as served",

        order,
      });

    } catch (error) {

      console.error(
        "Serve order error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to serve order",
      });
    }
  }
);


/* =========================================================
   REQUEST CHECKOUT
   =========================================================

   POST /api/waiter/tables/:id/request-checkout

   Only SERVED orders are considered for checkout.

   The waiter does NOT generate the bill.

   The Manager will generate the final bill.
   ========================================================= */

router.post(
  "/tables/:id/request-checkout",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {

      const tableId =
        req.params.id;

      const userId =
        req.user?.id ||
        req.user?._id;


      if (
        !isValidObjectId(
          tableId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid table ID",
        });
      }


      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Unable to identify waiter",
        });
      }


      /* -----------------------------------------------------
         VERIFY TABLE OWNER
         ----------------------------------------------------- */

      const table =
        await Table.findOne({
          _id: tableId,

          waiterId: userId,

          status: "OCCUPIED",
        });


      if (!table) {
        return res.status(404).json({
          success: false,
          message:
            "Table not found or not owned by you",
        });
      }


      /* -----------------------------------------------------
         GET ORDERS
         ----------------------------------------------------- */

      const orders =
        await Order.find({
          tableId: table._id,

          createdBy: userId,

          status: "SERVED",
        })
          .sort({
            createdAt: 1,
          })
          .lean();


      if (
        orders.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "There are no served orders available for checkout",
        });
      }


      /* -----------------------------------------------------
         CHANGE TABLE STATUS
         ----------------------------------------------------- */

      table.status =
        "BILL_REQUESTED";

      table.billRequestedAt =
        new Date();


      await table.save();


      return res.status(200).json({
        success: true,

        message:
          `Checkout requested for Table ${table.tableNumber}`,

        table,

        orders,
      });

    } catch (error) {

      console.error(
        "Checkout request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to request checkout",
      });
    }
  }
);


/* =========================================================
   GET CHECKOUT DATA FOR MY TABLE
   =========================================================

   GET /api/waiter/tables/:id/checkout

   Useful if waiter needs to see what will be sent
   to Manager.
   ========================================================= */

router.get(
  "/tables/:id/checkout",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {
    try {

      const tableId =
        req.params.id;

      const userId =
        req.user?.id ||
        req.user?._id;


      if (
        !isValidObjectId(
          tableId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid table ID",
        });
      }


      const table =
        await Table.findOne({
          _id: tableId,

          waiterId: userId,

          status: {
            $in: [
              "OCCUPIED",
              "BILL_REQUESTED",
            ],
          },
        }).lean();


      if (!table) {
        return res.status(404).json({
          success: false,
          message:
            "Table not found",
        });
      }


      const orders =
        await Order.find({
          tableId: table._id,

          createdBy: userId,

          status: "SERVED",
        })
          .sort({
            createdAt: 1,
          })
          .lean();


      const items = [];


      orders.forEach(
        (order) => {

          if (
            Array.isArray(
              order.items
            )
          ) {

            order.items.forEach(
              (item) => {

                items.push({
                  menuItemId:
                    item.menuItemId,

                  name:
                    item.name,

                  quantity:
                    Number(
                      item.quantity
                    ) || 1,

                  unitPrice:
                    Number(
                      item.unitPrice
                    ) || 0,

                  total:
                    (
                      Number(
                        item.quantity
                      ) || 1
                    ) *
                    (
                      Number(
                        item.unitPrice
                      ) || 0
                    ),
                });

              }
            );
          }

        }
      );


      const total =
        items.reduce(
          (sum, item) =>
            sum + item.total,
          0
        );


      return res.status(200).json({

        success: true,

        table,

        orders,

        items,

        total,
      });

    } catch (error) {

      console.error(
        "Checkout data error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch checkout data",
      });
    }
  }
);


/* =========================================================
   EXPORT
   ========================================================= */

export default router;