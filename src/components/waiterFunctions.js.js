// ============================================================
// waiterFunctions.js
// KitchenFlow Waiter API / business functions
// ============================================================

const API_URL = "http://localhost:5000/api";

// ============================================================
// GENERIC API REQUEST
// ============================================================

export const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || "Something went wrong"
    );
  }

  return data;
};

// ============================================================
// LOAD ALL TABLES
// GET /api/waiter/tables
// ============================================================

export const loadTables = async ({
  force = false,
  loadedRef,
  setLoadingTables,
  setTables,
  showMessage,
}) => {
  if (!force && loadedRef.current.tables) {
    return;
  }

  try {
    setLoadingTables(true);

    const data = await apiRequest("/waiter/tables");

    setTables(data?.tables || []);

    loadedRef.current.tables = true;
  } catch (error) {
    console.error("Tables load error:", error);

    loadedRef.current.tables = false;

    showMessage(
      "error",
      error?.message || "Unable to load tables"
    );
  } finally {
    setLoadingTables(false);
  }
};

// ============================================================
// LOAD MENU
// GET /api/waiter/menu
// ============================================================

export const loadMenu = async ({
  force = false,
  loadedRef,
  setMenuItems,
}) => {
  if (!force && loadedRef.current.menu) {
    return;
  }

  try {
    const data = await apiRequest("/waiter/menu");

    setMenuItems(data?.menuItems || []);

    loadedRef.current.menu = true;
  } catch (error) {
    console.error("Menu load error:", error);

    loadedRef.current.menu = false;

    throw error;
  }
};

// ============================================================
// LOAD TABLES PICKED BY CURRENT WAITER
// GET /api/waiter/my-tables
// ============================================================

export const loadPickedTables = async ({
  force = false,
  loadedRef,
  setLoadingPickedTables,
  setPickedTables,
  showMessage,
}) => {
  if (!force && loadedRef.current.picked) {
    return;
  }

  try {
    setLoadingPickedTables(true);

    const data = await apiRequest(
      "/waiter/my-tables"
    );

    setPickedTables(data?.tables || []);

    loadedRef.current.picked = true;
  } catch (error) {
    console.error(
      "Picked tables load error:",
      error
    );

    loadedRef.current.picked = false;

    showMessage(
      "error",
      error?.message ||
        "Unable to load picked tables"
    );
  } finally {
    setLoadingPickedTables(false);
  }
};

// ============================================================
// LOAD ORDERS FOR TABLE
// ============================================================

export const loadTableOrders = async ({
  tableId,
  setTableOrders,
  showMessage,
}) => {
  try {
    const data = await apiRequest(
      `/waiter/tables/${tableId}/orders`
    );

    setTableOrders((previous) => ({
      ...previous,
      [tableId]: data?.orders || [],
    }));

    return data?.orders || [];
  } catch (error) {
    console.error(
      "Table orders error:",
      error
    );

    showMessage(
      "error",
      error?.message ||
        "Unable to load table orders"
    );

    throw error;
  }
};

// ============================================================
// LOAD BILLS
// GET /api/waiter/bills
// ============================================================

export const loadBills = async ({
  filters = {},
  setLoadingBills,
  setBills,
  showMessage,
}) => {
  try {
    setLoadingBills(true);

    const params = new URLSearchParams();

    if (filters.date) {
      params.append(
        "date",
        filters.date
      );
    }

    if (
      filters.billNumber &&
      String(filters.billNumber).trim()
    ) {
      params.append(
        "billNumber",
        String(filters.billNumber).trim()
      );
    }

    const query = params.toString()
      ? `?${params.toString()}`
      : "";

    const data = await apiRequest(
      `/waiter/bills${query}`
    );

    setBills(data?.bills || []);
  } catch (error) {
    console.error(
      "Bills load error:",
      error
    );

    showMessage(
      "error",
      error?.message ||
        "Unable to load bills"
    );
  } finally {
    setLoadingBills(false);
  }
};

// ============================================================
// LOAD READY ORDERS
// ============================================================

