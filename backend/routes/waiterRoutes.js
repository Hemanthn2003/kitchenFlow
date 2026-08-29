import express from "express";

import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import Bill from "../models/Bill.js";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();


/* =========================================================
   HELPER
   ========================================================= */

const generateBillNumber = () => {

  const timestamp =
    Date.now().toString();

  const random =
    Math.floor(
      1000 +
      Math.random() * 9000
    );

  return `KF-${timestamp}-${random}`;
};


/* =========================================================
   GET ALL TABLES

   GET /api/waiter/tables
   ========================================================= */

router.get(
  "/tables",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const tables =
        await Table.find({})
          .populate(
            "waiterId",
            "name imageUrl"
          )
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
        "Get waiter tables error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch tables",
      });

    }

  }
);


/* =========================================================
   PICK TABLE

   PATCH /api/waiter/tables/:id/pick
   ========================================================= */

router.patch(
  "/tables/:id/pick",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const waiterId =
        req.user.id;


      /* =====================================================
         IMPORTANT

         Atomic update prevents two waiters
         from picking the same table.
         ===================================================== */

      const table =
        await Table.findOneAndUpdate(

          {
            _id:
              req.params.id,

            status:
              "AVAILABLE",
          },

          {
            $set: {
              status:
                "OCCUPIED",

              waiterId,

              assignedAt:
                new Date(),

              billRequestedAt:
                null,
            },
          },

          {
            returnDocument:
              "after",

            runValidators:
              true,
          }
        )
          .populate(
            "waiterId",
            "name imageUrl"
          )
          .lean();


      if (!table) {

        return res.status(409).json({
          success: false,

          message:
            "This table is no longer available",
        });

      }


      return res.status(200).json({

        success: true,

        message:
          "Table picked successfully",

        table,

      });

    } catch (error) {

      console.error(
        "Pick table error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to pick table",

      });

    }

  }
);


/* =========================================================
   DROP TABLE

   PATCH /api/waiter/tables/:id/drop

   Only possible when the waiter owns
   the table and there is no checkout request.
   ========================================================= */

router.patch(
  "/tables/:id/drop",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const waiterId =
        req.user.id;


      const activeOrders =
        await Order.exists({

          tableId:
            req.params.id,

          status: {
            $in: [
              "ORDERED",
              "PROCESSING",
              "READY",
            ],
          },

        });


      if (activeOrders) {

        return res.status(400).json({

          success: false,

          message:
            "Cannot drop a table with active orders",

        });

      }


      const table =
        await Table.findOneAndUpdate(

          {

            _id:
              req.params.id,

            waiterId,

            status:
              "OCCUPIED",

          },

          {

            $set: {

              status:
                "AVAILABLE",

              waiterId:
                null,

              assignedAt:
                null,

              billRequestedAt:
                null,

            },

          },

          {

            returnDocument:
              "after",

            runValidators:
              true,

          }
        ).lean();


      if (!table) {

        return res.status(404).json({

          success: false,

          message:
            "Table not found or not assigned to you",

        });

      }


      return res.status(200).json({

        success:
          true,

        message:
          "Table dropped successfully",

        table,

      });

    } catch (error) {

      console.error(
        "Drop table error:",
        error
      );

      return res.status(500).json({

        success:
          false,

        message:
          "Unable to drop table",

      });

    }

  }
);


/* =========================================================
   GET MY PICKED TABLES

   GET /api/waiter/my-tables
   ========================================================= */

router.get(
  "/my-tables",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const waiterId =
        req.user.id;


      const tables =
        await Table.find({

          waiterId,

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

        success:
          true,

        tables,

      });

    } catch (error) {

      console.error(
        "Get picked tables error:",
        error
      );

      return res.status(500).json({

        success:
          false,

        message:
          "Unable to fetch picked tables",

      });

    }

  }
);


/* =========================================================
   GET AVAILABLE MENU

   GET /api/waiter/menu
   ========================================================= */

router.get(
  "/menu",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const menuItems =
        await MenuItem.find({

          isAvailable:
            true,

        })
          .sort({

            category:
              1,

            name:
              1,

          })
          .lean();


      return res.status(200).json({

        success:
          true,

        menuItems,

      });

    } catch (error) {

      console.error(
        "Waiter menu error:",
        error
      );

      return res.status(500).json({

        success:
          false,

        message:
          "Unable to fetch menu",

      });

    }

  }
);


