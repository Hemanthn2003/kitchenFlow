import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/Users.js";
import Table from "../models/Table.js";
import Bill from "../models/Bill.js";
import MenuItem from "../models/MenuItem.js";

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


const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toUpperCase();
};


const publicUserFields = `
  _id
  name
  email
  role
  isActive
  currentTable
  lastActiveAt
  imageUrl
  profileImage
  createdAt
  updatedAt
`;


/* =========================================================
   GET ALL STAFF USERS
   =========================================================

   GET /api/admin/users

   ADMIN ONLY

   Returns:
   - Managers
   - Waiters
   - Kitchen staff

   Inactive users are INCLUDED.

   ADMIN accounts themselves are intentionally not returned
   in staff-management sections.
   ========================================================= */

router.get(
  "/users",
  authenticate,
  authorizeRoles("ADMIN"),

  async (req, res) => {
    try {
      const users = await User.find({
        role: {
          $in: [
            "MANAGER",
            "WAITER",
            "KITCHEN",
          ],
        },
      })
        .select(publicUserFields)
        .sort({
          role: 1,
          name: 1,
        })
        .lean();


      /* =====================================================
         GET ALL TABLES

         This allows Admin to see ALL tables currently
         assigned to each waiter.
         ===================================================== */

      const tables = await Table.find({})
        .select(
          "_id tableNumber status waiterId assignedAt billRequestedAt"
        )
        .lean();


      const tablesByWaiter = new Map();


      tables.forEach((table) => {
        if (!table.waiterId) {
          return;
        }

        const waiterId =
          String(table.waiterId);


        if (
          !tablesByWaiter.has(
            waiterId
          )
        ) {
          tablesByWaiter.set(
            waiterId,
            []
          );
        }


        tablesByWaiter
          .get(waiterId)
          .push(table);
      });


      const enrichedUsers =
        users.map((user) => {

          const waiterTables =
            normalizeRole(user.role) ===
            "WAITER"
              ? (
                  tablesByWaiter.get(
                    String(user._id)
                  ) || []
                )
              : [];


          return {
            ...user,

            servingTables:
              waiterTables.map(
                (table) => ({
                  id: table._id,
                  tableNumber:
                    table.tableNumber,
                  status:
                    table.status,
                  assignedAt:
                    table.assignedAt,
                  billRequestedAt:
                    table.billRequestedAt,
                })
              ),

            servingTableNumbers:
              waiterTables.map(
                (table) =>
                  table.tableNumber
              ),

            isServing:
              waiterTables.length >
              0,
          };
        });


      return res.status(200).json({
        success: true,
        users: enrichedUsers,
      });

    } catch (error) {

      console.error(
        "Admin get users error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load users",
      });
    }
  }
);


/* =========================================================
   GET CURRENT ADMIN
   =========================================================

   GET /api/admin/me
   ========================================================= */

router.get(
  "/me",
  authenticate,
  authorizeRoles("ADMIN"),

  async (req, res) => {
    try {

      const admin =
        await User.findById(
          req.user.id
        )
          .select(
            "_id name email role isActive currentTable lastActiveAt imageUrl profileImage createdAt updatedAt"
          )
          .lean();


      if (!admin) {
        return res.status(404).json({
          success: false,
          message:
            "Admin not found",
        });
      }


      return res.status(200).json({
        success: true,
        admin,
      });

    } catch (error) {

      console.error(
        "Admin profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load admin profile",
      });
    }
  }
);


/* =========================================================
   ADD USER
   =========================================================

   POST /api/admin/users

   BODY:
   {
     name,
     email,
     password,
     role
   }

   Password is ALWAYS bcrypt hashed here.
   ========================================================= */

router.post(
  "/users",
  authenticate,
  authorizeRoles("ADMIN"),

  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
        role,
        imageUrl,
        profileImage,
      } = req.body;


      const normalizedName =
        String(name || "")
          .trim();


      const normalizedEmail =
        String(email || "")
          .trim()
          .toLowerCase();


      const normalizedRole =
        normalizeRole(role);


      if (!normalizedName) {
        return res.status(400).json({
          success: false,
          message:
            "Name is required",
        });
      }


      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required",
        });
      }


      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "Password is required",
        });
      }


      if (
        ![
          "MANAGER",
          "WAITER",
          "KITCHEN",
        ].includes(
          normalizedRole
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid staff role",
        });
      }


      const existingUser =
        await User.findOne({
          email:
            normalizedEmail,
        });


      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "A user with this email already exists",
        });
      }


      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        );


      const user =
        await User.create({
          name:
            normalizedName,

          email:
            normalizedEmail,

          password:
            hashedPassword,

          role:
            normalizedRole,

          isActive:
            false,

          currentTable:
            null,

          ...(imageUrl !== undefined
            ? { imageUrl }
            : {}),

          ...(profileImage !== undefined
            ? { profileImage }
            : {}),
        });


      const safeUser =
        await User.findById(
          user._id
        )
          .select(
            publicUserFields
          )
          .lean();


      return res.status(201).json({
        success: true,
        message:
          "User added successfully",
        user: safeUser,
      });

    } catch (error) {

      console.error(
        "Admin add user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to add user",
      });
    }
  }
);


