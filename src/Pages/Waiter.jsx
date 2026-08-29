import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useDispatch,
} from "react-redux";

import {
  Menu,
  X,
  Table2,
  CheckCircle2,
  Clock3,
  ChefHat,
  Bell,
  Utensils,
  ReceiptText,
  LogOut,
  Search,
  CalendarDays,
  Plus,
  Minus,
  ShoppingCart,
  ClipboardList,
  CircleDollarSign,
  UserRound,
  AlertCircle,
  RefreshCw,
  Send,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import "./Waiter.css";
import "./WaiterDropModal.css";


const API_URL =
  "http://localhost:5000/api";

function Waiter() {

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();


  /* =======================================================
     USER
     ======================================================= */

  const [user, setUser] =
    useState(null);


  /* =======================================================
     DROP TABLE CONFIRMATION MODAL
     ======================================================= */

  const [dropConfirmTable, setDropConfirmTable] =
    useState(null);

/* =======================================================
   CHECKOUT CONFIRMATION MODAL
   ======================================================= */

const [checkoutConfirmTable, setCheckoutConfirmTable] =
  useState(null);
  /* =======================================================
     SIDEBAR
     ======================================================= */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  /* =======================================================
     ACTIVE PAGE
     ======================================================= */

  const [activePage, setActivePage] =
    useState("TABLES");


  /* =======================================================
     DATA
     ======================================================= */

  const [tables, setTables] =
    useState([]);

  const [menuItems, setMenuItems] =
    useState([]);

  const [pickedTables, setPickedTables] =
    useState([]);

  const [tableOrders, setTableOrders] =
    useState({});

  const [bills, setBills] =
    useState([]);


  /* =======================================================
     LOADING
     ======================================================= */

  const [loadingTables, setLoadingTables] =
    useState(false);

  const [loadingPickedTables, setLoadingPickedTables] =
    useState(false);

  const [loadingBills, setLoadingBills] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState("");


  /* =======================================================
     ORDER EXPANSION
     ======================================================= */

  const [expandedTable, setExpandedTable] =
    useState(null);


  /* =======================================================
     ORDER CART

     {
       tableId: {
         menuItemId: {
           selected: true,
           quantity: 1,
           instruction: ""
         }
       }
     }
     ======================================================= */

  const [orderDrafts, setOrderDrafts] =
    useState({});


  /* =======================================================
     READY ORDER NOTIFICATION
     ======================================================= */

  const [readyOrders, setReadyOrders] =
    useState([]);

  const [readyNotification, setReadyNotification] =
    useState(null);


  /* =======================================================
     SERVE POPUP
     ======================================================= */

  const [serveOrder, setServeOrder] =
    useState(null);


  /* =======================================================
     BILL FILTERS
     ======================================================= */

  const [billDate, setBillDate] =
    useState("");

  const [billNumber, setBillNumber] =
    useState("");


  /* =======================================================
     MESSAGE
     ======================================================= */

  const [message, setMessage] =
    useState(null);


  /* =======================================================
     AUDIO REF
     ======================================================= */

  const audioContextRef =
    useRef(null);


  /* =======================================================
     API LOAD CACHE

     Prevent duplicate requests from StrictMode and re-renders.
     Each resource is fetched only when its screen/action needs it.
     ======================================================= */

  const loadedRef =
    useRef({
      tables: false,
      menu: false,
      picked: false,
      bills: false,
      ready: false,
    });


  /* =======================================================
     GET STORED USER
     ======================================================= */

  useEffect(
    () => {

      try {

        const storedUser =
          localStorage.getItem(
            "kitchenFlowUser"
          );


        if (!storedUser) {

          navigate(
            "/login"
          );

          return;

        }


        const parsedUser =
          JSON.parse(
            storedUser
          );


        setUser(
          parsedUser
        );

      } catch (error) {

        console.error(
          "Unable to load waiter:",
          error
        );

        navigate(
          "/login"
        );

      }

    },

    [
      navigate,
    ]
  );


  /* =======================================================
     API HELPER
     ======================================================= */

  const apiRequest =
    async (
      endpoint,
      options = {}
    ) => {

      const response =
        await fetch(
          `${API_URL}${endpoint}`,
          {

            credentials:
              "include",

            headers: {

              "Content-Type":
                "application/json",

              ...(options.headers || {}),

            },

            ...options,

          }
        );


      let data =
        null;


      try {

        data =
          await response.json();

      } catch {

        data =
          null;

      }


      if (!response.ok) {

        throw new Error(

          data?.message ||
          "Something went wrong"

        );

      }


      return data;

    };


  /* =======================================================
     MESSAGE HELPER
     ======================================================= */

  const showMessage =
    (
      type,
      text
    ) => {

      setMessage({
        type,
        text,
      });


      setTimeout(
        () => {

          setMessage(
            null
          );

        },
        3500
      );

    };


  /* =======================================================
     LOAD TABLES
     ======================================================= */

  const loadTables =
    async (
      force = false
    ) => {

      if (
        !force &&
        loadedRef.current.tables
      ) {
        return;
      }

      /* Mark before the request so StrictMode cannot start it twice. */
      loadedRef.current.tables =
        true;

      try {

        setLoadingTables(
          true
        );


        const data =
          await apiRequest(
            "/waiter/tables"
          );


        setTables(
          data.tables || []
        );

      } catch (error) {

        loadedRef.current.tables =
          false;

        console.error(
          error
        );

        showMessage(
          "error",
          error.message
        );

      } finally {

        setLoadingTables(
          false
        );

      }

    };


  /* =======================================================
     LOAD MENU
     ======================================================= */

  const loadMenu =
    async (
      force = false
    ) => {

      if (
        !force &&
        loadedRef.current.menu
      ) {
        return;
      }

      loadedRef.current.menu =
        true;

      try {

        const data =
          await apiRequest(
            "/waiter/menu"
          );


        setMenuItems(
          data.menuItems || []
        );

      } catch (error) {

        loadedRef.current.menu =
          false;

        console.error(
          "Menu load error:",
          error
        );

        throw error;

      }

    };


  /* =======================================================
     LOAD PICKED TABLES
     ======================================================= */

  const loadPickedTables =
    async (
      force = false
    ) => {

      if (
        !force &&
        loadedRef.current.picked
      ) {
        return;
      }

      loadedRef.current.picked =
        true;

      try {

        setLoadingPickedTables(
          true
        );


        const data =
          await apiRequest(
            "/waiter/my-tables"
          );


        setPickedTables(
          data.tables || []
        );

      } catch (error) {

        loadedRef.current.picked =
          false;

        console.error(
          error
        );

        showMessage(
          "error",
          error.message
        );

      } finally {

        setLoadingPickedTables(
          false
        );

      }

    };


  /* =======================================================
     LOAD TABLE ORDERS
     ======================================================= */

  const loadTableOrders =
    async (
      tableId
    ) => {

      try {

        const data =
          await apiRequest(
            `/waiter/tables/${tableId}/orders`
          );


        setTableOrders(
          (previous) => ({

            ...previous,

            [tableId]:
              data.orders || [],

          })
        );

      } catch (error) {

        showMessage(
          "error",
          error.message
        );

      }

    };


  /* =======================================================
     LOAD BILLS
     ======================================================= */

  const loadBills =
    async (
      filters = {}
    ) => {

      try {

        setLoadingBills(
          true
        );


        const params =
          new URLSearchParams();


        if (
          filters.date
        ) {

          params.append(
            "date",
            filters.date
          );

        }


        if (
          filters.billNumber
        ) {

          params.append(
            "billNumber",
            filters.billNumber
          );

        }


        const query =
          params.toString()
            ? `?${params.toString()}`
            : "";


        const data =
          await apiRequest(
            `/waiter/bills${query}`
          );


        setBills(
          data.bills || []
        );

      } catch (error) {

        showMessage(
          "error",
          error.message
        );

      } finally {

        setLoadingBills(
          false
        );

      }

    };


  /* =======================================================
     ON-DEMAND PAGE LOAD

     TABLES  -> only tables
     PICKED  -> only picked tables
     BILLS   -> only bills

     Menu and ready orders are not fetched on login.
     ======================================================= */

  useEffect(
    () => {

      if (!user) {
        return;
      }


      if (
        activePage ===
        "TABLES"
      ) {

        loadTables();

        return;

      }


      if (
        activePage ===
        "PICKED"
      ) {

        loadPickedTables();

        return;

      }


      if (
        activePage ===
        "BILLS"
      ) {

        if (
          !loadedRef.current.bills
        ) {

          loadedRef.current.bills =
            true;

          loadBills();

        }

      }

    },

    [
      user,
      activePage,
    ]
  );


  /* =======================================================
     READY ORDERS

     No polling on login. Ready orders are fetched only when
     the waiter opens the Picked Tables workspace.
     ======================================================= */

  const loadReadyOrders =
    async (
      force = false
    ) => {

      if (
        !force &&
        loadedRef.current.ready
      ) {
        return;
      }

      loadedRef.current.ready =
        true;

      try {

        const data =
          await apiRequest(
            "/waiter/ready-orders"
          );


        const orders =
          data.orders || [];


        setReadyOrders(
          orders
        );


        if (
          orders.length > 0
        ) {

          setReadyNotification(
            orders[0]
          );

        }

      } catch (error) {

        loadedRef.current.ready =
          false;

        console.error(
          "Ready order check error:",
          error
        );

      }

    };


  useEffect(
    () => {

      if (
        user &&
        activePage ===
        "PICKED"
      ) {

        loadReadyOrders();

      }

    },

    [
      user,
      activePage,
    ]
  );


  /* =======================================================
     PLAY NOTIFICATION SOUND
     ======================================================= */

  useEffect(
    () => {

      if (
        !readyNotification
      ) {
        return;
      }


      try {

        const AudioContextClass =
          window.AudioContext ||
          window.webkitAudioContext;


        if (
          !AudioContextClass
        ) {
          return;
        }


        const context =
          new AudioContextClass();


        audioContextRef.current =
          context;


        const oscillator =
          context.createOscillator();


        const gain =
          context.createGain();


        oscillator.connect(
          gain
        );

        gain.connect(
          context.destination
        );


        oscillator.frequency.value =
          850;


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

    },

    [
      readyNotification,
    ]
  );


  /* =======================================================
     PICK TABLE

     One API call only. Update local state from the API response.
     ======================================================= */

  const handlePickTable =
    async (
      table
    ) => {

      try {

        setActionLoading(
          `pick-${table._id}`
        );


        const data =
          await apiRequest(

            `/waiter/tables/${table._id}/pick`,

            {
              method:
                "PATCH",
            }

          );


        const updatedTable =
          data.table;


        if (updatedTable) {

          setTables(
            (current) =>
              current.map(
                (item) =>
                  String(item._id) ===
                  String(updatedTable._id)
                    ? updatedTable
                    : item
              )
          );


          setPickedTables(
            (current) => {

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

            }
          );

        }


        loadedRef.current.picked =
          true;


        showMessage(
          "success",
          `Table ${table.tableNumber} picked successfully`
        );

      } catch (error) {

        showMessage(
          "error",
          error.message
        );

      } finally {

        setActionLoading(
          ""
        );

      }

    };


  /* =======================================================
     DROP TABLE
     ======================================================= */

  const handleDropTable =
    (
      table
    ) => {

      /*
         Open the in-page confirmation modal.
         The actual API request happens only after
         the waiter clicks "Confirm Drop".
      */

      setDropConfirmTable(
        table
      );

    };


  const confirmDropTable =
    async () => {

      if (!dropConfirmTable) {
        return;
      }


      const table =
        dropConfirmTable;


      try {

        setActionLoading(
          `drop-${table._id}`
        );


        const data =
          await apiRequest(

            `/waiter/tables/${table._id}/drop`,

            {
              method:
                "PATCH",
            }

        );


        const updatedTable =
          data.table;


        if (updatedTable) {

          setTables(
            (current) =>
              current.map(
                (item) =>
                  String(item._id) ===
                  String(updatedTable._id)
                    ? updatedTable
                    : item
              )
          );

        }


        setPickedTables(
          (current) =>
            current.filter(
              (item) =>
                String(item._id) !==
                String(table._id)
            )
        );


        setTableOrders(
          (current) => {

            const next = {
              ...current,
            };

            delete next[table._id];

            return next;

          }
        );


        loadedRef.current.picked =
          true;


        showMessage(
          "success",
          `Table ${table.tableNumber} is now available`
        );


        setExpandedTable(
          null
        );


        setDropConfirmTable(
          null
        );

      } catch (error) {

        showMessage(
          "error",
          error.message
        );

      } finally {

        setActionLoading(
          ""
        );

      }

    };


  /* =======================================================
     TOGGLE TABLE ORDER AREA

     Menu is loaded only on the first Take Order action.
     Existing orders are loaded only for the selected table.
     ======================================================= */

  const toggleOrderArea =
    async (
      tableId
    ) => {

      if (
        expandedTable ===
        tableId
      ) {

        setExpandedTable(
          null
        );

        return;

      }


      setExpandedTable(
        tableId
      );


      try {

        if (
          !loadedRef.current.menu
        ) {

          await loadMenu();

        }


        if (
          !Object.prototype.hasOwnProperty.call(
            tableOrders,
            tableId
          )
        ) {

          await loadTableOrders(
            tableId
          );

        }

      } catch (error) {

        showMessage(
          "error",
          error.message ||
          "Unable to open order workspace"
        );

      }

    };


  /* =======================================================
     UPDATE ORDER ITEM
     ======================================================= */

  const updateDraft =
    (
      tableId,
      menuItemId,
      changes
    ) => {

      setOrderDrafts(
        (previous) => {

          const tableDraft =
            previous[tableId] || {};

          const currentItem =
            tableDraft[menuItemId] || {

              selected:
                false,

              quantity:
                1,

              instruction:
                "",

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

        }
      );

    };


  /* =======================================================
     GET DRAFT ITEM
     ======================================================= */

  const getDraftItem =
    (
      tableId,
      menuItemId
    ) => {

      return (
        orderDrafts?.[tableId]?.[menuItemId] ||
        {
          selected:
            false,
          quantity:
            1,
          instruction:
            "",
        }
      );

    };


  /* =======================================================
     PLACE ORDER
     ======================================================= */

  const handlePlaceOrder =
    async (
      table
    ) => {

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
          .map(
            (item) => ({

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

            })
          );


      if (
        selectedItems.length ===
        0
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

            method:
              "POST",

            body:
              JSON.stringify({

                items:
                  selectedItems,

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

            [table._id]:
              {},

          })
        );


        await loadTableOrders(
          table._id
        );

      } catch (error) {

        showMessage(
          "error",
          error.message
        );

      } finally {

        setActionLoading(
          ""
        );

      }

    };


  /* =======================================================
     SERVE ORDER
     ======================================================= */

  const handleServeOrder =
    async (
      order
    ) => {

      try {

        setActionLoading(
          `serve-${order._id}`
        );


        await apiRequest(

          `/waiter/orders/${order._id}/serve`,

          {
            method:
              "PATCH",
          }

        );


        showMessage(
          "success",
          "Order marked as served"
        );


        setServeOrder(
          null
        );

        setReadyNotification(
          null
        );


        await loadTableOrders(
          order.tableId
        );


        setReadyOrders(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !==
                order._id
            )
        );

      } catch (error) {

        showMessage(
          "error",
          error.message
        );

      } finally {

        setActionLoading(
          ""
        );

      }

    };


/* =======================================================
   CHECKOUT TABLE
   ======================================================= */

/*
   This function ONLY opens the modal.
   No API request is made here.
*/

const handleCheckout =
  (
    table
  ) => {

    setCheckoutConfirmTable(
      table
    );

  };


/*
   The checkout API is called ONLY after
   the waiter clicks Confirm Checkout
   inside the modal.
*/

const confirmCheckout =
  async () => {

    if (
      !checkoutConfirmTable
    ) {
      return;
    }


    const table =
      checkoutConfirmTable;


    try {

      setActionLoading(
        `checkout-${table._id}`
      );


      const data =
        await apiRequest(

          `/waiter/tables/${table._id}/checkout`,

          {
            method:
              "POST",
          }

        );


      /*
         Update local UI immediately.

         This avoids unnecessary extra
         GET API requests.
      */

      setTables(
        (current) =>
          current.map(
            (item) =>
              String(
                item._id
              ) ===
              String(
                table._id
              )
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
          current.map(
            (item) =>
              String(
                item._id
              ) ===
              String(
                table._id
              )
                ? {
                    ...item,

                    status:
                      "BILL_REQUESTED",
                  }
                : item
          )
      );


      /*
         Add the newly created bill
         to local state without
         fetching bills again.
      */

      if (
        data?.bill
      ) {

        setBills(
          (current) => [

            data.bill,

            ...current.filter(
              (bill) =>
                String(
                  bill._id
                ) !==
                String(
                  data.bill._id
                )
            ),

          ]
        );


        loadedRef.current.bills =
          true;

      }


      setExpandedTable(
        null
      );


      setCheckoutConfirmTable(
        null
      );


      showMessage(
        "success",
        `Checkout request sent for Table ${table.tableNumber}`
      );


    } catch (error) {

      showMessage(
        "error",
        error.message
      );


    } finally {

      setActionLoading(
        ""
      );

    }

  };
  /* =======================================================
     BILL SEARCH
     ======================================================= */

  const handleBillSearch =
    async () => {

      await loadBills({

        date:
          billDate,

        billNumber:
          billNumber,

      });

    };


  /* =======================================================
     RESET BILL FILTER
     ======================================================= */

  const resetBillFilters =
    async () => {

      setBillDate(
        ""
      );

      setBillNumber(
        ""
      );


      await loadBills();

    };


  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout =
    async () => {

      try {

        await fetch(

          `${API_URL}/auth/logout`,

          {

            method:
              "POST",

            credentials:
              "include",

          }

        );

      } catch (error) {

        console.error(
          "Logout request error:",
          error
        );

      }


      localStorage.removeItem(
        "kitchenFlowUser"
      );


      navigate(
        "/login"
      );

    };


  /* =======================================================
     TABLE COUNTS
     ======================================================= */

  const tableStats =
    useMemo(
      () => ({

        total:
          tables.length,

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

      }),

      [
        tables,
      ]
    );


  /* =======================================================
     FORMAT DATE
     ======================================================= */

  const formatDate =
    (
      dateValue
    ) => {

      if (!dateValue) {
        return "-";
      }


      return new Date(
        dateValue
      ).toLocaleString();

    };


  /* =======================================================
     TABLE CARD
     ======================================================= */

  const renderTableCard =
    (
      table,
      isPicked = false
    ) => {

      const isAvailable =
        table.status ===
        "AVAILABLE";


      const assignedToMe =
        user?._id ===
        table?.waiterId?._id;


      const isBillRequested =
        table.status ===
        "BILL_REQUESTED";


      return (

        <div
          key={
            table._id
          }
          className={

            `waiter-table-card ${
              isPicked
                ? "picked-table-card"
                : ""
            } ${
              isBillRequested
                ? "bill-requested-card"
                : ""
            } ${
    expandedTable === table._id
      ? "table-expanded-card"
      : ""
  }`

          }
        >

          <div
            className="waiter-table-card-top"
          >

            <div
              className="waiter-table-icon"
            >

              <Table2
                size={30}
              />

            </div>


            <div
              className="waiter-table-number"
            >

              Table

              <strong>

                {table.tableNumber}

              </strong>

            </div>

          </div>


          <div
            className="waiter-table-status"
          >

            <span>

              Status

            </span>


            <strong
              className={

                isAvailable
                  ? "status-available"
                  : isBillRequested
                  ? "status-billing"
                  : "status-unavailable"

              }
            >

              {isAvailable
                ? "AVAILABLE"
                : isBillRequested
                ? "CHECKOUT REQUESTED"
                : "UNAVAILABLE"}

            </strong>

          </div>


          {!isAvailable &&
          !assignedToMe &&
          table.waiterId?.name ? (

            <div
              className="assigned-waiter"
            >

              Picked by

              <strong>

                {table.waiterId.name}

              </strong>

            </div>

          ) : null}


          {isAvailable ? (

            <button

              className="waiter-primary-button"

              disabled={
                actionLoading ===
                `pick-${table._id}`
              }

              onClick={
                () =>
                  handlePickTable(
                    table
                  )
              }

            >

              <Plus
                size={17}
              />

              {actionLoading ===
              `pick-${table._id}`

                ? "Picking..."

                : "Pick Table"}

            </button>

          ) : null}


          {isPicked &&
          !isBillRequested ? (

            <div
              className="picked-table-actions"
            >

              <button

                className="waiter-primary-button"

                onClick={
                  () =>
                    toggleOrderArea(
                      table._id
                    )
                }

              >

                <Utensils
                  size={17}
                />

                Take Order

                {expandedTable ===
                table._id

                  ? (
                    <ChevronUp
                      size={17}
                    />
                  )

                  : (
                    <ChevronDown
                      size={17}
                    />
                  )}

              </button>


              <button

                className="waiter-outline-button"

                disabled={
                  actionLoading ===
                  `drop-${table._id}`
                }

                onClick={
                  () =>
                    handleDropTable(
                      table
                    )
                }

              >

                Drop Table

              </button>


              <button

                className="waiter-gold-button"

                disabled={
                  actionLoading ===
                  `checkout-${table._id}`
                }

                onClick={
                  () =>
                    handleCheckout(
                      table
                    )
                }

              >

                <ReceiptText
                  size={17}
                />

                Checkout

              </button>

            </div>

          ) : null}


          {isPicked &&
          isBillRequested ? (

            <div
              className="waiter-billing-state"
            >

              <Clock3
                size={18}
              />

              Waiting for manager
              to generate the bill.

            </div>

          ) : null}


          {isPicked &&
          expandedTable ===
          table._id ? (

            <div
              className="waiter-order-expanded"
            >

              {/* =========================================
                  EXISTING ORDERS
                 ========================================= */}

              <div
                className="waiter-existing-orders"
              >

                <h4>

                  Current Orders

                </h4>


                {tableOrders[
                  table._id
                ]?.length ? (

                  tableOrders[
                    table._id
                  ].map(
                    (order) => (

                      <div
                        key={
                          order._id
                        }
                        className="waiter-order-history-card"
                      >

                        <div
                          className="waiter-order-history-top"
                        >

                          <span>

                            Order

                          </span>


                          <strong>

                            {order.status}

                          </strong>

                        </div>


                        {order.items?.map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={
                                `${order._id}-${index}`
                              }
                              className="waiter-history-item"
                            >

                              <span>

                                {item.name}

                              </span>

                              <strong>

                                × {item.quantity}

                              </strong>

                            </div>

                          )
                        )}

                      </div>

                    )
                  )

                ) : (

                  <p
                    className="waiter-empty-order"
                  >

                    No orders placed yet.

                  </p>

                )}

              </div>


              {/* =========================================
                  NEW ORDER HEADER
                 ========================================= */}

              <div
                className="waiter-new-order-header"
              >

                <div>

                  <h3>

                    New Order

                  </h3>

                  <p>

                    Select dishes for
                    Table {table.tableNumber}

                  </p>

                </div>


                <button

                  className="waiter-place-order-button"

                  disabled={
                    actionLoading ===
                    `order-${table._id}`
                  }

                  onClick={
                    () =>
                      handlePlaceOrder(
                        table
                      )
                  }

                >

                  <Send
                    size={17}
                  />

                  {actionLoading ===
                  `order-${table._id}`

                    ? "Placing..."

                    : "Place Order"}

                </button>

              </div>


              {/* =========================================
                  MENU GRID
                 ========================================= */}

              <div
                className="waiter-menu-grid"
              >

                {menuItems.map(
                  (
                    item
                  ) => {

                    const draft =
                      getDraftItem(

                        table._id,

                        item._id

                      );


                    return (

                      <div

                        key={
                          item._id
                        }

                        className={

                          `waiter-menu-card ${
                            draft.selected
                              ? "selected-menu-card"
                              : ""
                          }`

                        }

                      >

                        <div
                          className="waiter-menu-image-wrap"
                        >

                          {item.imageUrl ? (

                            <img

                              src={
                                item.imageUrl
                              }

                              alt={
                                item.name
                              }

                            />

                          ) : (

                            <div
                              className="waiter-menu-placeholder"
                            >

                              <ChefHat
                                size={30}
                              />

                            </div>

                          )}


                          <label
                            className="waiter-checkbox"
                          >

                            <input

                              type="checkbox"

                              checked={
                                draft.selected
                              }

                              onChange={
                                (
                                  event
                                ) =>

                                  updateDraft(

                                    table._id,

                                    item._id,

                                    {

                                      selected:
                                        event
                                          .target
                                          .checked,

                                    }

                                  )

                              }

                            />

                            <span />

                          </label>

                        </div>


                        <div
                          className="waiter-menu-info"
                        >

                          <h4>

                            {item.name}

                          </h4>


                          <strong>

                            ₹
                            {
                              Number(
                                item.price
                              ).toFixed(
                                2
                              )
                            }

                          </strong>

                        </div>


                        {draft.selected ? (

                          <div
                            className="waiter-menu-controls"
                          >

                            <div
                              className="waiter-quantity-control"
                            >

                              <button

                                onClick={
                                  () =>

                                    updateDraft(

                                      table._id,

                                      item._id,

                                      {

                                        quantity:
                                          Math.max(

                                            1,

                                            Number(
                                              draft.quantity
                                            ) - 1

                                          ),

                                      }

                                    )

                                }

                              >

                                <Minus
                                  size={15}
                                />

                              </button>


                              <span>

                                {draft.quantity}

                              </span>


                              <button

                                onClick={
                                  () =>

                                    updateDraft(

                                      table._id,

                                      item._id,

                                      {

                                        quantity:
                                          Number(
                                            draft.quantity
                                          ) + 1,

                                      }

                                    )

                                }

                              >

                                <Plus
                                  size={15}
                                />

                              </button>

                            </div>


                            <textarea

                              placeholder="Special notes..."

                              value={
                                draft.instruction
                              }

                              onChange={
                                (
                                  event
                                ) =>

                                  updateDraft(

                                    table._id,

                                    item._id,

                                    {

                                      instruction:
                                        event
                                          .target
                                          .value,

                                    }

                                  )

                              }

                            />

                          </div>

                        ) : null}

                      </div>

                    );

                  }
                )}

              </div>

            </div>

          ) : null}

        </div>

      );

    };


  /* =======================================================
     JSX
     ======================================================= */

  return (

    <div
      className="waiter-page"
    >

      {/* ===================================================
         MESSAGE
         =================================================== */}

      {message ? (

        <div
          className={

            `waiter-toast ${
              message.type ===
              "success"

                ? "toast-success"

                : "toast-error"
            }`

          }
        >

          {message.type ===
          "success"

            ? (
              <CheckCircle2
                size={20}
              />
            )

            : (
              <AlertCircle
                size={20}
              />
            )}

          <span>

            {message.text}

          </span>

        </div>

      ) : null}


      {/* ===================================================
         HEADER
         =================================================== */}

      <header
        className="waiter-header"
      >

        <button

          className="waiter-menu-toggle"

          onClick={
            () =>
              setSidebarOpen(
                true
              )
          }

        >

          <Menu
            size={26}
          />

        </button>


        <div
          className="waiter-brand"
        >

          Kitchen
          <span>

            Flow

          </span>

        </div>


        <div
          className="waiter-user-info"
        >

          <div
            className="waiter-user-text"
          >

            <strong>

              {user?.name ||
                "Waiter"}

            </strong>

            <span>

              WAITER

            </span>

          </div>


          <div
            className="waiter-avatar"
          >

            {user?.imageUrl ? (

              <img

                src={
                  user.imageUrl
                }

                alt={
                  user.name
                }

              />

            ) : (

              <UserRound
                size={25}
              />

            )}

          </div>

        </div>

      </header>


      {/* ===================================================
         SIDEBAR OVERLAY
         =================================================== */}

      {sidebarOpen ? (

        <div

          className="waiter-sidebar-overlay"

          onClick={
            () =>
              setSidebarOpen(
                false
              )
          }

        />

      ) : null}


      {/* ===================================================
         SIDEBAR
         =================================================== */}

      <aside
        className={

          `waiter-sidebar ${
            sidebarOpen
              ? "sidebar-open"
              : ""
          }`

        }
      >

        <div
          className="waiter-sidebar-top"
        >

          <div
            className="waiter-sidebar-brand"
          >

            Kitchen
            <span>

              Flow

            </span>

          </div>


          <button

            onClick={
              () =>
                setSidebarOpen(
                  false
                )
            }

          >

            <X
              size={23}
            />

          </button>

        </div>


        <nav
          className="waiter-sidebar-nav"
        >

          <button

            className={
              activePage ===
              "TABLES"

                ? "active-nav"

                : ""
            }

            onClick={
              () => {

                setActivePage(
                  "TABLES"
                );

                setSidebarOpen(
                  false
                );

              }
            }

          >

            <Table2
              size={20}
            />

            Tables

          </button>


          <button

            className={
              activePage ===
              "PICKED"

                ? "active-nav"

                : ""
            }

            onClick={
              () => {

                setActivePage(
                  "PICKED"
                );

                setSidebarOpen(
                  false
                );

              }
            }

          >

            <ClipboardList
              size={20}
            />

            Picked Tables

          </button>


          <button

            className={
              activePage ===
              "BILLS"

                ? "active-nav"

                : ""
            }

            onClick={
              () => {

                setActivePage(
                  "BILLS"
                );

                setSidebarOpen(
                  false
                );

              }
            }

          >

            <ReceiptText
              size={20}
            />

            Bills

          </button>

        </nav>


        <div
          className="waiter-sidebar-bottom"
        >

          <button

            className="waiter-logout-button"

            onClick={
              handleLogout
            }

          >

            <LogOut
              size={19}
            />

            Logout

          </button>


          <div
            className="waiter-sidebar-user"
          >

            <div
              className="waiter-small-avatar"
            >

              {user?.imageUrl ? (

                <img

                  src={
                    user.imageUrl
                  }

                  alt={
                    user.name
                  }

                />

              ) : (

                <UserRound
                  size={19}
                />

              )}

            </div>


            <div>

              <strong>

                {user?.name ||
                  "Waiter"}

              </strong>

              <span>

                WAITER

              </span>

            </div>

          </div>

        </div>

      </aside>


      {/* ===================================================
         MAIN
         =================================================== */}

      <main
        className="waiter-main"
      >


        {/* ===============================================
           TABLES PAGE
           =============================================== */}

        {activePage ===
        "TABLES" ? (

          <section
            className="waiter-section"
          >

            <div
              className="waiter-page-heading"
            >

              <div>

                <span>

                  TABLE MANAGEMENT

                </span>

                <h1>

                  Restaurant
                  <strong>

                    Tables

                  </strong>

                </h1>

                <p>

                  Pick an available table
                  and start serving customers.

                </p>

              </div>


              <button

                className="waiter-refresh-button"

                onClick={
                  () =>
                    loadTables(
                      true
                    )
                }

              >

                <RefreshCw
                  size={18}
                />

                Refresh

              </button>

            </div>


            <div
              className="waiter-stat-row"
            >

              <div>

                <Table2
                  size={21}
                />

                <span>

                  Total

                </span>

                <strong>

                  {tableStats.total}

                </strong>

              </div>


              <div>

                <CheckCircle2
                  size={21}
                />

                <span>

                  Available

                </span>

                <strong>

                  {tableStats.available}

                </strong>

              </div>


              <div>

                <Clock3
                  size={21}
                />

                <span>

                  Unavailable

                </span>

                <strong>

                  {tableStats.occupied}

                </strong>

              </div>

            </div>


            {loadingTables ? (

              <div
                className="waiter-loading"
              >

                Loading tables...

              </div>

            ) : (

              <div
                className="waiter-table-grid"
              >

                {tables.map(
                  (
                    table
                  ) =>

                    renderTableCard(
                      table
                    )

                )}

              </div>

            )}

          </section>

        ) : null}


        {/* ===============================================
           PICKED TABLES PAGE
           =============================================== */}

        {activePage ===
        "PICKED" ? (

          <section
            className="waiter-section"
          >

            <div
              className="waiter-page-heading"
            >

              <div>

                <span>

                  MY WORKSPACE

                </span>

                <h1>

                  Picked
                  <strong>

                    Tables

                  </strong>

                </h1>

                <p>

                  Take multiple orders,
                  serve customers and
                  checkout tables.

                </p>

              </div>


              <button

                className="waiter-refresh-button"

                onClick={
                  async () => {

                    await loadPickedTables(
                      true
                    );

                    await loadReadyOrders(
                      true
                    );

                  }
                }

              >

                <RefreshCw
                  size={18}
                />

                Refresh

              </button>

            </div>


            {loadingPickedTables ? (

              <div
                className="waiter-loading"
              >

                Loading your tables...

              </div>

            ) : pickedTables.length ===
            0 ? (

              <div
                className="waiter-empty-state"
              >

                <Table2
                  size={44}
                />

                <h3>

                  No Tables Picked

                </h3>

                <p>

                  Go to Tables and
                  pick an available
                  table.

                </p>

              </div>

            ) : (

              <div
                className="waiter-table-grid"
              >

                {pickedTables.map(
                  (
                    table
                  ) =>

                    renderTableCard(
                      table,
                      true
                    )

                )}

              </div>

            )}

          </section>

        ) : null}


        {/* ===============================================
           BILLS PAGE
           =============================================== */}

        {activePage ===
        "BILLS" ? (

          <section
            className="waiter-section"
          >

            <div
              className="waiter-page-heading"
            >

              <div>

                <span>

                  BILL HISTORY

                </span>

                <h1>

                  My
                  <strong>

                    Bills

                  </strong>

                </h1>

                <p>

                  Your served customer
                  bills from the last
                  30 days.

                </p>

              </div>

            </div>


            <div
              className="waiter-bill-filter"
            >

              <div
                className="waiter-filter-field"
              >

                <label>

                  <CalendarDays
                    size={16}
                  />

                  Date

                </label>

                <input

                  type="date"

                  value={
                    billDate
                  }

                  onChange={
                    (event) =>
                      setBillDate(
                        event.target.value
                      )
                  }

                />

              </div>


              <div
                className="waiter-filter-field bill-number-field"
              >

                <label>

                  <ReceiptText
                    size={16}
                  />

                  Bill Number

                </label>

                <input

                  type="text"

                  placeholder="Enter bill number"

                  value={
                    billNumber
                  }

                  onChange={
                    (event) =>
                      setBillNumber(
                        event.target.value
                      )
                  }

                />

              </div>


              <button

                className="waiter-primary-button"

                onClick={
                  handleBillSearch
                }

              >

                <Search
                  size={18}
                />

                Find Bills

              </button>


              <button

                className="waiter-outline-button"

                onClick={
                  resetBillFilters
                }

              >

                Reset

              </button>

            </div>


            {loadingBills ? (

              <div
                className="waiter-loading"
              >

                Loading bills...

              </div>

            ) : bills.length ===
            0 ? (

              <div
                className="waiter-empty-state"
              >

                <ReceiptText
                  size={44}
                />

                <h3>

                  No Bills Found

                </h3>

                <p>

                  Try changing the
                  date or bill number.

                </p>

              </div>

            ) : (

              <div
                className="waiter-bill-grid"
              >

                {bills.map(
                  (
                    bill
                  ) => (

                    <div

                      key={
                        bill._id
                      }

                      className="waiter-bill-card"

                    >

                      <div
                        className="waiter-bill-card-top"
                      >

                        <div>

                          <span>

                            Bill No.

                          </span>

                          <h3>

                            {bill.billNumber}

                          </h3>

                        </div>


                        <div
                          className={

                            `waiter-bill-status bill-${String(
                              bill.status
                            ).toLowerCase()}`

                          }
                        >

                          {bill.status}

                        </div>

                      </div>


                      <div
                        className="waiter-bill-table-info"
                      >

                        <Table2
                          size={17}
                        />

                        Table

                        <strong>

                          {bill.tableNumber}

                        </strong>

                      </div>


                      <div
                        className="waiter-bill-items"
                      >

                        {bill.items?.map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              key={
                                `${bill._id}-${index}`
                              }
                            >

                              <span>

                                {item.name}

                                <small>

                                  × {item.quantity}

                                </small>

                              </span>


                              <strong>

                                ₹
                                {
                                  Number(
                                    item.totalPrice
                                  ).toFixed(
                                    2
                                  )
                                }

                              </strong>

                            </div>

                          )
                        )}

                      </div>


                      <div
                        className="waiter-bill-total"
                      >

                        <span>

                          Total Amount

                        </span>

                        <strong>

                          ₹
                          {
                            Number(
                              bill.totalAmount
                            ).toFixed(
                              2
                            )
                          }

                        </strong>

                      </div>


                      <div
                        className="waiter-bill-footer"
                      >

                        <span>

                          Payment

                        </span>

                        <strong>

                          {bill.paymentStatus}

                        </strong>

                      </div>


                      <div
                        className="waiter-bill-date"
                      >

                        {formatDate(
                          bill.createdAt
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        ) : null}

      </main>


      {/* ===================================================
         DROP TABLE CONFIRMATION MODAL
         =================================================== */}

      {dropConfirmTable ? (

        <div
          className="waiter-drop-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waiter-drop-modal-title"
        >

          <div
            className="waiter-drop-confirm-modal"
          >

            <div
              className="waiter-drop-modal-icon"
            >

              <AlertCircle
                size={30}
              />

            </div>


            <span
              className="waiter-drop-modal-kicker"
            >

              TABLE ACTION

            </span>


            <h2
              id="waiter-drop-modal-title"
            >

              Confirm Drop Table

            </h2>


            <p>

              Are you sure you want to stop serving
              <strong> Table {dropConfirmTable.tableNumber}</strong>?
              This table will become available for other waiters.

            </p>


            <div
              className="waiter-drop-modal-actions"
            >

              <button
                type="button"
                className="waiter-drop-cancel-button"
                disabled={
                  actionLoading ===
                  `drop-${dropConfirmTable._id}`
                }
                onClick={
                  () =>
                    setDropConfirmTable(
                      null
                    )
                }
              >

                Cancel

              </button>


              <button
                type="button"
                className="waiter-drop-confirm-button"
                disabled={
                  actionLoading ===
                  `drop-${dropConfirmTable._id}`
                }
                onClick={
                  confirmDropTable
                }
              >

                {actionLoading ===
                `drop-${dropConfirmTable._id}`
                  ? "Dropping..."
                  : "Confirm Drop"}

              </button>

            </div>

          </div>

        </div>

      ) : null}

                

                {/* ===================================================
   CHECKOUT CONFIRMATION MODAL
   =================================================== */}

{checkoutConfirmTable ? (

  <div
    className="waiter-checkout-modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="waiter-checkout-modal-title"
  >

    <div
      className="waiter-checkout-confirm-modal"
    >

      <div
        className="waiter-checkout-modal-icon"
      >

        <ReceiptText
          size={30}
        />

      </div>


      <span
        className="waiter-checkout-modal-kicker"
      >
        CHECKOUT CONFIRMATION
      </span>


      <h2
        id="waiter-checkout-modal-title"
      >
        Confirm Checkout
      </h2>


      <p>

        Send the checkout request for

        <strong>
          {" "}
          Table {checkoutConfirmTable.tableNumber}
        </strong>

        ?

        <br />

        The manager will be notified to
        generate the bill.

      </p>


      <div
        className="waiter-checkout-modal-actions"
      >

        <button
          type="button"
          className="waiter-checkout-cancel-button"
          disabled={
            actionLoading ===
            `checkout-${checkoutConfirmTable._id}`
          }
          onClick={() =>
            setCheckoutConfirmTable(
              null
            )
          }
        >
          Cancel
        </button>


        <button
          type="button"
          className="waiter-checkout-confirm-button"
          disabled={
            actionLoading ===
            `checkout-${checkoutConfirmTable._id}`
          }
          onClick={
            confirmCheckout
          }
        >

          <ReceiptText
            size={17}
          />

          {actionLoading ===
          `checkout-${checkoutConfirmTable._id}`
            ? "Sending..."
            : "Confirm Checkout"}

        </button>

      </div>

    </div>

  </div>

) : null}


      {/* ===================================================
         READY NOTIFICATION
         =================================================== */}

      {readyNotification ? (

        <div
          className="waiter-modal-overlay"
        >

          <div
            className="waiter-ready-modal"
          >

            <div
              className="waiter-notification-icon"
            >

              <Bell
                size={36}
              />

            </div>


            <span>

              ORDER READY

            </span>


            <h2>

              Table
              {" "}
              {
                readyNotification.tableNumber
              }

              {" "}
              Order is Ready!

            </h2>


            <p>

              The kitchen has completed
              the order. Please serve
              it to the customer.

            </p>


            <button

              className="waiter-primary-button"

              onClick={
                () => {

                  setServeOrder(
                    readyNotification
                  );

                  setReadyNotification(
                    null
                  );

                }
              }

            >

              Serve Order

            </button>

          </div>

        </div>

      ) : null}


      {/* ===================================================
         SERVE MODAL
         =================================================== */}

      {serveOrder ? (

        <div
          className="waiter-modal-overlay"
        >

          <div
            className="waiter-serve-modal"
          >

            <ChefHat
              size={38}
            />


            <span>

              READY TO SERVE

            </span>


            <h2>

              Serve Table
              {" "}
              {
                serveOrder.tableNumber
              }

            </h2>


            <div
              className="waiter-serve-items"
            >

              {serveOrder.items?.map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={
                      `${serveOrder._id}-${index}`
                    }
                  >

                    <span>

                      {item.name}

                    </span>

                    <strong>

                      × {item.quantity}

                    </strong>

                  </div>

                )
              )}

            </div>


            <button

              className="waiter-gold-button"

              disabled={
                actionLoading ===
                `serve-${serveOrder._id}`
              }

              onClick={
                () =>
                  handleServeOrder(
                    serveOrder
                  )
              }

            >

              <Check
                size={18}
              />

              {actionLoading ===
              `serve-${serveOrder._id}`

                ? "Serving..."

                : "Served"}

            </button>


            <button

              className="waiter-modal-close"

              onClick={
                () =>
                  setServeOrder(
                    null
                  )
              }

            >

              Close

            </button>

          </div>

        </div>

      ) : null}

    </div>

  );

}


export default Waiter;