/* =========================================================
   GET TABLE ORDERS

   GET /api/waiter/tables/:id/orders
   ========================================================= */

router.get(
  "/tables/:id/orders",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const waiterId =
        req.user.id;


      const table =
        await Table.findOne({

          _id:
            req.params.id,

          waiterId,

        }).lean();


      if (!table) {

        return res.status(403).json({

          success:
            false,

          message:
            "You do not own this table",

        });

      }


      const orders =
        await Order.find({

          tableId:
            req.params.id,

        })
          .sort({

            createdAt:
              -1,

          })
          .lean();


      return res.status(200).json({

        success:
          true,

        orders,

      });

    } catch (error) {

      console.error(
        "Get table orders error:",
        error
      );

      return res.status(500).json({

        success:
          false,

        message:
          "Unable to fetch orders",

      });

    }

  }
);


/* =========================================================
   CREATE ORDER

   POST /api/waiter/tables/:id/orders

   Multiple orders can be created
   for the same table.
   ========================================================= */

router.post(
  "/tables/:id/orders",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const waiterId =
        req.user.id;

      const tableId =
        req.params.id;

      const {
        items,
      } =
        req.body;


      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "At least one menu item is required",

        });

      }


      const table =
        await Table.findOne({

          _id:
            tableId,

          waiterId,

          status:
            "OCCUPIED",

        }).lean();


      if (!table) {

        return res.status(403).json({

          success:
            false,

          message:
            "You cannot place an order for this table",

        });

      }


      const menuItemIds =
        items.map(
          (item) =>
            item.menuItemId
        );


      const menuItems =
        await MenuItem.find({

          _id: {
            $in:
              menuItemIds,
          },

          isAvailable:
            true,

        }).lean();


      const menuMap =
        new Map();


      menuItems.forEach(
        (menuItem) => {

          menuMap.set(

            String(
              menuItem._id
            ),

            menuItem

          );

        }
      );


      const orderItems =
        [];


      for (
        const requestedItem
        of items
      ) {

        const menuItem =
          menuMap.get(

            String(
              requestedItem.menuItemId
            )

          );


        if (!menuItem) {

          return res.status(400).json({

            success:
              false,

            message:
              "One or more menu items are unavailable",

          });

        }


        const quantity =
          Number(
            requestedItem.quantity
          );


        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity < 1
        ) {

          return res.status(400).json({

            success:
              false,

            message:
              "Invalid item quantity",

          });

        }


        orderItems.push({

          menuItemId:
            menuItem._id,

          name:
            menuItem.name,

          quantity,

          instruction:
            typeof
              requestedItem.instruction ===
              "string"

              ? requestedItem
                  .instruction
                  .trim()

              : "",

          unitPrice:
            Number(
              menuItem.price
            ),

        });

      }


      const order =
        await Order.create({

          tableId,

          createdBy:
            waiterId,

          status:
            "ORDERED",

          items:
            orderItems,

        });


      return res.status(201).json({

        success:
          true,

        message:
          "Order placed successfully",

        order,

      });

    } catch (error) {

      console.error(
        "Create waiter order error:",
        error
      );

      return res.status(500).json({

        success:
          false,

        message:
          "Unable to place order",

      });

    }

  }
);


/* =========================================================
   MARK ORDER AS SERVED

   PATCH /api/waiter/orders/:id/serve
   ========================================================= */

router.patch(
  "/orders/:id/serve",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const waiterId =
        req.user.id;


      const order =
        await Order.findOneAndUpdate(

          {

            _id:
              req.params.id,

            createdBy:
              waiterId,

            status:
              "READY",

          },

          {

            $set: {

              status:
                "SERVED",

            },

          },

          {

            returnDocument:
              "after",

            runValidators:
              true,

          }
        ).lean();


      if (!order) {

        return res.status(404).json({

          success:
            false,

          message:
            "Ready order not found",

        });

      }


      return res.status(200).json({

        success:
          true,

        message:
          "Order served successfully",

        order,

      });

    } catch (error) {

      console.error(
        "Serve order error:",
        error
      );

      return res.status(500).json({

        success:
          false,

        message:
          "Unable to serve order",

      });

    }

  }
);


/* =========================================================
   CHECKOUT TABLE

   POST /api/waiter/tables/:id/checkout

   Includes all served orders that have not
   previously been added to a bill.
   ========================================================= */

