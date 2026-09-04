import express from "express";
import mongoose from "mongoose";

import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Table from "../models/Table.js";
import User from "../models/Users.js";
import Bill from "../models/Bill.js";

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
   ORDER ENRICHMENT HELPER
   ========================================================= */

const getEnrichedOrders = async () => {
  const [
    orders,
    tables,
    menuItems,
    users,
  ] = await Promise.all([
    Order.find({})
      .sort({
        createdAt: -1,
      })
      .lean(),

    Table.find({})
      .lean(),

    MenuItem.find({})
      .lean(),

    User.find({})
      .select(
        "_id name email role imageUrl"
      )
      .lean(),
  ]);


  /* =======================================================
     CREATE TABLE MAP
     ======================================================= */

  const tableMap = new Map();

  tables.forEach(
    (table) => {
      tableMap.set(
        String(table._id),
        table
      );
    }
  );


  /* =======================================================
     CREATE MENU MAP
     ======================================================= */

  const menuMap = new Map();

  menuItems.forEach(
    (item) => {
      menuMap.set(
        String(item._id),
        item
      );
    }
  );


  /* =======================================================
     CREATE USER MAP
     ======================================================= */

  const userMap = new Map();

  users.forEach(
    (user) => {
      userMap.set(
        String(user._id),
        user
      );
    }
  );


  /* =======================================================
     ENRICH ORDERS
     ======================================================= */

  const enrichedOrders =
    orders.map(
      (order) => {

        const table =
          tableMap.get(
            String(order.tableId)
          );


        const createdBy =
          userMap.get(
            String(order.createdBy)
          );


        const databaseStatus =
          String(
            order.status ||
            "ORDERED"
          )
            .trim()
            .toUpperCase();


        /* READY in DB displays as COOKED */

        const displayStatus =
          databaseStatus === "READY"
            ? "COOKED"
            : databaseStatus;


        const items =
          Array.isArray(
            order.items
          )
            ? order.items.map(
                (item) => {

                  const menuItem =
                    menuMap.get(
                      String(
                        item.menuItemId
                      )
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
                      Number(
                        item.quantity
                      ) || 1,

                    instruction:
                      item.instruction ||
                      "",

                    unitPrice:
                      Number(
                        item.unitPrice
                      ) || 0,
                  };
                }
              )
            : [];


        const total =
          items.reduce(
            (
              sum,
              item
            ) => {

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
            table?.tableNumber ??
            null,

          createdByUser:
            createdBy
              ? {
                  _id:
                    createdBy._id,

                  name:
                    createdBy.name,

                  email:
                    createdBy.email,

                  role:
                    createdBy.role,

                  imageUrl:
                    createdBy.imageUrl ||
                    "",
                }
              : null,

          databaseStatus,

          displayStatus,

          items,

          total,
        };
      }
    );


  return enrichedOrders;
};


/* =========================================================
   POPULATED BILL HELPER
   ========================================================= */

const getPopulatedBill =
  async (
    billId
  ) => {

    return await Bill.findById(
      billId
    )
      .populate({
        path:
          "tableId",

        select:
          "_id tableNumber status waiterId assignedAt billRequestedAt",
      })
      .populate({
        path:
          "waiterId",

        select:
          "_id name email role imageUrl",
      })
      .populate({
        path:
          "managerId",

        select:
          "_id name email role imageUrl",
      })
      .lean();
  };


/* =========================================================
   GET ACTIVE USERS

   GET /api/manager/active-users
   ========================================================= */

router.get(
  "/active-users",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const activeUsers =
        await User.find({

          isActive:
            true,

        })
          .select(
            "_id name email role isActive currentTable lastActiveAt imageUrl"
          )
          .sort({
            role:
              1,

            name:
              1,
          })
          .lean();


      const managers =
        activeUsers.filter(
          (
            user
          ) =>
            user.role ===
            "MANAGER"
        );


      const waiters =
        activeUsers.filter(
          (
            user
          ) =>
            user.role ===
            "WAITER"
        );


      const kitchen =
        activeUsers.filter(
          (
            user
          ) =>
            user.role ===
            "KITCHEN"
        );


      return res
        .status(200)
        .json({

          success:
            true,

          manager:
            managers,

          waiters:
            waiters,

          kitchen:
            kitchen,

          counts: {

            managers:
              managers.length,

            waiters:
              waiters.length,

            kitchen:
              kitchen.length,

          },

        });

    } catch (
      error
    ) {

      console.error(
        "Active users error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to fetch active users",

        });

    }

  }
);