/* =========================================================
   EDIT USER
   =========================================================

   PATCH /api/admin/users/:id

   Admin can change:
   - name
   - email
   - password

   Password is re-hashed ONLY when a new password
   is supplied.
   ========================================================= */

router.patch(
  "/users/:id",
  authenticate,
  authorizeRoles("ADMIN"),

  async (req, res) => {

    try {

      const userId =
        req.params.id;


      if (
        !isValidObjectId(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID",
        });
      }


      const user =
        await User.findById(
          userId
        );


      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }


      if (
        normalizeRole(
          user.role
        ) === "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin accounts cannot be edited here",
        });
      }


      const {
        name,
        email,
        password,
        imageUrl,
        profileImage,
      } = req.body;


      if (
        name !== undefined
      ) {

        const normalizedName =
          String(name)
            .trim();


        if (!normalizedName) {
          return res.status(400).json({
            success: false,
            message:
              "Name cannot be empty",
          });
        }


        user.name =
          normalizedName;
      }


      if (
        email !== undefined
      ) {

        const normalizedEmail =
          String(email)
            .trim()
            .toLowerCase();


        if (!normalizedEmail) {
          return res.status(400).json({
            success: false,
            message:
              "Email cannot be empty",
          });
        }


        const emailOwner =
          await User.findOne({
            email:
              normalizedEmail,
            _id: {
              $ne: user._id,
            },
          });


        if (emailOwner) {
          return res.status(409).json({
            success: false,
            message:
              "Another user already uses this email",
          });
        }


        user.email =
          normalizedEmail;
      }


      if (
        password !== undefined
      ) {

        const newPassword =
          String(password);


        if (!newPassword) {
          return res.status(400).json({
            success: false,
            message:
              "Password cannot be empty",
          });
        }


        user.password =
          await bcrypt.hash(
            newPassword,
            12
          );
      }


      if (
        imageUrl !== undefined
      ) {
        user.imageUrl =
          imageUrl;
      }


      if (
        profileImage !== undefined
      ) {
        user.profileImage =
          profileImage;
      }


      await user.save();


      const safeUser =
        await User.findById(
          user._id
        )
          .select(
            publicUserFields
          )
          .lean();


      return res.status(200).json({
        success: true,
        message:
          "User updated successfully",
        user: safeUser,
      });

    } catch (error) {

      console.error(
        "Admin edit user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update user",
      });
    }
  }
);


/* =========================================================
   CHANGE USER ROLE
   =========================================================

   PATCH /api/admin/users/:id/role

   BODY:
   {
     role: "MANAGER"
   }

   This is what moves the card from one role section
   to another.
   ========================================================= */

router.patch(
  "/users/:id/role",
  authenticate,
  authorizeRoles("ADMIN"),

  async (req, res) => {

    try {

      const userId =
        req.params.id;


      if (
        !isValidObjectId(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID",
        });
      }


      const newRole =
        normalizeRole(
          req.body?.role
        );


      if (
        ![
          "MANAGER",
          "WAITER",
          "KITCHEN",
        ].includes(
          newRole
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid staff role",
        });
      }


      const user =
        await User.findById(
          userId
        );


      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }


      if (
        normalizeRole(
          user.role
        ) === "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin role cannot be changed here",
        });
      }


      const previousRole =
        normalizeRole(
          user.role
        );


      user.role =
        newRole;


      /*
        A role change should not leave a waiter
        assignment attached to the user.
      */

      if (
        previousRole ===
        "WAITER" &&
        newRole !==
        "WAITER"
      ) {

        await Table.updateMany(
          {
            waiterId:
              user._id,
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
          }
        );


        user.currentTable =
          null;
      }


      await user.save();


      const safeUser =
        await User.findById(
          user._id
        )
          .select(
            publicUserFields
          )
          .lean();


      return res.status(200).json({
        success: true,
        message:
          `User promoted/demoted to ${newRole}`,
        user: safeUser,
      });

    } catch (error) {

      console.error(
        "Admin role change error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to change user role",
      });
    }
  }
);