router.post(
  "/tables/:id/checkout",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const waiterId =
        req.user.id;

      const tableId =
        req.params.id;


      const table =
        await Table.findOne({

          _id:
            tableId,

          waiterId,

          status:
            "OCCUPIED",

        }).lean();


      if (!table) {

        return res.status(403).json({

          success:
            false,

          message:
            "You cannot checkout this table",

        });

      }


      const existingBill =
        await Bill.findOne({

          tableId,

          status: {
            $in: [
              "CHECKOUT",
              "GENERATED",
            ],
          },

        }).lean();


      if (existingBill) {

        return res.status(400).json({

          success:
            false,

          message:
            "A bill is already being processed for this table",

        });

      }


      const orders =
        await Order.find({

          tableId,

          createdBy:
            waiterId,

          status:
            "SERVED",

        }).lean();


      if (
        orders.length === 0
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "No served orders available for checkout",

        });

      }


      const billItems =
        [];


      orders.forEach(
        (order) => {

          order.items.forEach(
            (item) => {

              const quantity =
                Number(
                  item.quantity
                ) || 1;

              const unitPrice =
                Number(
                  item.unitPrice
                ) || 0;

              billItems.push({

                menuItemId:
                  item.menuItemId,

                name:
                  item.name,

                quantity,

                unitPrice,

                totalPrice:
                  quantity *
                  unitPrice,

                instruction:
                  item.instruction ||
                  "",

              });

            }
          );

        }
      );


      const subtotal =
        billItems.reduce(

          (
            total,
            item
          ) =>

            total +
            Number(
              item.totalPrice
            ),

          0

        );


      const bill =
        await Bill.create({

          billNumber:
            generateBillNumber(),

          tableId,

          tableNumber:
            table.tableNumber,

          waiterId,

          orderIds:
            orders.map(
              (order) =>
                order._id
            ),

          items:
            billItems,

          subtotal,

          totalAmount:
            subtotal,

          status:
            "CHECKOUT",

          paymentStatus:
            "UNPAID",

          checkoutAt:
            new Date(),

        });


      await Table.findByIdAndUpdate(

        tableId,

        {

          $set: {

            status:
              "BILL_REQUESTED",

            billRequestedAt:
              new Date(),

          },

        },

        {

          returnDocument:
            "after",

        }

      );


      return res.status(201).json({

        success:
          true,

        message:
          "Checkout request sent to manager",

        bill,

      });

    } catch (error) {

      console.error(
        "Checkout error:",
        error
      );

      return res.status(500).json({

        success:
          false,

        message:
          "Unable to checkout table",

      });

    }

  }
);


/* =========================================================
   GET WAITER BILLS

   GET /api/waiter/bills

   Only the logged-in waiter's bills.
   Default history = 30 days.

   Optional:
   ?date=YYYY-MM-DD
   ?billNumber=KF-...
   ========================================================= */

router.get(
  "/bills",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const waiterId =
        req.user.id;

      const {
        date,
        billNumber,
      } =
        req.query;


      const query = {

        waiterId,

      };


      /* =====================================================
         BILL NUMBER SEARCH
         ===================================================== */

      if (
        billNumber &&
        String(
          billNumber
        ).trim()
      ) {

        query.billNumber =
          String(
            billNumber
          )
            .trim()
            .toUpperCase();

      }


      /* =====================================================
         DATE FILTER

         Exact date if provided.

         Otherwise last 30 days.
         ===================================================== */

      if (
        date &&
        String(
          date
        ).trim()
      ) {

        const selectedDate =
          new Date(
            `${date}T00:00:00`
          );


        const nextDate =
          new Date(
            selectedDate
          );


        nextDate.setDate(
          nextDate.getDate() + 1
        );


        query.createdAt = {

          $gte:
            selectedDate,

          $lt:
            nextDate,

        };

      } else {

        const thirtyDaysAgo =
          new Date();

        thirtyDaysAgo.setDate(
          thirtyDaysAgo.getDate() - 30
        );


        query.createdAt = {

          $gte:
            thirtyDaysAgo,

        };

      }


      const bills =
        await Bill.find(
          query
        )
          .sort({

            createdAt:
              -1,

          })
          .populate(
            "managerId",
            "name"
          )
          .lean();


      return res.status(200).json({

        success:
          true,

        bills,

      });

    } catch (error) {

      console.error(
        "Get waiter bills error:",
        error
      );

      return res.status(500).json({

        success:
          false,

        message:
          "Unable to fetch bills",

      });

    }

  }
);


