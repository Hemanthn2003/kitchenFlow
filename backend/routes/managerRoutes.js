import express from "express";
import mongoose from "mongoose";

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
   HELPERS
   ========================================================= */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


/* =========================================================
   GET ACTIVE USERS
   =========================================================

   GET /api/manager/active-users

   Returns active:
   - MANAGER
   - WAITER
   - KITCHEN

   ========================================================= */

router.get(
  "/active-users",

  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const activeUsers = await User.find({
        isActive: true,
      })
        .select(
          "_id name email role isActive currentTable lastActiveAt imageUrl profileImage"
        )
        .sort({
          role: 1,
          name: 1,
        })
        .lean();

      const managers = activeUsers.filter(
        (user) => user.role === "MANAGER"
      );

      const waiters = activeUsers.filter(
        (user) => user.role === "WAITER"
      );

      const kitchen = activeUsers.filter(
        (user) => user.role === "KITCHEN"
      );

      return res.status(200).json({
        success: true,

        manager: managers,

        waiters: waiters,

        kitchen: kitchen,

        counts: {
          managers: managers.length,
          waiters: waiters.length,
          kitchen: kitchen.length,
        },
      });
    } catch (error) {
      console.error(
        "Active users error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to fetch active users",
      });
    }
  }
);
/* =========================================================
   ORDER ENRICHMENT HELPER
   ========================================================= */

const getEnrichedOrders = async () => {
  const orders = await Order.find({})
    .sort({
      createdAt: -1,
    })
    .lean();

  const tables = await Table.find({})
    .lean();

  const menuItems = await MenuItem.find({})
    .lean();

  const users = await User.find({})
    .select("_id name email role")
    .lean();


  /* -------------------------------------------------------
     TABLE MAP
     ------------------------------------------------------- */

  const tableMap = new Map();

  tables.forEach((table) => {
    tableMap.set(
      String(table._id),
      table
    );
  });


  /* -------------------------------------------------------
     MENU MAP
     ------------------------------------------------------- */

  const menuMap = new Map();

  menuItems.forEach((item) => {
    menuMap.set(
      String(item._id),
      item
    );
  });


  /* -------------------------------------------------------
     USER MAP
     ------------------------------------------------------- */

  const userMap = new Map();

  users.forEach((user) => {
    userMap.set(
      String(user._id),
      user
    );
  });


  /* -------------------------------------------------------
     ENRICH ORDERS
     ------------------------------------------------------- */

  return orders.map((order) => {
    const table = tableMap.get(
      String(order.tableId)
    );

    const createdBy = userMap.get(
      String(order.createdBy)
    );


    /* -----------------------------------------------------
       DATABASE STATUS
       ----------------------------------------------------- */

    const databaseStatus = String(
      order.status || "ORDERED"
    )
      .trim()
      .toUpperCase();


    /* -----------------------------------------------------
       MANAGER DISPLAY STATUS

       READY in DB = COOKED in Manager UI
       ----------------------------------------------------- */

    let displayStatus =
      databaseStatus;

    if (
      databaseStatus === "READY"
    ) {
      displayStatus = "COOKED";
    }


    /* -----------------------------------------------------
       ORDER ITEMS
       ----------------------------------------------------- */

    const orderItems = Array.isArray(
      order.items
    )
      ? order.items
      : [];


    const enrichedItems =
      orderItems.map((item) => {
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
      });


    /* -----------------------------------------------------
       ORDER TOTAL
       ----------------------------------------------------- */

    const total =
      enrichedItems.reduce(
        (sum, item) => {
          return (
            sum +
            (
              Number(
                item.unitPrice
              ) || 0
            ) *
            (
              Number(
                item.quantity
              ) || 1
            )
          );
        },
        0
      );


    return {
      ...order,

      tableNumber:
        table?.tableNumber ?? null,

      createdByUser:
        createdBy
          ? {
              _id: createdBy._id,
              name: createdBy.name,
              email: createdBy.email,
              role: createdBy.role,
            }
          : null,

      databaseStatus,

      displayStatus,

      items: enrichedItems,

      total,
    };
  });
};

/* =========================================================
   GET ALL TABLES
   =========================================================

   GET /api/manager/tables

   Returns every table and the waiter who picked it.
   ========================================================= */