/* =========================================================
   FIRE / DELETE USER
   =========================================================

   DELETE /api/admin/users/:id
   ========================================================= */

router.delete(
  "/users/:id",
  authenticate,
  authorizeRoles("ADMIN"),

  async (req, res) => {

    try {

      const userId =
        req.params.id;


      if (
        !isValidObjectId(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID",
        });
      }


      if (
        String(userId) ===
        String(req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot fire your own Admin account",
        });
      }


      const user =
        await User.findById(
          userId
        );


      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }


      if (
        normalizeRole(
          user.role
        ) === "ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin accounts cannot be fired here",
        });
      }


      /*
        If the user is a waiter, release every
        table assigned to that waiter first.
      */

      if (
        normalizeRole(
          user.role
        ) === "WAITER"
      ) {

        await Table.updateMany(
          {
            waiterId:
              user._id,
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
          }
        );
      }


      await User.findByIdAndDelete(
        userId
      );


      return res.status(200).json({
        success: true,
        message:
          "User fired successfully",
        userId,
      });

    } catch (error) {

      console.error(
        "Admin delete user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fire user",
      });
    }
  }
);


/* =========================================================
   GET ALL BILLS
   =========================================================

   GET /api/admin/bills

   Optional:
   ?billNumber=KF-...
   ?date=2026-09-10
   ?from=2026-09-01
   ?to=2026-09-10
   ========================================================= */

router.get(
  "/bills",
  authenticate,
  authorizeRoles("ADMIN"),

  async (req, res) => {

    try {

      const {
        billNumber,
        date,
        from,
        to,
      } = req.query;


      const query = {};


      /* =====================================================
         BILL NUMBER
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
         SINGLE DATE
         ===================================================== */

      if (date) {

        const start =
          new Date(
            `${date}T00:00:00`
          );


        if (
          Number.isNaN(
            start.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid date",
          });
        }


        const end =
          new Date(start);


        end.setDate(
          end.getDate() + 1
        );


        query.createdAt = {
          $gte: start,
          $lt: end,
        };
      }


      /* =====================================================
         FROM / TO DATE
         ===================================================== */

      if (
        !date &&
        (from || to)
      ) {

        const range = {};


        if (from) {

          const start =
            new Date(
              `${from}T00:00:00`
            );


          if (
            Number.isNaN(
              start.getTime()
            )
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid from date",
            });
          }


          range.$gte =
            start;
        }


        if (to) {

          const end =
            new Date(
              `${to}T00:00:00`
            );


          if (
            Number.isNaN(
              end.getTime()
            )
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid to date",
            });
          }


          end.setDate(
            end.getDate() + 1
          );


          range.$lt =
            end;
        }


        query.createdAt =
          range;
      }


      const bills =
        await Bill.find(
          query
        )
          .sort({
            createdAt: -1,
          })
          .populate({
            path: "tableId",
            select:
              "_id tableNumber status",
          })
          .populate({
            path: "waiterId",
            select:
              "_id name email role imageUrl profileImage",
          })
          .populate({
            path: "managerId",
            select:
              "_id name email role imageUrl profileImage",
          })
          .lean();


      return res.status(200).json({
        success: true,
        bills,
      });

    } catch (error) {

      console.error(
        "Admin get bills error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load bills",
      });
    }
  }
);


/* =========================================================
   SALES ANALYTICS
   =========================================================

   GET /api/admin/analytics/sales

   query:
   period =
     day
     week
     month
     3month
     6month
     9month
     year
     2year
     3year
     custom

   custom:
   ?start=YYYY-MM-DD
   ?end=YYYY-MM-DD

   Uses PAID bills.
   ========================================================= */