/* =========================================================
   GET ALL TABLES

   GET /api/manager/tables
   ========================================================= */

router.get(
  "/tables",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const tables =
        await Table.find({})
          .sort({
            tableNumber:
              1,
          })
          .populate({
            path:
              "waiterId",

            select:
              "_id name email role imageUrl isActive",
          })
          .lean();


      const enrichedTables =
        tables.map(
          (
            table
          ) => {

            const waiter =
              table.waiterId;


            return {

              ...table,

              waiter:
                waiter
                  ? {

                      _id:
                        waiter._id,

                      name:
                        waiter.name,

                      email:
                        waiter.email,

                      role:
                        waiter.role,

                      imageUrl:
                        waiter.imageUrl ||
                        "",

                      isActive:
                        waiter.isActive,

                    }
                  : null,

            };

          }
        );


      const counts = {

        total:
          enrichedTables.length,

        available:
          enrichedTables.filter(
            (
              table
            ) =>
              table.status ===
              "AVAILABLE"
          ).length,

        occupied:
          enrichedTables.filter(
            (
              table
            ) =>
              table.status ===
              "OCCUPIED"
          ).length,

        billRequested:
          enrichedTables.filter(
            (
              table
            ) =>
              table.status ===
              "BILL_REQUESTED"
          ).length,

      };


      return res
        .status(200)
        .json({

          success:
            true,

          tables:
            enrichedTables,

          counts,

        });

    } catch (
      error
    ) {

      console.error(
        "Manager tables error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to fetch tables",

        });

    }

  }
);


/* =========================================================
   GET ALL ORDERS

   GET /api/manager/orders
   ========================================================= */

router.get(
  "/orders",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const orders =
        await getEnrichedOrders();


      return res
        .status(200)
        .json({

          success:
            true,

          orders,

        });

    } catch (
      error
    ) {

      console.error(
        "Manager orders error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to fetch orders",

        });

    }

  }
);


/* =========================================================
   GET MENU ITEMS

   GET /api/manager/menu-items
   ========================================================= */

router.get(
  "/menu-items",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const menuItems =
        await MenuItem.find({})
          .sort({

            category:
              1,

            name:
              1,

          })
          .lean();


      return res
        .status(200)
        .json({

          success:
            true,

          menuItems,

          items:
            menuItems,

        });

    } catch (
      error
    ) {

      console.error(
        "Manager menu items error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to fetch menu items",

        });

    }

  }
);


/* =========================================================
   ADD MENU ITEM

   POST /api/manager/menu-items
   ========================================================= */

router.post(
  "/menu-items",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const name =
        String(
          req.body?.name ||
          ""
        ).trim();


      const category =
        String(
          req.body?.category ||
          ""
        ).trim();


      const price =
        Number(
          req.body?.price
        );


      const imageUrl =
        String(
          req.body?.imageUrl ||
          ""
        ).trim();


      const isAvailable =
        typeof req.body?.isAvailable ===
        "boolean"
          ? req.body.isAvailable
          : true;


      if (
        !name
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Menu item name is required",

          });

      }


      if (
        !category
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Category is required",

          });

      }


      if (
        !Number.isFinite(
          price
        ) ||
        price < 0
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Valid price is required",

          });

      }


      const menuItem =
        await MenuItem.create({

          name,

          category,

          price,

          imageUrl,

          isAvailable,

        });


      return res
        .status(201)
        .json({

          success:
            true,

          message:
            "Menu item added successfully",

          menuItem,

        });

    } catch (
      error
    ) {

      console.error(
        "Add menu item error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to add menu item",

        });

    }

  }
);


/* =========================================================
   UPDATE MENU ITEM

   PATCH /api/manager/menu-items/:id
   ========================================================= */