router.get(
  "/tables",

  authenticate,

  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const tables =
        await Table.find({})
          .sort({
            tableNumber: 1,
          })
          .populate({
            path: "waiterId",
            select:
              "_id name email role isActive",
          })
          .lean();


      const enrichedTables =
        tables.map((table) => ({
          ...table,

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

                  isActive:
                    table.waiterId.isActive,
                }
              : null,
        }));


      return res.status(200).json({
        success: true,

        tables:
          enrichedTables,

        counts: {
          total:
            enrichedTables.length,

          free:
            enrichedTables.filter(
              (table) =>
                !table.waiterId
            ).length,

          occupied:
            enrichedTables.filter(
              (table) =>
                Boolean(
                  table.waiterId
                )
            ).length,
        },
      });

    } catch (error) {

      console.error(
        "Manager tables error:",
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
   GET ALL ORDERS
   =========================================================

   GET /api/manager/orders

   ========================================================= */

router.get(
  "/orders",

  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const enrichedOrders =
        await getEnrichedOrders();

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
        message: "Unable to fetch orders",
      });
    }
  }
);


/* =========================================================
   GET ORDERS - BACKWARD COMPATIBILITY
   =========================================================

   GET /api/manager

   ========================================================= */

router.get(
  "/",

  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const enrichedOrders =
        await getEnrichedOrders();

      return res.status(200).json({
        success: true,
        orders: enrichedOrders,
      });
    } catch (error) {
      console.error(
        "Manager root orders error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to fetch orders",
      });
    }
  }
);


/* =========================================================
   UPDATE ORDER STATUS
   =========================================================

   Manager UI:

   ORDERED
   PROCESSING
   COOKED
   SERVED

   Database:

   ORDERED
   PROCESSING
   READY
   SERVED

   ========================================================= */

const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const orderId =
      req.params.id;


    /* -----------------------------------------------------
       VALIDATE ORDER ID
       ----------------------------------------------------- */

    if (
      !isValidObjectId(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }


    /* -----------------------------------------------------
       READ REQUESTED STATUS
       ----------------------------------------------------- */

    const requestedStatus =
      String(
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
          "Invalid order status. Allowed: ORDERED, PROCESSING, COOKED, SERVED",
      });
    }


    /* -----------------------------------------------------
       CONVERT UI STATUS TO DATABASE STATUS
       ----------------------------------------------------- */

    let databaseStatus =
      requestedStatus;

    if (
      requestedStatus === "COOKED"
    ) {
      databaseStatus = "READY";
    }


    /* -----------------------------------------------------
       UPDATE DATABASE
       ----------------------------------------------------- */

    const updatedOrder =
      await Order.findByIdAndUpdate(
        orderId,

        {
          $set: {
            status: databaseStatus,
          },
        },

        {
         returnDocument: "after",
          runValidators: true,
        }
      ).lean();


    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    return res.status(200).json({
      success: true,

      message:
        "Order status updated successfully",

      status:
        requestedStatus,

      databaseStatus:
        databaseStatus,

      order:
        updatedOrder,
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
};


/* =========================================================
   ORDER STATUS ROUTES
   =========================================================

   Supports BOTH:

   PATCH /api/manager/orders/:id/status

   AND

   PATCH /api/manager/:id/status

   ========================================================= */

router.patch(
  "/orders/:id/status",

  authenticate,
  authorizeRoles("MANAGER"),

  updateOrderStatus
);


router.patch(
  "/:id/status",

  authenticate,
  authorizeRoles("MANAGER"),

  updateOrderStatus
);


/* =========================================================
   GET MENU ITEMS
   =========================================================

   GET /api/manager/menu-items

   ========================================================= */

router.get(
  "/menu-items",

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

        menuItems:
          menuItems,

        items:
          menuItems,
      });

    } catch (error) {
      console.error(
        "Manager menu items error:",
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
   UPDATE MENU AVAILABILITY
   =========================================================

   PATCH:

   /api/manager/menu-items/:id/availability

   Body:

   {
     "isAvailable": true
   }

   OR

   {
     "isAvailable": false
   }

   ========================================================= */

const updateMenuAvailability =
  async (
    req,
    res
  ) => {
    try {
      const menuItemId =
        req.params.id;


      /* -----------------------------------------------------
         VALIDATE ID
         ----------------------------------------------------- */

      if (
        !isValidObjectId(
          menuItemId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid menu item ID",
        });
      }


      /* -----------------------------------------------------
         VALIDATE BOOLEAN
         ----------------------------------------------------- */

      const isAvailable =
        req.body?.isAvailable;


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


      /* -----------------------------------------------------
         UPDATE DATABASE
         ----------------------------------------------------- */

      const updatedMenuItem =
        await MenuItem.findByIdAndUpdate(
          menuItemId,

          {
            $set: {
              isAvailable:
                isAvailable,
            },
          },

          {
           returnDocument: "after",
            runValidators: true,
          }
        ).lean();


      if (!updatedMenuItem) {
        return res.status(404).json({
          success: false,
          message:
            "Menu item not found",
        });
      }


      return res.status(200).json({
        success: true,

        message:
          isAvailable
            ? "Menu item is now available"
            : "Menu item is now unavailable",

        menuItem:
          updatedMenuItem,
      });


    } catch (error) {
      console.error(
        "Menu availability update error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update menu item availability",
      });
    }
  };