router.get(
  "/analytics/sales",
  authenticate,
  authorizeRoles("ADMIN"),

  async (req, res) => {

    try {

      const {
        period = "week",
        start,
        end,
      } = req.query;


      const now =
        new Date();


      let currentStart;
      let currentEnd =
        now;


      let bucket =
        "day";


      const normalizedPeriod =
        String(period)
          .trim()
          .toLowerCase();


      /* =====================================================
         PERIOD
         ===================================================== */

      if (
        normalizedPeriod ===
        "day"
      ) {

        currentStart =
          new Date(now);

        currentStart.setDate(
          currentStart.getDate() -
            1
        );

        bucket =
          "day";

      } else if (
        normalizedPeriod ===
        "week"
      ) {

        currentStart =
          new Date(now);

        currentStart.setDate(
          currentStart.getDate() -
            7
        );

        bucket =
          "day";

      } else if (
        normalizedPeriod ===
        "month"
      ) {

        currentStart =
          new Date(now);

        currentStart.setMonth(
          currentStart.getMonth() -
            1
        );

        bucket =
          "week";

      } else if (
        normalizedPeriod ===
        "3month"
      ) {

        currentStart =
          new Date(now);

        currentStart.setMonth(
          currentStart.getMonth() -
            3
        );

        bucket =
          "month";

      } else if (
        normalizedPeriod ===
        "6month"
      ) {

        currentStart =
          new Date(now);

        currentStart.setMonth(
          currentStart.getMonth() -
            6
        );

        bucket =
          "month";

      } else if (
        normalizedPeriod ===
        "9month"
      ) {

        currentStart =
          new Date(now);

        currentStart.setMonth(
          currentStart.getMonth() -
            9
        );

        bucket =
          "month";

      } else if (
        normalizedPeriod ===
        "year"
      ) {

        currentStart =
          new Date(now);

        currentStart.setFullYear(
          currentStart.getFullYear() -
            1
        );

        bucket =
          "month";

      } else if (
        normalizedPeriod ===
        "2year"
      ) {

        currentStart =
          new Date(now);

        currentStart.setFullYear(
          currentStart.getFullYear() -
            2
        );

        bucket =
          "year";

      } else if (
        normalizedPeriod ===
        "3year"
      ) {

        currentStart =
          new Date(now);

        currentStart.setFullYear(
          currentStart.getFullYear() -
            3
        );

        bucket =
          "year";

      } else if (
        normalizedPeriod ===
        "custom"
      ) {

        if (!start || !end) {
          return res.status(400).json({
            success: false,
            message:
              "Custom analytics requires start and end dates",
          });
        }


        currentStart =
          new Date(
            `${start}T00:00:00`
          );


        currentEnd =
          new Date(
            `${end}T00:00:00`
          );


        if (
          Number.isNaN(
            currentStart.getTime()
          ) ||
          Number.isNaN(
            currentEnd.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid custom date range",
          });
        }


        currentEnd.setDate(
          currentEnd.getDate() + 1
        );


        const duration =
          currentEnd.getTime() -
          currentStart.getTime();


        if (
          duration <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "End date must be after start date",
          });
        }


        if (
          duration <=
          7 * 24 * 60 * 60 * 1000
        ) {
          bucket =
            "day";
        } else if (
          duration <=
          62 * 24 * 60 * 60 * 1000
        ) {
          bucket =
            "week";
        } else if (
          duration <=
          370 * 24 * 60 * 60 * 1000
        ) {
          bucket =
            "month";
        } else {
          bucket =
            "year";
        }

      } else {

        return res.status(400).json({
          success: false,
          message:
            "Invalid analytics period",
        });
      }


      /* =====================================================
         PREVIOUS EQUAL-LENGTH PERIOD
         ===================================================== */

      const duration =
        currentEnd.getTime() -
        currentStart.getTime();


      const previousEnd =
        new Date(
          currentStart
        );


      const previousStart =
        new Date(
          currentStart.getTime() -
          duration
        );


      /* =====================================================
         AGGREGATE PAID BILLS
         ===================================================== */

      const bills =
        await Bill.find({
          status: "PAID",

          paidAt: {
            $gte:
              previousStart,

            $lt:
              currentEnd,
          },
        })
          .select(
            "_id billNumber totalAmount paidAt createdAt"
          )
          .lean();


      const aggregateSeries =
        (
          startDate,
          endDate
        ) => {

          const series = [];


          if (
            bucket ===
            "day"
          ) {

            const cursor =
              new Date(
                startDate
              );


            while (
              cursor <
              endDate
            ) {

              const next =
                new Date(
                  cursor
                );


              next.setDate(
                next.getDate() + 1
              );


              const amount =
                bills
                  .filter(
                    (bill) => {

                      const date =
                        new Date(
                          bill.paidAt ||
                          bill.createdAt
                        );

                      return (
                        date >=
                          cursor &&
                        date <
                          next
                      );
                    }
                  )
                  .reduce(
                    (
                      sum,
                      bill
                    ) =>
                      sum +
                      Number(
                        bill.totalAmount ||
                        0
                      ),
                    0
                  );


              series.push({
                start:
                  cursor.toISOString(),

                end:
                  next.toISOString(),

                label:
                  cursor.toLocaleDateString(
                    "en-IN",
                    {
                      weekday:
                        "short",
                      day:
                        "2-digit",
                      month:
                        "short",
                    }
                  ),

                amount,
              });


              cursor.setDate(
                cursor.getDate() + 1
              );
            }

          } else if (
            bucket ===
            "week"
          ) {

            const cursor =
              new Date(
                startDate
              );


            while (
              cursor <
              endDate
            ) {

              const next =
                new Date(
                  cursor
                );


              next.setDate(
                next.getDate() + 7
              );


              const amount =
                bills
                  .filter(
                    (bill) => {

                      const date =
                        new Date(
                          bill.paidAt ||
                          bill.createdAt
                        );

                      return (
                        date >=
                          cursor &&
                        date <
                          next
                      );
                    }
                  )
                  .reduce(
                    (
                      sum,
                      bill
                    ) =>
                      sum +
                      Number(
                        bill.totalAmount ||
                        0
                      ),
                    0
                  );


              series.push({
                start:
                  cursor.toISOString(),

                end:
                  next.toISOString(),

                label:
                  `Week ${series.length + 1}`,

                amount,
              });


              cursor.setDate(
                cursor.getDate() + 7
              );
            }

          } else if (
            bucket ===
            "month"
          ) {

            const cursor =
              new Date(
                startDate
              );


            while (
              cursor <
              endDate
            ) {

              const next =
                new Date(
                  cursor
                );


              next.setMonth(
                next.getMonth() + 1
              );


              const amount =
                bills
                  .filter(
                    (bill) => {

                      const date =
                        new Date(
                          bill.paidAt ||
                          bill.createdAt
                        );

                      return (
                        date >=
                          cursor &&
                        date <
                          next
                      );
                    }
                  )
                  .reduce(
                    (
                      sum,
                      bill
                    ) =>
                      sum +
                      Number(
                        bill.totalAmount ||
                        0
                      ),
                    0
                  );


              series.push({
                start:
                  cursor.toISOString(),

                end:
                  next.toISOString(),

                label:
                  cursor.toLocaleDateString(
                    "en-IN",
                    {
                      month:
                        "short",
                      year:
                        "numeric",
                    }
                  ),

                amount,
              });


              cursor.setMonth(
                cursor.getMonth() + 1
              );
            }

          } else {

            const cursor =
              new Date(
                startDate
              );


            while (
              cursor <
              endDate
            ) {

              const next =
                new Date(
                  cursor
                );


              next.setFullYear(
                next.getFullYear() +
                  1
              );


              const amount =
                bills
                  .filter(
                    (bill) => {

                      const date =
                        new Date(
                          bill.paidAt ||
                          bill.createdAt
                        );

                      return (
                        date >=
                          cursor &&
                        date <
                          next
                      );
                    }
                  )
                  .reduce(
                    (
                      sum,
                      bill
                    ) =>
                      sum +
                      Number(
                        bill.totalAmount ||
                        0
                      ),
                    0
                  );


              series.push({
                start:
                  cursor.toISOString(),

                end:
                  next.toISOString(),

                label:
                  cursor.toLocaleDateString(
                    "en-IN",
                    {
                      year:
                        "numeric",
                    }
                  ),

                amount,
              });


              cursor.setFullYear(
                cursor.getFullYear() + 1
              );
            }
          }


          return series;
        };


      const currentSeries =
        aggregateSeries(
          currentStart,
          currentEnd
        );


      const previousSeries =
        aggregateSeries(
          previousStart,
          previousEnd
        );


      const currentTotal =
        currentSeries.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.amount || 0
            ),
          0
        );


      const previousTotal =
        previousSeries.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.amount || 0
            ),
          0
        );


      const change =
        previousTotal === 0
          ? currentTotal > 0
            ? 100
            : 0
          : (
              (
                currentTotal -
                previousTotal
              ) /
              previousTotal
            ) *
            100;


      return res.status(200).json({
        success: true,

        period:
          normalizedPeriod,

        bucket,

        current: {
          start:
            currentStart.toISOString(),

          end:
            currentEnd.toISOString(),

          total:
            currentTotal,

          series:
            currentSeries,
        },

        previous: {
          start:
            previousStart.toISOString(),

          end:
            previousEnd.toISOString(),

          total:
            previousTotal,

          series:
            previousSeries,
        },

        change,
      });

    } catch (error) {

      console.error(
        "Admin sales analytics error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load sales analytics",
      });
    }
  }
);


