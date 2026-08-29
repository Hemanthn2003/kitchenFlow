import {
  configureStore,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";


/* =========================================================
   API
   ========================================================= */

const API_URL =
  "http://localhost:5000";


/* =========================================================
   CACHE DURATIONS
   ========================================================= */

const CACHE_DURATION = {
  users: 30000,
  orders: 15000,
  menuItems: 60000,
  tables: 15000,
  bills: 30000,
};


/* =========================================================
   USER NORMALIZER
   ========================================================= */

const normalizeUser = (
  user
) => {
  if (!user) {
    return null;
  }

  const resolvedImageUrl =
    user.imageUrl ||
    user.profileImage ||
    user.profilePicture ||
    user.avatar ||
    user.image ||
    "";

  return {
    ...user,

    imageUrl:
      resolvedImageUrl,

    profileImage:
      resolvedImageUrl,

    currentTable:
      user.currentTable === null ||
      user.currentTable === undefined ||
      user.currentTable === ""
        ? null
        : user.currentTable,
  };
};


/* =========================================================
   MENU ITEM NORMALIZER
   ========================================================= */

const normalizeMenuItem = (
  item
) => {
  if (!item) {
    return item;
  }

  const resolvedImageUrl =
    item.imageUrl ||
    item.image ||
    item.imagePath ||
    item.photo ||
    "";

  return {
    ...item,

    imageUrl:
      resolvedImageUrl,
  };
};


/* =========================================================
   TABLE NORMALIZER
   ========================================================= */

const normalizeTable = (
  table
) => {
  if (!table) {
    return table;
  }

  return {
    ...table,

    status:
      table.status ||
      "AVAILABLE",

    waiterId:
      table.waiterId ||
      null,

    assignedAt:
      table.assignedAt ||
      null,

    billRequestedAt:
      table.billRequestedAt ||
      null,
  };
};


/* =========================================================
   BILL NORMALIZER
   ========================================================= */

const normalizeBill = (
  bill
) => {
  if (!bill) {
    return bill;
  }

  return {
    ...bill,

    items:
      Array.isArray(
        bill.items
      )
        ? bill.items
        : [],

    orderIds:
      Array.isArray(
        bill.orderIds
      )
        ? bill.orderIds
        : [],

    discount:
      Number(
        bill.discount || 0
      ),

    tax:
      Number(
        bill.tax || 0
      ),

    subtotal:
      Number(
        bill.subtotal || 0
      ),

    totalAmount:
      Number(
        bill.totalAmount || 0
      ),
  };
};


/* =========================================================
   FETCH ACTIVE USERS
   ========================================================= */

export const fetchActiveUsers =
  createAsyncThunk(
    "kitchen/fetchActiveUsers",

    async (
      { force = false } = {},
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {

        const state =
          getState();

        const lastFetched =
          state.kitchen.lastFetched.users;

        const users =
          state.kitchen.users;

        const usersAlreadyLoaded =
          Boolean(
            users.manager
          ) ||
          users.waiters.length > 0 ||
          users.kitchenStaff.length > 0;


        if (
          !force &&
          usersAlreadyLoaded &&
          lastFetched &&
          Date.now() -
            lastFetched <
            CACHE_DURATION.users
        ) {
          return {
            cached: true,

            manager:
              users.manager,

            waiters:
              users.waiters,

            kitchenStaff:
              users.kitchenStaff,
          };
        }


        const response =
          await fetch(
            `${API_URL}/api/manager/active-users`,
            {
              method: "GET",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          return rejectWithValue(
            data.message ||
              "Unable to load active users"
          );
        }


        const manager =
          Array.isArray(
            data.manager
          )
            ? normalizeUser(
                data.manager[0]
              )
            : normalizeUser(
                data.manager
              );


        const waiters =
          Array.isArray(
            data.waiters
          )
            ? data.waiters.map(
                normalizeUser
              )
            : [];


        const kitchenStaff =
          Array.isArray(
            data.kitchen
          )
            ? data.kitchen.map(
                normalizeUser
              )
            : Array.isArray(
                data.kitchenStaff
              )
            ? data.kitchenStaff.map(
                normalizeUser
              )
            : [];


        return {
          cached: false,

          manager,

          waiters,

          kitchenStaff,
        };

      } catch (error) {

        return rejectWithValue(
          error.message ||
            "Unable to load active users"
        );

      }
    },

    {
      condition: (
        { force = false } = {},
        { getState }
      ) => {

        const state =
          getState();

        if (
          state.kitchen.loading.users
        ) {
          return false;
        }

        return true;
      },
    }
  );


/* =========================================================
   FETCH TABLES
   ========================================================= */

export const fetchTables =
  createAsyncThunk(
    "kitchen/fetchTables",

    async (
      { force = false } = {},
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {

        const state =
          getState();

        const lastFetched =
          state.kitchen.lastFetched.tables;

        const existingTables =
          state.kitchen.tables;


        /* -----------------------------------------------
           CACHE
           ----------------------------------------------- */

        if (
          !force &&
          existingTables.length > 0 &&
          lastFetched &&
          Date.now() -
            lastFetched <
            CACHE_DURATION.tables
        ) {
          return {
            cached: true,

            tables:
              existingTables,
          };
        }


        /* -----------------------------------------------
           API
           ----------------------------------------------- */

        const response =
          await fetch(
            `${API_URL}/api/tables`,
            {
              method: "GET",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          return rejectWithValue(
            data.message ||
              "Unable to load tables"
          );
        }


        let tables =
          [];


        if (
          Array.isArray(
            data.tables
          )
        ) {
          tables =
            data.tables;

        } else if (
          Array.isArray(
            data
          )
        ) {
          tables =
            data;

        } else if (
          Array.isArray(
            data.data
          )
        ) {
          tables =
            data.data;
        }


        return {
          cached: false,

          tables:
            tables.map(
              normalizeTable
            ),
        };

      } catch (error) {

        return rejectWithValue(
          error.message ||
            "Unable to load tables"
        );

      }
    },

    {
      condition: (
        { force = false } = {},
        { getState }
      ) => {

        const state =
          getState();

        if (
          state.kitchen.loading.tables
        ) {
          return false;
        }

        return true;
      },
    }
  );


/* =========================================================
   FETCH ORDERS
   ========================================================= */

export const fetchOrders =
  createAsyncThunk(
    "kitchen/fetchOrders",

    async (
      { force = false } = {},
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {

        const state =
          getState();

        const lastFetched =
          state.kitchen.lastFetched.orders;


        if (
          !force &&
          state.kitchen.orders.length >
            0 &&
          lastFetched &&
          Date.now() -
            lastFetched <
            CACHE_DURATION.orders
        ) {
          return {
            cached: true,

            orders:
              state.kitchen.orders,
          };
        }


        const response =
          await fetch(
            `${API_URL}/api/orders`,
            {
              method: "GET",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          return rejectWithValue(
            data.message ||
              "Unable to load orders"
          );
        }


        let orders =
          [];


        if (
          Array.isArray(
            data.orders
          )
        ) {
          orders =
            data.orders;

        } else if (
          Array.isArray(
            data
          )
        ) {
          orders =
            data;
        }


        return {
          cached: false,

          orders,
        };

      } catch (error) {

        return rejectWithValue(
          error.message ||
            "Unable to load orders"
        );

      }
    },

    {
      condition: (
        { force = false } = {},
        { getState }
      ) => {

        const state =
          getState();

        if (
          state.kitchen.loading.orders
        ) {
          return false;
        }

        return true;
      },
    }
  );


/* =========================================================
   FETCH MENU ITEMS
   ========================================================= */

export const fetchMenuItems =
  createAsyncThunk(
    "kitchen/fetchMenuItems",

    async (
      { force = false } = {},
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {

        const state =
          getState();

        const lastFetched =
          state.kitchen.lastFetched
            .menuItems;


        if (
          !force &&
          state.kitchen.menuItems
            .length > 0 &&
          lastFetched &&
          Date.now() -
            lastFetched <
            CACHE_DURATION.menuItems
        ) {
          return {
            cached: true,

            menuItems:
              state.kitchen.menuItems,
          };
        }


        const response =
          await fetch(
            `${API_URL}/api/menu`,
            {
              method: "GET",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          return rejectWithValue(
            data.message ||
              "Unable to load menu items"
          );
        }


        let menuItems =
          [];


        if (
          Array.isArray(
            data.menuItems
          )
        ) {
          menuItems =
            data.menuItems;

        } else if (
          Array.isArray(
            data.items
          )
        ) {
          menuItems =
            data.items;

        } else if (
          Array.isArray(
            data
          )
        ) {
          menuItems =
            data;
        }


        return {
          cached: false,

          menuItems:
            menuItems.map(
              normalizeMenuItem
            ),
        };

      } catch (error) {

        return rejectWithValue(
          error.message ||
            "Unable to load menu items"
        );

      }
    },

    {
      condition: (
        { force = false } = {},
        { getState }
      ) => {

        const state =
          getState();

        if (
          state.kitchen.loading
            .menuItems
        ) {
          return false;
        }

        return true;
      },
    }
  );


/* =========================================================
   FETCH BILLS
   ========================================================= */

export const fetchBills =
  createAsyncThunk(
    "kitchen/fetchBills",

    async (
      { force = false } = {},
      {
        getState,
        rejectWithValue,
      }
    ) => {
      try {

        const state =
          getState();

        const lastFetched =
          state.kitchen.lastFetched.bills;

        const existingBills =
          state.kitchen.bills;


        /* -----------------------------------------------
           CACHE
           ----------------------------------------------- */

        if (
          !force &&
          existingBills.length > 0 &&
          lastFetched &&
          Date.now() -
            lastFetched <
            CACHE_DURATION.bills
        ) {
          return {
            cached: true,

            bills:
              existingBills,
          };
        }


        /* -----------------------------------------------
           API
           ----------------------------------------------- */

        const response =
          await fetch(
            `${API_URL}/api/bills`,
            {
              method: "GET",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          return rejectWithValue(
            data.message ||
              "Unable to load bills"
          );
        }


        let bills =
          [];


        if (
          Array.isArray(
            data.bills
          )
        ) {
          bills =
            data.bills;

        } else if (
          Array.isArray(
            data
          )
        ) {
          bills =
            data;

        } else if (
          Array.isArray(
            data.data
          )
        ) {
          bills =
            data.data;
        }


        return {
          cached: false,

          bills:
            bills.map(
              normalizeBill
            ),
        };

      } catch (error) {

        return rejectWithValue(
          error.message ||
            "Unable to load bills"
        );

      }
    },

    {
      condition: (
        { force = false } = {},
        { getState }
      ) => {

        const state =
          getState();

        if (
          state.kitchen.loading.bills
        ) {
          return false;
        }

        return true;
      },
    }
  );


  

/* =========================================================
   REDUX SLICE
   ========================================================= */

const kitchenSlice =
  createSlice({

    name:
      "kitchen",


    initialState: {

      users: {
        manager:
          null,

        waiters:
          [],

        kitchenStaff:
          [],
      },


      tables:
        [],

      orders:
        [],

      menuItems:
        [],

      bills:
        [],


      loading: {

        users:
          false,

        tables:
          false,

        orders:
          false,

        menuItems:
          false,

        bills:
          false,
      },


      errors: {

        users:
          null,

        tables:
          null,

        orders:
          null,

        menuItems:
          null,

        bills:
          null,
      },


      lastFetched: {

        users:
          null,

        tables:
          null,

        orders:
          null,

        menuItems:
          null,

        bills:
          null,
      },
    },


    reducers: {


      /* =================================================
         USERS
         ================================================= */

      setUsers(
        state,
        action
      ) {

        const payload =
          action.payload ||
          {};


        state.users.manager =
          normalizeUser(
            payload.manager
          );


        state.users.waiters =
          Array.isArray(
            payload.waiters
          )
            ? payload.waiters.map(
                normalizeUser
              )
            : [];


        state.users.kitchenStaff =
          Array.isArray(
            payload.kitchenStaff
          )
            ? payload.kitchenStaff.map(
                normalizeUser
              )
            : [];


        state.lastFetched.users =
          Date.now();
      },


      updateUser(
        state,
        action
      ) {

        const user =
          normalizeUser(
            action.payload
          );


        if (
          !user?._id
        ) {
          return;
        }


        if (
          String(
            state.users.manager?._id
          ) ===
          String(
            user._id
          )
        ) {

          state.users.manager = {
            ...state.users.manager,
            ...user,
          };

        }


        state.users.waiters =
          state.users.waiters.map(
            (item) =>
              String(
                item._id
              ) ===
              String(
                user._id
              )
                ? {
                    ...item,
                    ...user,
                  }
                : item
          );


        state.users.kitchenStaff =
          state.users.kitchenStaff.map(
            (item) =>
              String(
                item._id
              ) ===
              String(
                user._id
              )
                ? {
                    ...item,
                    ...user,
                  }
                : item
          );
      },


      /* =================================================
         TABLES
         ================================================= */

      setTables(
        state,
        action
      ) {

        state.tables =
          Array.isArray(
            action.payload
          )
            ? action.payload.map(
                normalizeTable
              )
            : [];


        state.lastFetched.tables =
          Date.now();
      },


      addTable(
        state,
        action
      ) {

        const table =
          normalizeTable(
            action.payload
          );

        if (
          !table
        ) {
          return;
        }

        state.tables.push(
          table
        );
      },


      updateTable(
        state,
        action
      ) {

        const updatedTable =
          normalizeTable(
            action.payload
          );


        const index =
          state.tables.findIndex(
            (table) =>
              String(
                table._id
              ) ===
              String(
                updatedTable?._id
              )
          );


        if (
          index !== -1
        ) {

          state.tables[
            index
          ] = {
            ...state.tables[
              index
            ],
            ...updatedTable,
          };

        }
      },


      removeTable(
        state,
        action
      ) {

        state.tables =
          state.tables.filter(
            (table) =>
              String(
                table._id
              ) !==
              String(
                action.payload
              )
          );
      },


      /* =================================================
         ORDERS
         ================================================= */

      setOrders(
        state,
        action
      ) {

        state.orders =
          Array.isArray(
            action.payload
          )
            ? action.payload
            : [];


        state.lastFetched.orders =
          Date.now();
      },


      addOrder(
        state,
        action
      ) {

        state.orders.unshift(
          action.payload
        );
      },


      updateOrder(
        state,
        action
      ) {

        const updatedOrder =
          action.payload;


        const index =
          state.orders.findIndex(
            (order) =>
              String(
                order._id
              ) ===
              String(
                updatedOrder?._id
              )
          );


        if (
          index !== -1
        ) {

          state.orders[
            index
          ] = {
            ...state.orders[
              index
            ],
            ...updatedOrder,
          };

        }
      },


      updateOrderStatusLocal(
        state,
        action
      ) {

        const {
          orderId,
          status,
        } =
          action.payload;


        const order =
          state.orders.find(
            (item) =>
              String(
                item._id
              ) ===
              String(
                orderId
              )
          );


        if (order) {

          order.status =
            status;

        }
      },


      removeOrder(
        state,
        action
      ) {

        state.orders =
          state.orders.filter(
            (order) =>
              String(
                order._id
              ) !==
              String(
                action.payload
              )
          );
      },


      /* =================================================
         MENU ITEMS
         ================================================= */

      setMenuItems(
        state,
        action
      ) {

        state.menuItems =
          Array.isArray(
            action.payload
          )
            ? action.payload.map(
                normalizeMenuItem
              )
            : [];


        state.lastFetched.menuItems =
          Date.now();
      },


      addMenuItem(
        state,
        action
      ) {

        state.menuItems.unshift(
          normalizeMenuItem(
            action.payload
          )
        );
      },


      updateMenuItem(
        state,
        action
      ) {

        const updatedItem =
          normalizeMenuItem(
            action.payload
          );


        const index =
          state.menuItems.findIndex(
            (item) =>
              String(
                item._id
              ) ===
              String(
                updatedItem?._id
              )
          );


        if (
          index !== -1
        ) {

          state.menuItems[
            index
          ] = {
            ...state.menuItems[
              index
            ],
            ...updatedItem,
          };

        }
      },


      updateMenuAvailabilityLocal(
        state,
        action
      ) {

        const {
          itemId,
          isAvailable,
        } =
          action.payload;


        const item =
          state.menuItems.find(
            (menuItem) =>
              String(
                menuItem._id
              ) ===
              String(
                itemId
              )
          );


        if (item) {

          item.isAvailable =
            isAvailable;

        }
      },


      deleteMenuItem(
        state,
        action
      ) {

        state.menuItems =
          state.menuItems.filter(
            (item) =>
              String(
                item._id
              ) !==
              String(
                action.payload
              )
          );
      },


      /* =================================================
         BILLS
         ================================================= */

      setBills(
        state,
        action
      ) {

        state.bills =
          Array.isArray(
            action.payload
          )
            ? action.payload.map(
                normalizeBill
              )
            : [];


        state.lastFetched.bills =
          Date.now();
      },


      addBill(
        state,
        action
      ) {

        const bill =
          normalizeBill(
            action.payload
          );

        if (
          !bill
        ) {
          return;
        }

        state.bills.unshift(
          bill
        );
      },


      updateBill(
        state,
        action
      ) {

        const updatedBill =
          normalizeBill(
            action.payload
          );


        const index =
          state.bills.findIndex(
            (bill) =>
              String(
                bill._id
              ) ===
              String(
                updatedBill?._id
              )
          );


        if (
          index !== -1
        ) {

          state.bills[
            index
          ] = {
            ...state.bills[
              index
            ],
            ...updatedBill,
          };

        }
      },


      removeBill(
        state,
        action
      ) {

        state.bills =
          state.bills.filter(
            (bill) =>
              String(
                bill._id
              ) !==
              String(
                action.payload
              )
          );
      },


      /* =================================================
         CLEAR ERROR
         ================================================= */

      clearKitchenError(
        state,
        action
      ) {

        const key =
          action.payload;


        if (
          key &&
          Object.prototype.hasOwnProperty.call(
            state.errors,
            key
          )
        ) {

          state.errors[
            key
          ] =
            null;

        }
      },


      /* =================================================
         CLEAR DATA / CACHE
         ================================================= */

      clearKitchenData(
        state,
        action
      ) {

        const keys =
          action.payload;


        if (
          !Array.isArray(
            keys
          )
        ) {
          return;
        }


        keys.forEach(
          (key) => {

            if (
              key ===
              "users"
            ) {

              state.users = {
                manager:
                  null,

                waiters:
                  [],

                kitchenStaff:
                  [],
              };

              state.lastFetched.users =
                null;
            }


            if (
              key ===
              "tables"
            ) {

              state.tables =
                [];

              state.lastFetched.tables =
                null;
            }


            if (
              key ===
              "orders"
            ) {

              state.orders =
                [];

              state.lastFetched.orders =
                null;
            }


            if (
              key ===
              "menuItems"
            ) {

              state.menuItems =
                [];

              state.lastFetched.menuItems =
                null;
            }


            if (
              key ===
              "bills"
            ) {

              state.bills =
                [];

              state.lastFetched.bills =
                null;
            }

          }
        );
      },
    },


    /* =====================================================
       ASYNC REDUCERS
       ===================================================== */

    extraReducers: (
      builder
    ) => {


      /* =================================================
         ACTIVE USERS
         ================================================= */

      builder

        .addCase(
          fetchActiveUsers.pending,
          (
            state
          ) => {

            state.loading.users =
              true;

            state.errors.users =
              null;
          }
        )

        .addCase(
          fetchActiveUsers.fulfilled,
          (
            state,
            action
          ) => {

            state.loading.users =
              false;


            if (
              action.payload.cached
            ) {
              return;
            }


            state.users.manager =
              action.payload.manager;

            state.users.waiters =
              action.payload.waiters;

            state.users.kitchenStaff =
              action.payload.kitchenStaff;

            state.lastFetched.users =
              Date.now();
          }
        )

        .addCase(
          fetchActiveUsers.rejected,
          (
            state,
            action
          ) => {

            state.loading.users =
              false;


            if (
              action.meta.aborted ||
              action.meta.condition
            ) {
              return;
            }


            state.errors.users =
              action.payload ||
              "Unable to load active users";
          }
        );


      /* =================================================
         TABLES
         ================================================= */

      builder

        .addCase(
          fetchTables.pending,
          (
            state
          ) => {

            state.loading.tables =
              true;

            state.errors.tables =
              null;
          }
        )

        .addCase(
          fetchTables.fulfilled,
          (
            state,
            action
          ) => {

            state.loading.tables =
              false;


            if (
              action.payload.cached
            ) {
              return;
            }


            state.tables =
              action.payload.tables;

            state.lastFetched.tables =
              Date.now();
          }
        )

        .addCase(
          fetchTables.rejected,
          (
            state,
            action
          ) => {

            state.loading.tables =
              false;


            if (
              action.meta.aborted ||
              action.meta.condition
            ) {
              return;
            }


            state.errors.tables =
              action.payload ||
              "Unable to load tables";
          }
        );


      /* =================================================
         ORDERS
         ================================================= */

      builder

        .addCase(
          fetchOrders.pending,
          (
            state
          ) => {

            state.loading.orders =
              true;

            state.errors.orders =
              null;
          }
        )

        .addCase(
          fetchOrders.fulfilled,
          (
            state,
            action
          ) => {

            state.loading.orders =
              false;


            if (
              action.payload.cached
            ) {
              return;
            }


            state.orders =
              action.payload.orders;

            state.lastFetched.orders =
              Date.now();
          }
        )

        .addCase(
          fetchOrders.rejected,
          (
            state,
            action
          ) => {

            state.loading.orders =
              false;


            if (
              action.meta.aborted ||
              action.meta.condition
            ) {
              return;
            }


            state.errors.orders =
              action.payload ||
              "Unable to load orders";
          }
        );


      /* =================================================
         MENU ITEMS
         ================================================= */

      builder

        .addCase(
          fetchMenuItems.pending,
          (
            state
          ) => {

            state.loading.menuItems =
              true;

            state.errors.menuItems =
              null;
          }
        )

        .addCase(
          fetchMenuItems.fulfilled,
          (
            state,
            action
          ) => {

            state.loading.menuItems =
              false;


            if (
              action.payload.cached
            ) {
              return;
            }


            state.menuItems =
              action.payload.menuItems;

            state.lastFetched.menuItems =
              Date.now();
          }
        )

        .addCase(
          fetchMenuItems.rejected,
          (
            state,
            action
          ) => {

            state.loading.menuItems =
              false;


            if (
              action.meta.aborted ||
              action.meta.condition
            ) {
              return;
            }


            state.errors.menuItems =
              action.payload ||
              "Unable to load menu items";
          }
        );


      /* =================================================
         BILLS
         ================================================= */

      builder

        .addCase(
          fetchBills.pending,
          (
            state
          ) => {

            state.loading.bills =
              true;

            state.errors.bills =
              null;
          }
        )

        .addCase(
          fetchBills.fulfilled,
          (
            state,
            action
          ) => {

            state.loading.bills =
              false;


            if (
              action.payload.cached
            ) {
              return;
            }


            state.bills =
              action.payload.bills;

            state.lastFetched.bills =
              Date.now();
          }
        )

        .addCase(
          fetchBills.rejected,
          (
            state,
            action
          ) => {

            state.loading.bills =
              false;


            if (
              action.meta.aborted ||
              action.meta.condition
            ) {
              return;
            }


            state.errors.bills =
              action.payload ||
              "Unable to load bills";
          }
        );
    },
  });


/* =========================================================
   ACTION EXPORTS
   ========================================================= */

export const {

  /* USERS */

  setUsers,

  updateUser,


  /* TABLES */

  setTables,

  addTable,

  updateTable,

  removeTable,


  /* ORDERS */

  setOrders,

  addOrder,

  updateOrder,

  updateOrderStatusLocal,

  removeOrder,


  /* MENU */

  setMenuItems,

  addMenuItem,

  updateMenuItem,

  updateMenuAvailabilityLocal,

  deleteMenuItem,


  /* BILLS */

  setBills,

  addBill,

  updateBill,

  removeBill,


  /* UTILITIES */

  clearKitchenError,

  clearKitchenData,

} =
  kitchenSlice.actions;


/* =========================================================
   STORE
   ========================================================= */

const store =
  configureStore({

    reducer: {

      kitchen:
        kitchenSlice.reducer,

    },

  });


export default store;