/* =========================================================
   AVAILABILITY ROUTE
   ========================================================= */

router.patch(
  "/menu-items/:id/availability",

  authenticate,
  authorizeRoles("MANAGER"),

  updateMenuAvailability
);

/* =========================================================
   UPDATE MENU ITEM

   PATCH:
   /api/manager/menu-items/:id

   Supports updating:
   - name
   - category
   - price
   - imageUrl
   - isAvailable
   ========================================================= */

router.patch(
  "/menu-items/:id",

  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const menuItemId =
        req.params.id;


      /* -----------------------------------------------------
         VALIDATE MENU ITEM ID
         ----------------------------------------------------- */

      if (
        !isValidObjectId(
          menuItemId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid menu item ID",
        });
      }


      /* -----------------------------------------------------
         GET REQUEST DATA
         ----------------------------------------------------- */

      const {
        name,
        category,
        price,
        imageUrl,
        isAvailable,
      } = req.body || {};


      /* -----------------------------------------------------
         BUILD UPDATE OBJECT

         Only fields sent from frontend
         will be updated.
         ----------------------------------------------------- */

      const updateData = {};


      /* =====================================================
         UPDATE NAME
         ===================================================== */

      if (
        name !== undefined
      ) {
        if (
          typeof name !==
          "string"
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Menu item name must be text",
          });
        }


        const trimmedName =
          name.trim();


        if (!trimmedName) {
          return res.status(400).json({
            success: false,

            message:
              "Menu item name cannot be empty",
          });
        }


        updateData.name =
          trimmedName;
      }


      /* =====================================================
         UPDATE CATEGORY
         ===================================================== */

      if (
        category !== undefined
      ) {
        if (
          typeof category !==
          "string"
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Category must be text",
          });
        }


        const trimmedCategory =
          category.trim();


        if (
          !trimmedCategory
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Category cannot be empty",
          });
        }


        updateData.category =
          trimmedCategory;
      }


      /* =====================================================
         UPDATE PRICE
         ===================================================== */

      if (
        price !== undefined
      ) {
        const numericPrice =
          Number(price);


        if (
          !Number.isFinite(
            numericPrice
          ) ||
          numericPrice < 0
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Enter a valid price",
          });
        }


        updateData.price =
          numericPrice;
      }


      /* =====================================================
         UPDATE IMAGE URL
         ===================================================== */

      if (
        imageUrl !== undefined
      ) {
        if (
          imageUrl !== null &&
          typeof imageUrl !==
          "string"
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Invalid image URL",
          });
        }


        updateData.imageUrl =
          String(
            imageUrl || ""
          ).trim();
      }


      /* =====================================================
         UPDATE AVAILABILITY
         ===================================================== */

      if (
        isAvailable !== undefined
      ) {
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


        updateData.isAvailable =
          isAvailable;
      }


      /* =====================================================
         CHECK IF ANY FIELD EXISTS
         ===================================================== */

      if (
        Object.keys(
          updateData
        ).length === 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            "No valid fields were provided for update",
        });
      }


      /* =====================================================
         UPDATE MONGODB
         ===================================================== */

      const updatedMenuItem =
        await MenuItem.findByIdAndUpdate(

          menuItemId,

          {
            $set:
              updateData,
          },

          {
            returnDocument: "after",
            runValidators:true
          }

        ).lean();


      /* =====================================================
         ITEM NOT FOUND
         ===================================================== */

      if (
        !updatedMenuItem
      ) {
        return res.status(404).json({
          success: false,

          message:
            "Menu item not found",
        });
      }


      /* =====================================================
         SUCCESS RESPONSE
         ===================================================== */

      return res.status(200).json({
        success: true,

        message:
          "Menu item updated successfully",

        menuItem:
          updatedMenuItem,

        item:
          updatedMenuItem,
      });


    } catch (error) {
      console.error(
        "Menu item update error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Unable to update menu item",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   ADD NEW MENU ITEM
   =========================================================

   POST:

   /api/manager/menu-items

   Body:

   {
     "name": "Fresh Lime Soda",
     "category": "Beverages",
     "price": 80,
     "imageUrl": "",
     "isAvailable": true
   }

   ========================================================= */

router.post(
  "/menu-items",

  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const name =
        String(
          req.body?.name || ""
        ).trim();


      const category =
        String(
          req.body?.category || ""
        ).trim();


      const price =
        Number(
          req.body?.price
        );


      const imageUrl =
        String(
          req.body?.imageUrl || ""
        ).trim();


      const isAvailable =
        typeof req.body?.isAvailable ===
        "boolean"
          ? req.body.isAvailable
          : true;


      /* -----------------------------------------------------
         VALIDATION
         ----------------------------------------------------- */

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Menu item name is required",
        });
      }


      if (!category) {
        return res.status(400).json({
          success: false,
          message:
            "Category is required",
        });
      }


      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid price is required",
        });
      }


      /* -----------------------------------------------------
         CREATE MENU ITEM
         ----------------------------------------------------- */

      const menuItem =
        await MenuItem.create({
          name,
          category,
          price,
          imageUrl,
          isAvailable,
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
   DELETE MENU ITEM
   =========================================================

   DELETE:

   /api/manager/menu-items/:id

   ========================================================= */

router.delete(
  "/menu-items/:id",

  authenticate,
  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const menuItemId =
        req.params.id;


      if (
        !isValidObjectId(
          menuItemId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid menu item ID",
        });
      }


      const deletedMenuItem =
        await MenuItem.findByIdAndDelete(
          menuItemId
        );


      if (!deletedMenuItem) {
        return res.status(404).json({
          success: false,
          message:
            "Menu item not found",
        });
      }


      return res.status(200).json({
        success: true,

        message:
          "Menu item deleted successfully",
      });


    } catch (error) {
      console.error(
        "Delete menu item error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete menu item",
      });
    }
  }
);