/* =========================================================
   POPULAR DISH ANALYTICS
   =========================================================

   GET /api/admin/analytics/popular-dishes

   Optional:
   ?category=Pizza
   ?start=YYYY-MM-DD
   ?end=YYYY-MM-DD

   Uses PAID bills.
   ========================================================= */

router.get(
  "/analytics/popular-dishes",
  authenticate,
  authorizeRoles("ADMIN"),

  async (req, res) => {

    try {

      const {
        category,
        start,
        end,
      } = req.query;


      const query = {
        status: "PAID",
      };


      if (
        start ||
        end
      ) {

        const range = {};


        if (start) {

          const startDate =
            new Date(
              `${start}T00:00:00`
            );


          if (
            Number.isNaN(
              startDate.getTime()
            )
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid start date",
            });
          }


          range.$gte =
            startDate;
        }


        if (end) {

          const endDate =
            new Date(
              `${end}T00:00:00`
            );


          if (
            Number.isNaN(
              endDate.getTime()
            )
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid end date",
            });
          }


          endDate.setDate(
            endDate.getDate() + 1
          );


          range.$lt =
            endDate;
        }


        query.paidAt =
          range;
      }


      const bills =
        await Bill.find(
          query
        )
          .select(
            "items totalAmount paidAt createdAt"
          )
          .lean();


      const menuItems =
        await MenuItem.find({})
          .select(
            "_id name category price imageUrl"
          )
          .lean();


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


      const dishMap =
        new Map();


      bills.forEach(
        (bill) => {

          if (
            !Array.isArray(
              bill.items
            )
          ) {
            return;
          }


          bill.items.forEach(
            (item) => {

              const menuItem =
                menuMap.get(
                  String(
                    item.menuItemId
                  )
                );


              const dishCategory =
                menuItem?.category ||
                "Uncategorized";


              if (
                category &&
                category !== "ALL" &&
                dishCategory !==
                  category
              ) {
                return;
              }


              const key =
                String(
                  item.menuItemId ||
                  item.name
                );


              if (
                !dishMap.has(
                  key
                )
              ) {

                dishMap.set(
                  key,
                  {
                    menuItemId:
                      item.menuItemId,

                    name:
                      item.name ||
                      menuItem?.name ||
                      "Unknown Dish",

                    category:
                      dishCategory,

                    quantity:
                      0,

                    sales:
                      0,
                  }
                );
              }


              const dish =
                dishMap.get(
                  key
                );


              const quantity =
                Number(
                  item.quantity || 0
                );


              const unitPrice =
                Number(
                  item.unitPrice || 0
                );


              dish.quantity +=
                quantity;


              dish.sales +=
                quantity *
                unitPrice;
            }
          );
        }
      );


      const dishes =
        Array.from(
          dishMap.values()
        )
          .sort(
            (a, b) =>
              b.sales -
              a.sales
          );


      const categories =
        Array.from(
          new Set(
            menuItems
              .map(
                (item) =>
                  item.category
              )
              .filter(Boolean)
          )
        )
          .sort(
            (a, b) =>
              a.localeCompare(b)
          );


      const categoryTotals =
        new Map();


      dishes.forEach(
        (dish) => {

          const existing =
            categoryTotals.get(
              dish.category
            ) || 0;


          categoryTotals.set(
            dish.category,
            existing +
              dish.sales
          );
        }
      );


      const categorySales =
        Array.from(
          categoryTotals.entries()
        )
          .map(
            ([
              name,
              sales,
            ]) => ({
              name,
              sales,
            })
          )
          .sort(
            (a, b) =>
              b.sales -
              a.sales
          );


      return res.status(200).json({
        success: true,

        categories,

        dishes,

        categorySales,

        totalSales:
          dishes.reduce(
            (
              sum,
              dish
            ) =>
              sum +
              Number(
                dish.sales || 0
              ),
            0
          ),

        totalQuantity:
          dishes.reduce(
            (
              sum,
              dish
            ) =>
              sum +
              Number(
                dish.quantity || 0
              ),
            0
          ),
      });

    } catch (error) {

      console.error(
        "Admin popular dishes error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load popular dishes",
      });
    }
  }
);