/* =========================================================
   GET READY ORDERS FOR LOGGED-IN WAITER

   GET /api/waiter/ready-orders

   Frontend can poll this endpoint.
   ========================================================= */

router.get(
  "/ready-orders",

  authenticate,
  authorizeRoles("WAITER"),

  async (req, res) => {

    try {

      const waiterId =
        req.user.id;


      const orders =
        await Order.find({

          createdBy:
            waiterId,

          status:
            "READY",

        })
          .sort({

            updatedAt:
              -1,

          })
          .lean();


      const tableIds =
        orders.map(
          (order) =>
            order.tableId
        );


      const tables =
        await Table.find({

          _id: {
            $in:
              tableIds,
          },

        }).lean();


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


      const enrichedOrders =
        orders.map(
          (order) => ({

            ...order,

            tableNumber:
              tableMap.get(
                String(
                  order.tableId
                )
              )
                ?.tableNumber ||
              null,

          })
        );


      return res.status(200).json({

        success:
          true,

        orders:
          enrichedOrders,

      });

    } catch (error) {

      console.error(
        "Get ready orders error:",
        error
      );

      return res.status(500).json({

        success:
          false,

        message:
          "Unable to fetch ready orders",

      });

    }

  }
);


/* =========================================================
   GET LOGGED-IN WAITER BILLS

   GET /api/waiter/bills

   OPTIONAL QUERY PARAMETERS:

   ?date=2026-08-30
   ?billNumber=KF-00001

   SECURITY:

   The waiter can ONLY see bills where:

   bill.waiterId === req.user.id

   DEFAULT:

   Only bills from the last 30 days.
   ========================================================= */

router.get(
  "/bills",

  authenticate,

  authorizeRoles("WAITER"),

  async (
    req,
    res
  ) => {

    try {

      const {
        date,
        billNumber,
      } =
        req.query;


      /* =====================================================
         BASE QUERY

         IMPORTANT:

         Never accept waiterId from frontend.

         Always use logged-in waiter ID.
         ===================================================== */

      const query = {

        waiterId:
          req.user.id,

      };


      /* =====================================================
         DEFAULT 30 DAY HISTORY

         If no specific date is requested,
         only show the last 30 days.
         ===================================================== */

      if (
        !date
      ) {

        const thirtyDaysAgo =
          new Date();

        thirtyDaysAgo.setDate(
          thirtyDaysAgo.getDate() - 30
        );


        query.createdAt = {

          $gte:
            thirtyDaysAgo,

        };

      }


      /* =====================================================
         DATE FILTER

         Expected format:

         YYYY-MM-DD

         Example:

         2026-08-30
         ===================================================== */

      if (
        date &&
        String(date).trim()
      ) {

        const selectedDate =
          new Date(
            `${String(date).trim()}T00:00:00`
          );


        if (
          Number.isNaN(
            selectedDate.getTime()
          )
        ) {

          return res
            .status(400)
            .json({

              success:
                false,

              message:
                "Invalid date",

            });

        }


        const nextDate =
          new Date(
            selectedDate
          );

        nextDate.setDate(
          nextDate.getDate() + 1
        );


        query.createdAt = {

          $gte:
            selectedDate,

          $lt:
            nextDate,

        };

      }


      /* =====================================================
         BILL NUMBER FILTER
         ===================================================== */

      if (
        billNumber &&
        String(
          billNumber
        ).trim()
      ) {

        query.billNumber =
          String(
            billNumber
          )
            .trim()
            .toUpperCase();

      }


      /* =====================================================
         FETCH BILLS
         ===================================================== */

      const bills =
        await Bill.find(
          query
        )
          .sort({

            createdAt:
              -1,

          })
          .populate({

            path:
              "tableId",

            select:
              "_id tableNumber status",

          })
          .populate({

            path:
              "managerId",

            select:
              "_id name email role",

          })
          .lean();


      /* =====================================================
         RETURN
         ===================================================== */

      return res
        .status(200)
        .json({

          success:
            true,

          count:
            bills.length,

          bills,

        });

    } catch (
      error
    ) {

      console.error(
        "Waiter bills fetch error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to fetch waiter bills",

        });

    }

  }
);

export default router;