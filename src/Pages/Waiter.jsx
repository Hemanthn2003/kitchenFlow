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

import {
  DropTableModal,
  CheckoutModal,
  ReadyOrderModal,
  ServeOrderModal,
} from "../components/WaiterModals.jsx";

import {
  loadTables,
  loadMenu,
  loadPickedTables,
  loadTableOrders,
  loadBills,
  loadReadyOrders,
  pickTable,
  dropTable,
  placeOrder,
  serveOrder,
  checkoutTable,
  logoutWaiter,
  getTableStats,
} from "../components/waiterFunctions.js";

import "./Waiter.css";
import "./WaiterDropModal.css";

const API_URL = "http://localhost:5000/api";

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

  // ==========================================================
  // LOADING
  // ==========================================================

  const [loadingTables, setLoadingTables] = useState(false);

  const [loadingPickedTables, setLoadingPickedTables] =
    useState(false);

  const [loadingBills, setLoadingBills] = useState(false);

  const [actionLoading, setActionLoading] = useState("");

  // ==========================================================
  // ORDER
  // ==========================================================

  const [expandedTable, setExpandedTable] = useState(null);

  const [orderDrafts, setOrderDrafts] = useState({});

  // ==========================================================
  // READY ORDERS
  // ==========================================================

  const [readyOrders, setReadyOrders] = useState([]);

  const [readyNotification, setReadyNotification] =
    useState(null);

  const [serveOrderState, setServeOrderState] =
    useState(null);

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
    ready: false,
  });

  // ==========================================================
  // LOAD USER FROM LOCAL STORAGE
  // ==========================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("kitchenFlowUser") ||
        localStorage.getItem("user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error("Unable to load waiter:", error);

      localStorage.removeItem("kitchenFlowUser");
      localStorage.removeItem("user");

      navigate("/login");
    }
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

    if (activePage === "picked") {
      await loadPickedTables({
        force: true,
        loadedRef,
        setLoadingPickedTables,
        setPickedTables,
        showMessage,
      });

      await loadReadyOrders({
        force: true,
        loadedRef,
        setReadyOrders,
        setReadyNotification,
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

    if (activePage === "tables") {
      loadTables({
        loadedRef,
        setLoadingTables,
        setTables,
        showMessage,
      });
    }

    if (activePage === "picked") {
      loadPickedTables({
        loadedRef,
        setLoadingPickedTables,
        setPickedTables,
        showMessage,
      });

      loadReadyOrders({
        loadedRef,
        setReadyOrders,
        setReadyNotification,
      });
    }

    if (
      activePage === "bills" &&
      !loadedRef.current.bills
    ) {
      loadBills({
        setLoadingBills,
        setBills,
        showMessage,
      });

      loadedRef.current.bills = true;
    }
  }, [
    user,
    activePage,
  ]);

  // ==========================================================
  // READY ORDER SOUND
  // ==========================================================

  useEffect(() => {
    if (!readyNotification) {
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      const context =
        new AudioContextClass();

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.connect(gain);

      gain.connect(
        context.destination
      );

      oscillator.frequency.value = 850;

      gain.gain.setValueAtTime(
        0.0001,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.3,
        context.currentTime + 0.02
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 0.5
      );

      oscillator.start();

      oscillator.stop(
        context.currentTime + 0.5
      );
    } catch (error) {
      console.error(
        "Notification sound error:",
        error
      );
    }
  }, [readyNotification]);

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
  // SERVE ORDER
  // ==========================================================

  const handleServe = (order) => {
    return serveOrder({
      order,

      setActionLoading,

      setServeOrder:
        setServeOrderState,

      setReadyNotification,

      setReadyOrders,

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

      {/* ======================================================
          READY ORDER NOTIFICATION
          ====================================================== */}

      <ReadyOrderModal
        order={readyNotification}
        onServe={(order) => {
          setServeOrderState(order);

          setReadyNotification(null);
        }}
      />

      {/* ======================================================
          SERVE ORDER
          ====================================================== */}

      <ServeOrderModal
        order={serveOrderState}
        actionLoading={actionLoading}
        onServe={handleServe}
        onClose={() =>
          setServeOrderState(null)
        }
      />

    </div>
  );
};

export default Waiter;