/* =========================================================
   TABLE & WAITER PERFORMANCE ANALYTICS
   =========================================================

   GET /api/admin/analytics/table-performance

   Returns:

   1. Tables served by each waiter
      - Counted from PAID bills.
      - Each completed/paid table session counts as served.

   2. Tables currently assisted
      - Based on the current Table collection.
      - AVAILABLE = available
      - Any assigned/active table = occupied

   Admin only.
   ========================================================= */

router.get(
  "/analytics/table-performance",
  authenticate,
  authorizeRoles("ADMIN"),

  async (req, res) => {
    try {
      /* =====================================================
         TABLES SERVED BY WAITERS
         =====================================================

         A table is considered served when its bill is PAID.

         This uses actual billing transactions as the source
         of truth rather than maintaining a separate counter.
         ===================================================== */

      const paidBills = await Bill.find({
        status: "PAID",
        waiterId: {
          $ne: null,
        },
      })
        .select(
          "_id tableId tableNumber waiterId paidAt createdAt"
        )
        .populate({
          path: "waiterId",
          select: "_id name email role imageUrl profileImage",
        })
        .lean();


      /* =====================================================
         GROUP SERVED TABLES BY WAITER
         ===================================================== */

      const waiterMap = new Map();

      paidBills.forEach((bill) => {
        if (!bill.waiterId) {
          return;
        }

        const waiterId =
          String(bill.waiterId._id);

        if (!waiterMap.has(waiterId)) {
          waiterMap.set(waiterId, {
            waiterId: bill.waiterId._id,
            waiterName:
              bill.waiterId.name ||
              "Unknown Waiter",
            email:
              bill.waiterId.email ||
              "",
            imageUrl:
              bill.waiterId.imageUrl ||
              bill.waiterId.profileImage ||
              "",
            tablesServed: 0,
          });
        }

        waiterMap.get(waiterId).tablesServed += 1;
      });


      const tablesServedByWaiter =
        Array.from(
          waiterMap.values()
        ).sort(
          (a, b) =>
            b.tablesServed -
            a.tablesServed
        );


      /* =====================================================
         CURRENT TABLE ASSISTANCE
         ===================================================== */

      const tables =
        await Table.find({})
          .select(
            "_id tableNumber status waiterId assignedAt billRequestedAt"
          )
          .populate({
            path: "waiterId",
            select:
              "_id name email role imageUrl profileImage",
          })
          .sort({
            tableNumber: 1,
          })
          .lean();


      /* =====================================================
         OCCUPIED / AVAILABLE COUNTS
         ===================================================== */

      let occupiedTables = 0;
      let availableTables = 0;

      const currentlyAssisted =
        [];

      tables.forEach((table) => {
        const status =
          String(
            table.status || ""
          ).toUpperCase();

        if (status === "AVAILABLE") {
          availableTables += 1;
          return;
        }

        occupiedTables += 1;

        currentlyAssisted.push({
          tableId:
            table._id,

          tableNumber:
            table.tableNumber,

          status:
            table.status,

          waiter: table.waiterId
            ? {
                _id:
                  table.waiterId._id,

                name:
                  table.waiterId.name,

                email:
                  table.waiterId.email,

                imageUrl:
                  table.waiterId.imageUrl ||
                  table.waiterId.profileImage ||
                  "",
              }
            : null,

          assignedAt:
            table.assignedAt,

          billRequestedAt:
            table.billRequestedAt,
        });
      });


      /* =====================================================
         RESPONSE
         ===================================================== */

      return res.status(200).json({
        success: true,

        tablesServedByWaiter,

        currentAssistance: {
          occupied:
            occupiedTables,

          available:
            availableTables,

          total:
            tables.length,

          tables:
            currentlyAssisted,
        },
      });

    } catch (error) {

      console.error(
        "Admin table performance analytics error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load table performance analytics",
      });
    }
  }
);

