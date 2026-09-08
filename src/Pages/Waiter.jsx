import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Header from "../components/Header.jsx";
import Icon from "../components/Icon.jsx";

import WaiterSidebar from "../components/WaiterSidebar.jsx";
import WaiterTablesPage from "../components/WaiterTablesPage.jsx";
import WaiterPickedTablesPage from "../components/WaiterPickedTablesPage.jsx";
import WaiterBillsPage from "../components/WaiterBillsPage.jsx";
import WaiterOrderList from "../components/waiterorderlist.jsx";

import {
  DropTableModal,
  CheckoutModal,
} from "../components/WaiterModals.jsx";

import {
  loadTables,
  loadMenu,
  loadPickedTables,
  loadTableOrders,
  loadBills,
  loadMyOrders,
  pickTable,
  dropTable,
  placeOrder,
  checkoutTable,
  logoutWaiter,
  getTableStats,
} from "../components/waiterFunctions.js";

import "./Waiter.css";
import "./WaiterDropModal.css";

const API_URL = import.meta.env.VITE_API_URL;
const Waiter = () => {
  const navigate = useNavigate();

  // ==========================================================
  // USER
  // ==========================================================

  const [user, setUser] = useState(null);

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const [menuOpen, setMenuOpen] = useState(false);

  const [activePage, setActivePage] = useState("tables");

  // ==========================================================
  // WAITER HEADER TITLE
  // ==========================================================

  const headerPage = useMemo(() => {
    if (activePage === "tables") {
      return "Waiter";
    }

    if (activePage === "picked") {
      return "Your Tables";
    }

    if (activePage === "bills") {
      return "Bills";
    }

    return "Waiter";
  }, [activePage]);

  // ==========================================================
  // DATA
  // ==========================================================

  const [tables, setTables] = useState([]);

  const [menuItems, setMenuItems] = useState([]);

  const [pickedTables, setPickedTables] = useState([]);

  const [tableOrders, setTableOrders] = useState({});

  const [bills, setBills] = useState([]);

  const [myOrders, setMyOrders] = useState([]);
  // ==========================================================
  // LOADING
  // ==========================================================

  const [loadingTables, setLoadingTables] = useState(false);

  const [loadingPickedTables, setLoadingPickedTables] =
    useState(false);

  const [loadingBills, setLoadingBills] = useState(false);

  const [loadingMyOrders, setLoadingMyOrders] =
  useState(false);

  const [actionLoading, setActionLoading] = useState("");

  // ==========================================================
  // ORDER
  // ==========================================================

  const [expandedTable, setExpandedTable] = useState(null);

  const [orderDrafts, setOrderDrafts] = useState({});

  // ==========================================================
  // CONFIRMATION MODALS
  // ==========================================================

  const [dropConfirmTable, setDropConfirmTable] =
    useState(null);

  const [checkoutConfirmTable, setCheckoutConfirmTable] =
    useState(null);

  // ==========================================================
  // BILL FILTER
  // ==========================================================

  const [billDate, setBillDate] = useState("");

  const [billNumber, setBillNumber] = useState("");

  // ==========================================================
  // TOAST
  // ==========================================================

  const [message, setMessage] = useState(null);

  // ==========================================================
  // LOAD TRACKING
  // ==========================================================

  const loadedRef = useRef({
    tables: false,
    menu: false,
    picked: false,
    bills: false,
   myOrders: false,
  });

  // ==========================================================
  // LOAD USER + COMPLETE WAITER PROFILE
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadWaiterProfile = async () => {
      try {
        const storedUser =
          localStorage.getItem("kitchenFlowUser") ||
          localStorage.getItem("user");

        if (!storedUser) {
          navigate("/login");
          return;
        }

        let parsedUser;

        try {
          parsedUser = JSON.parse(storedUser);
        } catch (error) {
          console.error(
            "Invalid stored user:",
            error
          );

          localStorage.removeItem(
            "kitchenFlowUser"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login");
          return;
        }

        if (cancelled) {
          return;
        }

        // Show stored user immediately.
        setUser(parsedUser);

        // ------------------------------------------------------
        // Fetch complete waiter profile.
        //
        // Login only stores basic details.
        // /api/waiter/me returns imageUrl/profileImage too.
        // ------------------------------------------------------

        const response = await fetch(
          `${API_URL}/api/waiter/me`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load waiter profile (${response.status})`
          );
        }

        const data = await response.json();

        if (
          !data?.success ||
          !data?.waiter
        ) {
          throw new Error(
            data?.message ||
              "Unable to load waiter profile"
          );
        }

        const waiterProfile =
          data.waiter;

        if (cancelled) {
          return;
        }

        // Complete waiter object including profile image.
        setUser(waiterProfile);

        // Keep localStorage updated so other pages/components
        // also have the latest waiter profile.
        localStorage.setItem(
          "kitchenFlowUser",
          JSON.stringify(
            waiterProfile
          )
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            waiterProfile
          )
        );
      } catch (error) {
        console.error(
          "Unable to load waiter profile:",
          error
        );

        // Do NOT immediately redirect when the profile request
        // fails. The stored user is still usable.
      }
    };

    loadWaiterProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ==========================================================
  // MESSAGE
  // ==========================================================

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });

    window.setTimeout(() => {
      setMessage(null);
    }, 3500);
  };

  // ==========================================================
  // TABLE STATS
  // ==========================================================

  const tableStats = useMemo(
    () => getTableStats(tables),
    [tables]
  );

  // ==========================================================
  // LOAD CURRENT PAGE
  // ==========================================================

  const refreshCurrentPage = async () => {
    if (activePage === "tables") {
      await loadTables({
        force: true,
        loadedRef,
        setLoadingTables,
        setTables,
        showMessage,
      });

      return;
    }
  if (activePage === "my-orders") {
    await loadMyOrders({
      force: true,
      loadedRef,
      setLoadingMyOrders,
      setMyOrders,
      showMessage,
    });

    return;
  }
    if (activePage === "picked") {
      await loadPickedTables({
        force: true,
        loadedRef,
        setLoadingPickedTables,
        setPickedTables,
        showMessage,
      });

      return;
    }

    if (activePage === "bills") {
      await loadBills({
        filters: {
          date: billDate,
          billNumber,
        },
        setLoadingBills,
        setBills,
        showMessage,
      });
    }
  };

  // ==========================================================
  // LOAD PAGE DATA
  // ==========================================================

 useEffect(() => {
  if (!user) {
    return;
  }

  /* ==========================================================
     TABLES

     Mark as started BEFORE the API request.
     This prevents React StrictMode from starting
     the same initial request twice.
     ========================================================== */

  if (
    activePage === "tables" &&
    !loadedRef.current.tables
  ) {
    loadedRef.current.tables = true;

    loadTables({
      force: true,
      loadedRef,
      setLoadingTables,
      setTables,
      showMessage,
    });
  }


  /* ==========================================================
     PICKED TABLES
     ========================================================== */

  if (
    activePage === "picked" &&
    !loadedRef.current.picked
  ) {
    loadedRef.current.picked = true;

    loadPickedTables({
      force: true,
      loadedRef,
      setLoadingPickedTables,
      setPickedTables,
      showMessage,
    });
  }


  /* ==========================================================
     MY ORDERS
     ========================================================== */

  if (
    activePage === "my-orders" &&
    !loadedRef.current.myOrders
  ) {
    loadedRef.current.myOrders = true;

    loadMyOrders({
      force: true,
      loadedRef,
      setLoadingMyOrders,
      setMyOrders,
      showMessage,
    });
  }


  /* ==========================================================
     BILLS
     ========================================================== */

  if (
    activePage === "bills" &&
    !loadedRef.current.bills
  ) {
    loadedRef.current.bills = true;

    loadBills({
      filters: {
        date: billDate,
        billNumber,
      },
      setLoadingBills,
      setBills,
      showMessage,
    });
  }

}, [
  user,
  activePage,
]);

  // ==========================================================
  // PICK TABLE
  // ==========================================================

  const handlePick = (table) => {
    return pickTable({
      table,

      setActionLoading,

      setTables,

      setPickedTables,

      loadedRef,

      showMessage,
    });
  };

  // ==========================================================
  // DROP TABLE
  // ==========================================================

  const handleDrop = (table) => {
    setDropConfirmTable(table);
  };

  const confirmDrop = () => {
    return dropTable({
      table: dropConfirmTable,

      setActionLoading,

      setTables,

      setPickedTables,

      setTableOrders,

      setExpandedTable,

      setDropConfirmTable,

      loadedRef,

      showMessage,
    });
  };

  // ==========================================================
  // CHECKOUT
  // ==========================================================

  const handleCheckout = (table) => {
    setCheckoutConfirmTable(table);
  };

  const confirmCheckout = () => {
    return checkoutTable({
      table: checkoutConfirmTable,

      setActionLoading,

      setTables,

      setPickedTables,

      setBills,

      // Clear the current table's cached orders after
      // checkout so a future session does not display
      // the previous session's orders.
      setTableOrders,

      setExpandedTable,

      setCheckoutConfirmTable,

      loadedRef,

      showMessage,
    });
  };

  // ==========================================================
  // TOGGLE ORDER PANEL
  // ==========================================================

  const toggleOrderArea = async (tableId) => {
    if (expandedTable === tableId) {
      setExpandedTable(null);
      return;
    }

    setExpandedTable(tableId);

    try {
      // Load menu only when Take Order is opened.
      if (!loadedRef.current.menu) {
        await loadMenu({
          loadedRef,
          setMenuItems,
        });
      }

      // Load existing orders only once for this table.
      if (
        !Object.prototype.hasOwnProperty.call(
          tableOrders,
          tableId
        )
      ) {
        await loadTableOrders({
          tableId,
          setTableOrders,
          showMessage,
        });
      }
    } catch (error) {
      showMessage(
        "error",
        error?.message ||
          "Unable to open order workspace"
      );
    }
  };

  // ==========================================================
  // UPDATE ORDER DRAFT
  // ==========================================================

  const updateDraft = (
    tableId,
    menuItemId,
    changes
  ) => {
    setOrderDrafts((previous) => {
      const tableDraft =
        previous[tableId] || {};

      const currentItem =
        tableDraft[menuItemId] || {
          selected: false,
          quantity: 1,
          instruction: "",
        };

      return {
        ...previous,

        [tableId]: {
          ...tableDraft,

          [menuItemId]: {
            ...currentItem,
            ...changes,
          },
        },
      };
    });
  };

  // ==========================================================
  // PLACE ORDER
  // ==========================================================

  const handlePlaceOrder = (table) => {
    return placeOrder({
      table,

      menuItems,

      orderDrafts,

      setActionLoading,

      setOrderDrafts,

      loadTableOrders: (tableId) =>
        loadTableOrders({
          tableId,
          setTableOrders,
          showMessage,
        }),

      showMessage,
    });
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    return logoutWaiter({
      navigate,
    });
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="manager-page waiter-page">

      {/* ======================================================
          TOAST
          ====================================================== */}

      {message && (
        <div
          className={`waiter-toast ${
            message.type === "success"
              ? "toast-success"
              : "toast-error"
          }`}
        >
          <Icon
            name={
              message.type === "success"
                ? "check"
                : "close"
            }
            size={20}
          />

          <span>
            {message.text}
          </span>
        </div>
      )}

      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <WaiterSidebar
        open={menuOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onClose={() =>
          setMenuOpen(false)
        }
        onLogout={handleLogout}
      />

      {/* ======================================================
          MAIN
          ====================================================== */}

      <div className="manager-main waiter-main">

        {/* ====================================================
            SHARED HEADER
            ==================================================== */}

        <Header
          activePage={headerPage}

          onMenuToggle={() =>
            setMenuOpen(
              (value) => !value
            )
          }

          onRefresh={refreshCurrentPage}

          refreshing={
            activePage === "tables"
              ? loadingTables
              : activePage === "picked"
              ? loadingPickedTables
              : activePage === "my-orders"
              ? loadingMyOrders
              : loadingBills
          }

          user={user}

          role="Waiter"
        />

        {/* ====================================================
            TABLES
            ==================================================== */}

        {activePage === "tables" && (
          <WaiterTablesPage
            tables={tables}
            tableStats={tableStats}
            loading={loadingTables}
            actionLoading={actionLoading}
            onRefresh={refreshCurrentPage}
            onPick={handlePick}
          />
        )}

        {/* ====================================================
            PICKED TABLES
            ==================================================== */}

        {activePage === "picked" && (
          <WaiterPickedTablesPage
            pickedTables={pickedTables}
            loading={loadingPickedTables}
            user={user}
            actionLoading={actionLoading}
            expandedTable={expandedTable}
            menuItems={menuItems}
            tableOrders={tableOrders}
            orderDrafts={orderDrafts}
            onRefresh={refreshCurrentPage}
            onDrop={handleDrop}
            onCheckout={handleCheckout}
            onToggleOrder={toggleOrderArea}
            onUpdateDraft={updateDraft}
            onPlaceOrder={handlePlaceOrder}
          />
        )}
{/* ====================================================
    MY ORDERS
    ==================================================== */}

{activePage === "my-orders" && (
  <WaiterOrderList
    orders={myOrders}
    loading={loadingMyOrders}
    onRefresh={() =>
      loadMyOrders({
        force: true,
        loadedRef,
        setLoadingMyOrders,
        setMyOrders,
        showMessage,
      })
    }
  />
)}
        {/* ====================================================
            BILLS
            ==================================================== */}

        {activePage === "bills" && (
          <WaiterBillsPage
            bills={bills}
            loading={loadingBills}
            billDate={billDate}
            billNumber={billNumber}
            setBillDate={setBillDate}
            setBillNumber={setBillNumber}

            onSearch={() =>
              loadBills({
                filters: {
                  date: billDate,
                  billNumber,
                },

                setLoadingBills,

                setBills,

                showMessage,
              })
            }

            onReset={async () => {
              setBillDate("");
              setBillNumber("");

              await loadBills({
                filters: {},

                setLoadingBills,

                setBills,

                showMessage,
              });
            }}
          />
        )}
      </div>

      {/* ======================================================
          DROP TABLE MODAL
          ====================================================== */}

      <DropTableModal
        table={dropConfirmTable}
        actionLoading={actionLoading}
        onCancel={() =>
          setDropConfirmTable(null)
        }
        onConfirm={confirmDrop}
      />

      {/* ======================================================
          CHECKOUT MODAL
          ====================================================== */}

      <CheckoutModal
        table={checkoutConfirmTable}
        actionLoading={actionLoading}
        onCancel={() =>
          setCheckoutConfirmTable(null)
        }
        onConfirm={confirmCheckout}
      />

    </div>
  );
};

export default Waiter;