router.patch(
  "/menu-items/:id",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const menuItemId =
        req.params.id;


      if (
        !isValidObjectId(
          menuItemId
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Invalid menu item ID",

          });

      }


      const {
        name,
        category,
        price,
        imageUrl,
        isAvailable,
      } =
        req.body || {};


      const updateData =
        {};


      if (
        name !==
        undefined
      ) {

        const trimmedName =
          String(
            name
          ).trim();


        if (
          !trimmedName
        ) {

          return res
            .status(400)
            .json({

              success:
                false,

              message:
                "Menu item name cannot be empty",

            });

        }


        updateData.name =
          trimmedName;

      }


      if (
        category !==
        undefined
      ) {

        const trimmedCategory =
          String(
            category
          ).trim();


        if (
          !trimmedCategory
        ) {

          return res
            .status(400)
            .json({

              success:
                false,

              message:
                "Category cannot be empty",

            });

        }


        updateData.category =
          trimmedCategory;

      }


      if (
        price !==
        undefined
      ) {

        const numericPrice =
          Number(
            price
          );


        if (
          !Number.isFinite(
            numericPrice
          ) ||
          numericPrice < 0
        ) {

          return res
            .status(400)
            .json({

              success:
                false,

              message:
                "Enter a valid price",

            });

        }


        updateData.price =
          numericPrice;

      }


      if (
        imageUrl !==
        undefined
      ) {

        updateData.imageUrl =
          String(
            imageUrl ||
            ""
          ).trim();

      }


      if (
        isAvailable !==
        undefined
      ) {

        if (
          typeof isAvailable !==
          "boolean"
        ) {

          return res
            .status(400)
            .json({

              success:
                false,

              message:
                "isAvailable must be true or false",

            });

        }


        updateData.isAvailable =
          isAvailable;

      }


      if (
        Object.keys(
          updateData
        ).length ===
        0
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "No valid fields were provided",

          });

      }


      const menuItem =
        await MenuItem.findByIdAndUpdate(

          menuItemId,

          {
            $set:
              updateData,
          },

          {
            returnDocument:
              "after",

            runValidators:
              true,
          }

        ).lean();


      if (
        !menuItem
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "Menu item not found",

          });

      }


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "Menu item updated successfully",

          menuItem,

          item:
            menuItem,

        });

    } catch (
      error
    ) {

      console.error(
        "Menu update error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to update menu item",

        });

    }

  }
);


/* =========================================================
   UPDATE MENU AVAILABILITY

   PATCH /api/manager/menu-items/:id/availability
   ========================================================= */

router.patch(
  "/menu-items/:id/availability",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const menuItemId =
        req.params.id;


      const isAvailable =
        req.body?.isAvailable;


      if (
        !isValidObjectId(
          menuItemId
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Invalid menu item ID",

          });

      }


      if (
        typeof isAvailable !==
        "boolean"
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "isAvailable must be true or false",

          });

      }


      const menuItem =
        await MenuItem.findByIdAndUpdate(

          menuItemId,

          {
            $set: {
              isAvailable,
            },
          },

          {
            returnDocument:
              "after",

            runValidators:
              true,
          }

        ).lean();


      if (
        !menuItem
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "Menu item not found",

          });

      }


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "Menu availability updated",

          menuItem,

        });

    } catch (
      error
    ) {

      console.error(
        "Menu availability error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to update menu availability",

        });

    }

  }
);


/* =========================================================
   DELETE MENU ITEM

   DELETE /api/manager/menu-items/:id
   ========================================================= */

router.delete(
  "/menu-items/:id",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const menuItemId =
        req.params.id;


      if (
        !isValidObjectId(
          menuItemId
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Invalid menu item ID",

          });

      }


      const deletedMenuItem =
        await MenuItem.findByIdAndDelete(
          menuItemId
        );


      if (
        !deletedMenuItem
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "Menu item not found",

          });

      }


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "Menu item deleted successfully",

        });

    } catch (
      error
    ) {

      console.error(
        "Delete menu item error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to delete menu item",

        });

    }

  }
);


/* =========================================================
   GET ALL BILLS

   GET /api/manager/bills

   Optional:
   ?status=CHECKOUT
   ?paymentStatus=UNPAID
   ?tableNumber=5
   ========================================================= */