export const loadReadyOrders = async ({
  force = false,
  loadedRef,
  setReadyOrders,
  setReadyNotification,
}) => {
  if (
    !force &&
    loadedRef.current.ready
  ) {
    return;
  }

  try {
    const data = await apiRequest(
      "/waiter/ready-orders"
    );

    const orders =
      data?.orders || [];

    setReadyOrders(orders);

    if (orders.length > 0) {
      setReadyNotification(
        orders[0]
      );
    }

    loadedRef.current.ready = true;
  } catch (error) {
    console.error(
      "Ready order error:",
      error
    );

    loadedRef.current.ready = false;
  }
};

// ============================================================
// PICK TABLE
// PATCH /api/waiter/tables/:id/pick
// ============================================================

export const pickTable = async ({
  table,
  setActionLoading,
  setTables,
  setPickedTables,
  loadedRef,
  showMessage,
}) => {
  try {
    setActionLoading(
      `pick-${table._id}`
    );

    const data = await apiRequest(
      `/waiter/tables/${table._id}/pick`,
      {
        method: "PATCH",
      }
    );

    const updatedTable =
      data?.table;

    if (updatedTable) {
      setTables((current) =>
        current.map((item) =>
          String(item._id) ===
          String(updatedTable._id)
            ? updatedTable
            : item
        )
      );

      setPickedTables((current) => {
        const exists =
          current.some(
            (item) =>
              String(item._id) ===
              String(updatedTable._id)
          );

        if (exists) {
          return current.map(
            (item) =>
              String(item._id) ===
              String(updatedTable._id)
                ? updatedTable
                : item
          );
        }

        return [
          ...current,
          updatedTable,
        ];
      });
    }

    loadedRef.current.picked =
      true;

    showMessage(
      "success",
      `Table ${table.tableNumber} picked successfully`
    );
  } catch (error) {
    console.error(
      "Pick table error:",
      error
    );

    showMessage(
      "error",
      error?.message ||
        "Unable to pick table"
    );
  } finally {
    setActionLoading("");
  }
};

// ============================================================
// DROP TABLE
// PATCH /api/waiter/tables/:id/drop
// ============================================================

export const dropTable = async ({
  table,
  setActionLoading,
  setTables,
  setPickedTables,
  setTableOrders,
  setExpandedTable,
  setDropConfirmTable,
  loadedRef,
  showMessage,
}) => {
  if (!table?._id) {
    return;
  }

  try {
    setActionLoading(
      `drop-${table._id}`
    );

    const data = await apiRequest(
      `/waiter/tables/${table._id}/drop`,
      {
        method: "PATCH",
      }
    );

    const updatedTable =
      data?.table;

    if (updatedTable) {
      setTables((current) =>
        current.map((item) =>
          String(item._id) ===
          String(updatedTable._id)
            ? updatedTable
            : item
        )
      );
    }

    setPickedTables((current) =>
      current.filter(
        (item) =>
          String(item._id) !==
          String(table._id)
      )
    );

    setTableOrders((current) => {
      const next = {
        ...current,
      };

      delete next[
        table._id
      ];

      return next;
    });

    setExpandedTable(null);

    setDropConfirmTable(null);

    loadedRef.current.picked =
      true;

    showMessage(
      "success",
      `Table ${table.tableNumber} is now available`
    );
  } catch (error) {
    console.error(
      "Drop table error:",
      error
    );

    showMessage(
      "error",
      error?.message ||
        "Unable to drop table"
    );
  } finally {
    setActionLoading("");
  }
};

// ============================================================
// PLACE ORDER
// POST /api/waiter/tables/:id/orders
// ============================================================

export const placeOrder = async ({
  table,
  menuItems,
  orderDrafts,
  setActionLoading,
  setOrderDrafts,
  loadTableOrders,
  showMessage,
}) => {
  const tableDraft =
    orderDrafts[
      table._id
    ] || {};

  const selectedItems =
    menuItems
      .filter(
        (item) =>
          tableDraft[
            item._id
          ]?.selected
      )
      .map((item) => ({
        menuItemId:
          item._id,

        quantity:
          Number(
            tableDraft[
              item._id
            ]?.quantity || 1
          ),

        instruction:
          tableDraft[
            item._id
          ]?.instruction || "",
      }));

  if (
    selectedItems.length === 0
  ) {
    showMessage(
      "error",
      "Select at least one dish"
    );

    return;
  }

  try {
    setActionLoading(
      `order-${table._id}`
    );

    await apiRequest(
      `/waiter/tables/${table._id}/orders`,
      {
        method: "POST",

        body: JSON.stringify({
          items: selectedItems,
        }),
      }
    );

    showMessage(
      "success",
      "Order placed successfully"
    );

    setOrderDrafts(
      (previous) => ({
        ...previous,
        [table._id]: {},
      })
    );

    await loadTableOrders(
      table._id
    );
  } catch (error) {
    console.error(
      "Place order error:",
      error
    );

    showMessage(
      "error",
      error?.message ||
        "Unable to place order"
    );
  } finally {
    setActionLoading("");
  }
};