/* =========================================================
   ADMIN TABLE PERFORMANCE ANALYTICS

   GET /api/admin/analytics/table-performance

   Shows:
   - Tables served by each waiter
   - Currently occupied tables
   - Currently available tables
   - Currently assisted table details

   Only PAID bills count as served tables.
   ========================================================= */

router.get(
  "/analytics/table-performance",
  authenticate,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      /* =====================================================
         TABLES SERVED BY WAITER

         A PAID bill represents one completed table session.
         ===================================================== */

      const paidBills = await Bill.find({
        status: "PAID",
        waiterId: { $ne: null },
      })
        .select(
          "_id tableId tableNumber waiterId paidAt createdAt"
        )
        .populate({
          path: "waiterId",
          select:
            "_id name email role imageUrl profileImage",
        })
        .lean();

      const waiterMap = new Map();

      paidBills.forEach((bill) => {
        if (!bill.waiterId) {
          return;
        }

        const waiterId =
          String(bill.waiterId._id);

        if (!waiterMap.has(waiterId)) {
          waiterMap.set(waiterId, {
            waiterId: bill.waiterId._id,
            waiterName:
              bill.waiterId.name ||
              "Unknown Waiter",
            email:
              bill.waiterId.email ||
              "",
            imageUrl:
              bill.waiterId.imageUrl ||
              bill.waiterId.profileImage ||
              "",
            tablesServed: 0,
          });
        }

        waiterMap.get(waiterId).tablesServed += 1;
      });

      const tablesServedByWaiter =
        Array.from(
          waiterMap.values()
        ).sort(
          (a, b) =>
            b.tablesServed -
            a.tablesServed
        );

      /* =====================================================
         CURRENT TABLE ASSISTANCE
         ===================================================== */

      const tables = await Table.find({})
        .select(
          "_id tableNumber status waiterId assignedAt billRequestedAt"
        )
        .populate({
          path: "waiterId",
          select:
            "_id name email role imageUrl profileImage",
        })
        .sort({
          tableNumber: 1,
        })
        .lean();

      let occupiedTables = 0;
      let availableTables = 0;

      const currentlyAssisted = [];

      tables.forEach((table) => {
        const status =
          String(
            table.status || ""
          ).toUpperCase();

        if (status === "AVAILABLE") {
          availableTables += 1;
          return;
        }

        occupiedTables += 1;

        currentlyAssisted.push({
          tableId: table._id,
          tableNumber:
            table.tableNumber,
          status: table.status,

          waiter: table.waiterId
            ? {
                _id:
                  table.waiterId._id,

                name:
                  table.waiterId.name,

                email:
                  table.waiterId.email,

                imageUrl:
                  table.waiterId.imageUrl ||
                  table.waiterId.profileImage ||
                  "",
              }
            : null,

          assignedAt:
            table.assignedAt,

          billRequestedAt:
            table.billRequestedAt,
        });
      });

      return res.status(200).json({
        success: true,

        tablesServedByWaiter,

        currentAssistance: {
          occupied:
            occupiedTables,

          available:
            availableTables,

          total:
            tables.length,

          tables:
            currentlyAssisted,
        },
      });
    } catch (error) {
      console.error(
        "Admin table performance analytics error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load table performance analytics",
      });
    }
  }
);