router.get(
  "/bills",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const {
        status,
        paymentStatus,
        tableNumber,
      } =
        req.query;


      const query =
        {};


      if (
        status
      ) {

        query.status =
          String(
            status
          )
            .trim()
            .toUpperCase();

      }


      if (
        paymentStatus
      ) {

        query.paymentStatus =
          String(
            paymentStatus
          )
            .trim()
            .toUpperCase();

      }


      if (
        tableNumber !==
          undefined &&
        tableNumber !==
          ""
      ) {

        const parsedTableNumber =
          Number(
            tableNumber
          );


        if (
          Number.isNaN(
            parsedTableNumber
          )
        ) {

          return res
            .status(400)
            .json({

              success:
                false,

              message:
                "Invalid table number",

            });

        }


        query.tableNumber =
          parsedTableNumber;

      }


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
              "_id tableNumber status waiterId assignedAt billRequestedAt",
          })
          .populate({
            path:
              "waiterId",

            select:
              "_id name email role imageUrl",
          })
          .populate({
            path:
              "managerId",

            select:
              "_id name email role imageUrl",
          })
          .lean();


      const counts = {

        total:
          bills.length,

        checkout:
          bills.filter(
            (
              bill
            ) =>
              bill.status ===
              "CHECKOUT"
          ).length,

        generated:
          bills.filter(
            (
              bill
            ) =>
              bill.status ===
              "GENERATED"
          ).length,

        paid:
          bills.filter(
            (
              bill
            ) =>
              bill.status ===
              "PAID"
          ).length,

        unpaid:
          bills.filter(
            (
              bill
            ) =>
              bill.paymentStatus ===
              "UNPAID"
          ).length,

      };


      return res
        .status(200)
        .json({

          success:
            true,

          bills,

          counts,

        });

    } catch (
      error
    ) {

      console.error(
        "Manager bills error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to fetch bills",

        });

    }

  }
);


/* =========================================================
   GET SINGLE BILL

   GET /api/manager/bills/:id
   ========================================================= */

router.get(
  "/bills/:id",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const billId =
        req.params.id;


      if (
        !isValidObjectId(
          billId
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Invalid bill ID",

          });

      }


      const bill =
        await getPopulatedBill(
          billId
        );


      if (
        !bill
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "Bill not found",

          });

      }


      return res
        .status(200)
        .json({

          success:
            true,

          bill,

        });

    } catch (
      error
    ) {

      console.error(
        "Manager bill details error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to fetch bill",

        });

    }

  }
);


/* =========================================================
   GENERATE BILL

   PATCH /api/manager/bills/:id/generate

   CHECKOUT
      ↓
   GENERATED
   ========================================================= */

router.patch(
  "/bills/:id/generate",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const billId =
        req.params.id;


      if (
        !isValidObjectId(
          billId
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Invalid bill ID",

          });

      }


      const bill =
        await Bill.findById(
          billId
        );


      if (
        !bill
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "Bill not found",

          });

      }


      if (
        bill.status ===
        "PAID"
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Paid bills cannot be generated again",

          });

      }


      if (
        bill.status ===
        "GENERATED"
      ) {

        const existingBill =
          await getPopulatedBill(
            bill._id
          );


        return res
          .status(200)
          .json({

            success:
              true,

            message:
              "Bill already generated",

            bill:
              existingBill,

          });

      }


      if (
        bill.status !==
        "CHECKOUT"
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              `Bill cannot be generated from ${bill.status}`,

          });

      }


      const updatedBill =
        await Bill.findByIdAndUpdate(

          billId,

          {
            $set: {

              status:
                "GENERATED",

              managerId:
                req.user.id,

              generatedAt:
                new Date(),

            },
          },

          {
            returnDocument:
              "after",

            runValidators:
              true,
          }

        );


      const populatedBill =
        await getPopulatedBill(
          updatedBill._id
        );


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "Bill generated successfully",

          bill:
            populatedBill,

        });

    } catch (
      error
    ) {

      console.error(
        "Generate bill error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to generate bill",

        });

    }

  }
);


/* =========================================================
   PAY / FINALIZE BILL

   PATCH /api/manager/bills/:id/pay

   GENERATED
      ↓
   PAID

   Releases the table after successful payment.
   ========================================================= */