/* =========================================================
   UPDATE COMPLETE MENU ITEM
   =========================================================

   PATCH /api/manager/menu-items/:id

   Updates:
   - name
   - category
   - price
   - imageUrl
   - isAvailable

   ========================================================= */

router.patch(
  "/menu-items/:id",

  authenticate,

  authorizeRoles("MANAGER"),

  async (req, res) => {
    try {
      const menuItemId = req.params.id;

      if (!isValidObjectId(menuItemId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid menu item ID",
        });
      }

      const {
        name,
        category,
        price,
        imageUrl,
        isAvailable,
      } = req.body;


      /* =============================================
         VALIDATION
      ============================================= */

      if (
        !name ||
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Menu item name is required",
        });
      }


      if (
        !category ||
        typeof category !== "string" ||
        !category.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Menu item category is required",
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
          message: "Enter a valid menu item price",
        });
      }


      if (
        isAvailable !== undefined &&
        typeof isAvailable !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isAvailable must be true or false",
        });
      }


      /* =============================================
         UPDATE
      ============================================= */

      const updateData = {
        name: name.trim(),

        category: category.trim(),

        price: Number(price),

        imageUrl:
          typeof imageUrl === "string"
            ? imageUrl.trim()
            : "",
      };


      if (
        typeof isAvailable === "boolean"
      ) {
        updateData.isAvailable =
          isAvailable;
      }


      const updatedMenuItem =
        await MenuItem.findByIdAndUpdate(
          menuItemId,

          {
            $set: updateData,
          },

          {
            returnDocument: "after",

            runValidators: true,
          }
        );


      /* =============================================
         NOT FOUND
      ============================================= */

      if (!updatedMenuItem) {
        return res.status(404).json({
          success: false,
          message:
            "Menu item not found",
        });
      }


      /* =============================================
         SUCCESS
      ============================================= */

      return res.status(200).json({
        success: true,

        message:
          "Menu item updated successfully",

        menuItem:
          updatedMenuItem,
      });

    } catch (error) {

      console.error(
        "Complete menu item update error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to update menu item",
      });
    }
  }
);
/* =========================================================
   EXPORT ROUTER
   ========================================================= */

export default router;