/* =========================================================
   ADMIN MENU ITEMS
   =========================================================

   GET    /api/admin/menu-items
   POST   /api/admin/menu-items
   PATCH  /api/admin/menu-items/:id
   PATCH  /api/admin/menu-items/:id/availability
   DELETE /api/admin/menu-items/:id

   ADMIN ONLY
   ========================================================= */

router.get(
  "/menu-items",
  authenticate,
  authorizeRoles("ADMIN"),
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
        items: menuItems,
      });
    } catch (error) {
      console.error(
        "Admin get menu items error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load menu items",
      });
    }
  }
);


/* =========================================================
   ADD MENU ITEM
   ========================================================= */

router.post(
  "/menu-items",
  authenticate,
  authorizeRoles("ADMIN"),
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
        "Admin add menu item error:",
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
   UPDATE MENU ITEM
   ========================================================= */

router.patch(
  "/menu-items/:id",
  authenticate,
  authorizeRoles("ADMIN"),
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

      const menuItem =
        await MenuItem.findById(
          menuItemId
        );

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message:
            "Menu item not found",
        });
      }

      if (
        req.body?.name !==
        undefined
      ) {
        const name =
          String(
            req.body.name
          ).trim();

        if (!name) {
          return res.status(400).json({
            success: false,
            message:
              "Menu item name is required",
          });
        }

        menuItem.name = name;
      }

      if (
        req.body?.category !==
        undefined
      ) {
        const category =
          String(
            req.body.category
          ).trim();

        if (!category) {
          return res.status(400).json({
            success: false,
            message:
              "Category is required",
          });
        }

        menuItem.category =
          category;
      }

      if (
        req.body?.price !==
        undefined
      ) {
        const price =
          Number(
            req.body.price
          );

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

        menuItem.price = price;
      }

      if (
        req.body?.imageUrl !==
        undefined
      ) {
        menuItem.imageUrl =
          String(
            req.body.imageUrl || ""
          ).trim();
      }

      if (
        typeof req.body?.isAvailable ===
        "boolean"
      ) {
        menuItem.isAvailable =
          req.body.isAvailable;
      }

      await menuItem.save();

      return res.status(200).json({
        success: true,
        message:
          "Menu item updated successfully",
        menuItem,
      });
    } catch (error) {
      console.error(
        "Admin update menu item error:",
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
   UPDATE AVAILABILITY
   ========================================================= */

router.patch(
  "/menu-items/:id/availability",
  authenticate,
  authorizeRoles("ADMIN"),
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
          isAvailable
            ? "Menu item is now available"
            : "Menu item is now unavailable",
        menuItem,
      });
    } catch (error) {
      console.error(
        "Admin menu availability error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update menu item availability",
      });
    }
  }
);


/* =========================================================
   DELETE MENU ITEM
   ========================================================= */

router.delete(
  "/menu-items/:id",
  authenticate,
  authorizeRoles("ADMIN"),
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
        "Admin delete menu item error:",
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
   EXPORT
   ========================================================= */

export default router;