router.patch(
  "/bills/:id/pay",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const billId =
        req.params.id;


      const paymentMethod =
        String(
          req.body?.paymentMethod ||
          ""
        )
          .trim()
          .toUpperCase();


      if (
        !isValidObjectId(
          billId
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Invalid bill ID",

          });

      }


      const allowedPaymentMethods = [
        "CASH",
        "CARD",
        "UPI",
      ];


      if (
        !allowedPaymentMethods.includes(
          paymentMethod
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Payment method must be CASH, CARD, or UPI",

          });

      }


      const bill =
        await Bill.findById(
          billId
        );


      if (
        !bill
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "Bill not found",

          });

      }


      if (
        bill.status ===
          "PAID" ||
        bill.paymentStatus ===
          "PAID"
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "This bill is already paid",

          });

      }


      if (
        bill.status !==
        "GENERATED"
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Generate the bill before completing payment",

          });

      }


      const table =
        await Table.findById(
          bill.tableId
        );


      if (
        !table
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "Table associated with this bill was not found",

          });

      }


      const updatedBill =
        await Bill.findByIdAndUpdate(

          billId,

          {
            $set: {

              status:
                "PAID",

              paymentStatus:
                "PAID",

              paymentMethod:
                paymentMethod,

              paidAt:
                new Date(),

              managerId:
                req.user.id,

            },
          },

          {
            returnDocument:
              "after",

            runValidators:
              true,
          }

        );


      /* =====================================================
         RELEASE TABLE
         ===================================================== */

      const releasedTable =
        await Table.findByIdAndUpdate(

          bill.tableId,

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


      /* =====================================================
         CLEAR WAITER CURRENT TABLE
         ===================================================== */

      if (
        bill.waiterId
      ) {

        const waiter =
          await User.findById(
            bill.waiterId
          );


        if (
          waiter
        ) {

          const currentTable =
            waiter.currentTable;


          const matchesTableNumber =
            String(
              currentTable ??
              ""
            ) ===
            String(
              releasedTable.tableNumber
            );


          if (
            matchesTableNumber
          ) {

            await User.findByIdAndUpdate(

              bill.waiterId,

              {
                $set: {

                  currentTable:
                    null,

                },
              },

              {
                returnDocument:
                  "after",
              }

            );

          }

        }

      }


      const populatedBill =
        await getPopulatedBill(
          updatedBill._id
        );


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "Payment completed and table released",

          bill:
            populatedBill,

          table:
            releasedTable,

        });

    } catch (
      error
    ) {

      console.error(
        "Bill payment error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to complete payment",

        });

    }

  }
);


/* =========================================================
   ORDER STATUS UPDATE HELPER
   ========================================================= */

const updateOrderStatus =
  async (
    req,
    res
  ) => {

    try {

      const orderId =
        req.params.id;


      if (
        !isValidObjectId(
          orderId
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Invalid order ID",

          });

      }


      const requestedStatus =
        String(
          req.body?.status ||
          ""
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

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Invalid order status",

          });

      }


      const databaseStatus =
        requestedStatus ===
        "COOKED"
          ? "READY"
          : requestedStatus;


      const order =
        await Order.findByIdAndUpdate(

          orderId,

          {
            $set: {

              status:
                databaseStatus,

            },
          },

          {
            returnDocument:
              "after",

            runValidators:
              true,
          }

        ).lean();


      if (
        !order
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "Order not found",

          });

      }


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "Order status updated successfully",

          status:
            requestedStatus,

          databaseStatus,

          order,

        });

    } catch (
      error
    ) {

      console.error(
        "Order status update error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to update order status",

        });

    }

  };


/* =========================================================
   UPDATE ORDER STATUS

   PATCH /api/manager/orders/:id/status
   ========================================================= */

router.patch(
  "/orders/:id/status",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  updateOrderStatus
);


/* =========================================================
   BACKWARD COMPATIBILITY

   PATCH /api/manager/:id/status
   ========================================================= */

router.patch(
  "/:id/status",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  updateOrderStatus
);


/* =========================================================
   MANAGER ROOT

   GET /api/manager

   BACKWARD COMPATIBILITY
   ========================================================= */

router.get(
  "/",

  authenticate,

  authorizeRoles(
    "MANAGER"
  ),

  async (
    req,
    res
  ) => {

    try {

      const orders =
        await getEnrichedOrders();


      return res
        .status(200)
        .json({

          success:
            true,

          orders,

        });

    } catch (
      error
    ) {

      console.error(
        "Manager root error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to fetch manager data",

        });

    }

  }
);


/* =========================================================
   EXPORT
   ========================================================= */

export default router;