// ============================================================
// SERVE ORDER
// PATCH /api/waiter/orders/:id/serve
// ============================================================

export const serveOrder = async ({
  order,
  setActionLoading,
  setServeOrder,
  setReadyNotification,
  setReadyOrders,
  loadTableOrders,
  showMessage,
}) => {
  if (!order?._id) {
    return;
  }

  try {
    setActionLoading(
      `serve-${order._id}`
    );

    await apiRequest(
      `/waiter/orders/${order._id}/serve`,
      {
        method: "PATCH",
      }
    );

    showMessage(
      "success",
      "Order marked as served"
    );

    setServeOrder(null);

    setReadyNotification(
      null
    );

    setReadyOrders(
      (previous) =>
        previous.filter(
          (item) =>
            String(item._id) !==
            String(order._id)
        )
    );

    if (order.tableId) {
      await loadTableOrders(
        order.tableId
      );
    }
  } catch (error) {
    console.error(
      "Serve order error:",
      error
    );

    showMessage(
      "error",
      error?.message ||
        "Unable to serve order"
    );
  } finally {
    setActionLoading("");
  }
};

// ============================================================
// CHECKOUT TABLE
// POST /api/waiter/tables/:id/checkout
// ============================================================

export const checkoutTable = async ({
  table,
  setActionLoading,
  setTables,
  setPickedTables,
  setBills,
  setExpandedTable,
  setCheckoutConfirmTable,
  loadedRef,
  showMessage,
}) => {
  if (!table?._id) {
    return;
  }

  try {
    setActionLoading(
      `checkout-${table._id}`
    );

    const data =
      await apiRequest(
        `/waiter/tables/${table._id}/checkout`,
        {
          method: "POST",
        }
      );

    setTables((current) =>
      current.map((item) =>
        String(item._id) ===
        String(table._id)
          ? {
              ...item,
              status:
                "BILL_REQUESTED",
            }
          : item
      )
    );

    setPickedTables(
      (current) =>
        current.map((item) =>
          String(item._id) ===
          String(table._id)
            ? {
                ...item,
                status:
                  "BILL_REQUESTED",
              }
            : item
        )
    );

    if (data?.bill) {
      setBills((current) => [
        data.bill,

        ...current.filter(
          (bill) =>
            String(bill._id) !==
            String(data.bill._id)
        ),
      ]);
    }

    setExpandedTable(null);

    setCheckoutConfirmTable(
      null
    );

    loadedRef.current.bills =
      true;

    showMessage(
      "success",
      `Checkout request sent for Table ${table.tableNumber}`
    );
  } catch (error) {
    console.error(
      "Checkout error:",
      error
    );

    showMessage(
      "error",
      error?.message ||
        "Unable to checkout table"
    );
  } finally {
    setActionLoading("");
  }
};

// ============================================================
// LOGOUT
// ============================================================

export const logoutWaiter =
  async ({ navigate }) => {
    try {
      await fetch(
        `${API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "kitchenFlowUser"
      );

      navigate("/");
    }
  };

// ============================================================
// TABLE STATISTICS
// ============================================================

export const getTableStats = (
  tables = []
) => {
  return {
    total: tables.length,

    available:
      tables.filter(
        (table) =>
          table.status ===
          "AVAILABLE"
      ).length,

    occupied:
      tables.filter(
        (table) =>
          table.status !==
          "AVAILABLE"
      ).length,
  };
};

// ============================================================
// DATE FORMAT
// ============================================================

export const formatDate = (
  dateValue
) => {
  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString();
};