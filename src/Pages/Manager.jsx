import React, {
  useEffect,
  useState,
} from "react";

import "./Manager.css";


/* =========================================================
   API
   ========================================================= */

const API_URL =
  "http://localhost:5000";


/* =========================================================
   CLOUDINARY
   ========================================================= */

const CLOUDINARY_CLOUD_NAME =
  "g0silssv";

const CLOUDINARY_UPLOAD_PRESET =
  "pizzaDemo";

const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


/* =========================================================
   ICON COMPONENT
   ========================================================= */

const Icon = ({
  name,
  size = 20,
}) => {

  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };


  if (name === "menu") {
    return (
      <svg {...common}>
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    );
  }


  if (name === "close") {
    return (
      <svg {...common}>
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    );
  }


  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-7h6v7" />
      </svg>
    );
  }


  if (name === "orders") {
    return (
      <svg {...common}>
        <rect
          x="5"
          y="3"
          width="14"
          height="18"
          rx="2"
        />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    );
  }


  if (name === "menuItems") {
    return (
      <svg {...common}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
        <circle cx="8" cy="6" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="11" cy="18" r="1.5" />
      </svg>
    );
  }


  if (name === "user") {
    return (
      <svg {...common}>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" />
      </svg>
    );
  }


  if (name === "users") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20c0-3.8 2.5-6 6-6s6 2.2 6 6" />
        <path d="M15 14c3 0 5 1.8 5 5" />
      </svg>
    );
  }


  if (name === "chef") {
    return (
      <svg {...common}>
        <path d="M7 10V8a5 5 0 0110 0v2" />
        <path d="M5 10h14v4H5z" />
        <path d="M7 14v6h10v-6" />
        <path d="M9 17h6" />
      </svg>
    );
  }


  if (name === "table") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="6"
          width="16"
          height="7"
          rx="1"
        />
        <path d="M7 13v5" />
        <path d="M17 13v5" />
      </svg>
    );
  }


  if (name === "refresh") {
    return (
      <svg {...common}>
        <path d="M20 11a8 8 0 00-14-5L4 8" />
        <path d="M4 4v4h4" />
        <path d="M4 13a8 8 0 0014 5l2-2" />
        <path d="M20 20v-4h-4" />
      </svg>
    );
  }


  if (name === "logout") {
    return (
      <svg {...common}>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 00-2-2h-5" />
      </svg>
    );
  }


  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }


  if (name === "activity") {
    return (
      <svg {...common}>
        <polyline
          points="3 12 7 12 10 5 14 19 17 12 21 12"
        />
      </svg>
    );
  }


  if (name === "check") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l2.5 2.5L16 9" />
      </svg>
    );
  }


  if (name === "edit") {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path
          d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4z"
        />
      </svg>
    );
  }


  if (name === "upload") {
    return (
      <svg {...common}>
        <path d="M12 16V4" />
        <path d="M7 9l5-5 5 5" />
        <path d="M5 20h14" />
      </svg>
    );
  }


  return null;
};


/* =========================================================
   FORMAT TIME
   ========================================================= */

const formatTime = (date) => {

  if (!date) {
    return "--";
  }

  try {

    return new Date(
      date
    ).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  } catch {

    return "--";

  }
};


/* =========================================================
   FORMAT DATE
   ========================================================= */

const formatDateTime = (date) => {

  if (!date) {
    return "--";
  }

  try {

    return new Date(
      date
    ).toLocaleString(
      [],
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  } catch {

    return "--";

  }
};


/* =========================================================
   MANAGER
   ========================================================= */

const Manager = () => {


  /* =======================================================
     GENERAL STATE
     ======================================================= */

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [activePage, setActivePage] =
    useState("home");

  const [manager, setManager] =
    useState(null);

  const [waiters, setWaiters] =
    useState([]);

  const [kitchenStaff, setKitchenStaff] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);


  /* =======================================================
     ORDERS
     ======================================================= */

  const [orders, setOrders] =
    useState([]);

  const [ordersLoading, setOrdersLoading] =
    useState(false);

  const [ordersError, setOrdersError] =
    useState("");

  const [orderFilter, setOrderFilter] =
    useState("ALL");

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);


  /* =======================================================
     MENU
     ======================================================= */

  const [menuItems, setMenuItems] =
    useState([]);

  const [menuLoading, setMenuLoading] =
    useState(false);

  const [menuError, setMenuError] =
    useState("");

  const [updatingMenuId, setUpdatingMenuId] =
    useState(null);


  /* =======================================================
     ADD DISH
     ======================================================= */

  const [showAddDish, setShowAddDish] =
    useState(false);

  const [addingDish, setAddingDish] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [imageUploadError, setImageUploadError] =
    useState("");

  const [dishForm, setDishForm] =
    useState({

      name: "",

      category: "",

      price: "",

      imageUrl: "",

      isAvailable: true,

    });


  /* =======================================================
     PRICE EDITING
     ======================================================= */

  const [editingPriceId, setEditingPriceId] =
    useState(null);

  const [editingPrice, setEditingPrice] =
    useState("");

  const [savingPriceId, setSavingPriceId] =
    useState(null);


  /* =======================================================
     FETCH ACTIVE USERS
     ======================================================= */

  const fetchActiveUsers = async () => {

    try {

      setRefreshing(true);

      setError("");


      const response =
        await fetch(
          `${API_URL}/api/manager/active-users?_=${Date.now()}`,
          {
            method: "GET",

            credentials: "include",

            cache: "no-store",

            headers: {
              "Cache-Control":
                "no-cache",

              "Pragma":
                "no-cache",
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load active users"
        );

      }


      let managerData = null;


      if (
        Array.isArray(
          data.manager
        )
      ) {

        managerData =
          data.manager[0] ||
          null;

      } else {

        managerData =
          data.manager ||
          null;

      }


      const waiterData =
        Array.isArray(
          data.waiters
        )
          ? data.waiters.map(
              (waiter) => ({
                ...waiter,

                currentTable:
                  waiter.currentTable === null ||
                  waiter.currentTable === undefined ||
                  waiter.currentTable === ""
                    ? null
                    : waiter.currentTable,
              })
            )
          : [];


      let kitchenData = [];


      if (
        Array.isArray(
          data.kitchen
        )
      ) {

        kitchenData =
          data.kitchen;

      } else if (
        Array.isArray(
          data.kitchenStaff
        )
      ) {

        kitchenData =
          data.kitchenStaff;

      }


      setManager(
        managerData
      );

      setWaiters(
        waiterData
      );

      setKitchenStaff(
        kitchenData
      );

      setLastUpdated(
        new Date()
      );


    } catch (err) {

      console.error(
        "Manager dashboard error:",
        err
      );

      setError(
        err.message ||
        "Unable to load dashboard"
      );


    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };


  /* =======================================================
     FETCH ORDERS
     ======================================================= */

  const fetchOrders = async () => {

    try {

      setOrdersLoading(true);

      setOrdersError("");


      const response =
        await fetch(
          `${API_URL}/api/manager/orders?_=${Date.now()}`,
          {
            method: "GET",

            credentials: "include",

            cache: "no-store",

            headers: {
              "Cache-Control":
                "no-cache",

              "Pragma":
                "no-cache",
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load orders"
        );

      }


      setOrders(
        Array.isArray(
          data.orders
        )
          ? data.orders
          : []
      );


    } catch (err) {

      console.error(
        "Orders page error:",
        err
      );

      setOrdersError(
        err.message ||
        "Unable to load orders"
      );


    } finally {

      setOrdersLoading(false);

    }

  };


  /* =======================================================
     FETCH MENU ITEMS
     ======================================================= */

  const fetchMenuItems = async () => {

    try {

      setMenuLoading(true);

      setMenuError("");


      const response =
        await fetch(
          `${API_URL}/api/manager/menu-items?_=${Date.now()}`,
          {
            method: "GET",

            credentials: "include",

            cache: "no-store",

            headers: {
              "Cache-Control":
                "no-cache",

              "Pragma":
                "no-cache",
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to load menu items"
        );

      }


      setMenuItems(
        Array.isArray(
          data.menuItems
        )
          ? data.menuItems
          : Array.isArray(data.items)
          ? data.items
          : []
      );


    } catch (err) {

      console.error(
        "Menu page error:",
        err
      );

      setMenuError(
        err.message ||
        "Unable to load menu items"
      );


    } finally {

      setMenuLoading(false);

    }

  };


  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {

    fetchActiveUsers();

  }, []);


  /* =======================================================
     AUTO REFRESH
     ======================================================= */

  useEffect(() => {

    const interval =
      setInterval(
        () => {

          fetchActiveUsers();

        },
        30000
      );


    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  /* =======================================================
     PAGE DATA
     ======================================================= */

  useEffect(() => {

    if (
      activePage ===
      "orders"
    ) {

      fetchOrders();

    }


    if (
      activePage ===
      "menu"
    ) {

      fetchMenuItems();

    }

  }, [activePage]);


  /* =======================================================
     ORDER STATUS UPDATE
     ======================================================= */

  const updateOrderStatus =
    async (
      orderId,
      status
    ) => {

      try {

        setUpdatingOrderId(
          orderId
        );

        setOrdersError("");


        const response =
          await fetch(
            `${API_URL}/api/manager/orders/${orderId}/status`,
            {
              method: "PATCH",

              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  status,
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Unable to update order status"
          );

        }


        await fetchOrders();


      } catch (err) {

        console.error(
          "Order status update error:",
          err
        );

        setOrdersError(
          err.message ||
          "Unable to update order status"
        );


      } finally {

        setUpdatingOrderId(
          null
        );

      }

    };


  /* =======================================================
     MENU AVAILABILITY UPDATE
     ======================================================= */

  const updateMenuAvailability =
    async (
      itemId,
      isAvailable
    ) => {

      try {

        setUpdatingMenuId(
          itemId
        );

        setMenuError("");


        const response =
          await fetch(
            `${API_URL}/api/manager/menu-items/${itemId}/availability`,
            {
              method: "PATCH",

              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  isAvailable,
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Unable to update availability"
          );

        }


        setMenuItems(
          (current) =>
            current.map(
              (item) =>
                String(
                  item._id
                ) ===
                String(
                  itemId
                )
                  ? {
                      ...item,

                      isAvailable:
                        data.menuItem
                          ?.isAvailable ??
                        isAvailable,
                    }
                  : item
            )
        );


      } catch (err) {

        console.error(
          "Menu availability error:",
          err
        );

        setMenuError(
          err.message ||
          "Unable to update availability"
        );


      } finally {

        setUpdatingMenuId(
          null
        );

      }

    };


  /* =======================================================
     START PRICE EDIT
     ======================================================= */

  const startPriceEdit =
    (item) => {

      setMenuError("");

      setEditingPriceId(
        item._id
      );

      setEditingPrice(
        String(
          Number(
            item.price || 0
          )
        )
      );

    };


  /* =======================================================
     CANCEL PRICE EDIT
     ======================================================= */

  const cancelPriceEdit =
    () => {

      setEditingPriceId(
        null
      );

      setEditingPrice("");

      setSavingPriceId(
        null
      );

    };


  /* =======================================================
     SAVE PRICE
     ======================================================= */

  const updateMenuPrice =
    async (
      itemId
    ) => {

      const value =
        String(
          editingPrice
        ).trim();


      if (
        value === ""
      ) {

        setMenuError(
          "Enter a valid price"
        );

        return;

      }


      const price =
        Number(value);


      if (
        !Number.isFinite(
          price
        ) ||
        price < 0
      ) {

        setMenuError(
          "Enter a valid price"
        );

        return;

      }


      try {

        setSavingPriceId(
          itemId
        );

        setMenuError("");


        const response =
          await fetch(
            `${API_URL}/api/manager/menu-items/${itemId}`,
            {
              method: "PATCH",

              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  price,
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Unable to update price"
          );

        }


        const savedItem =
          data.menuItem ||
          data.item;


        setMenuItems(
          (current) =>
            current.map(
              (item) =>
                String(
                  item._id
                ) ===
                String(
                  itemId
                )
                  ? {
                      ...item,

                      price:
                        savedItem
                          ?.price ??
                        price,
                    }
                  : item
            )
        );


        setEditingPriceId(
          null
        );

        setEditingPrice("");


      } catch (err) {

        console.error(
          "Price update error:",
          err
        );

        setMenuError(
          err.message ||
          "Unable to update price"
        );


      } finally {

        setSavingPriceId(
          null
        );

      }

    };


  /* =======================================================
     CLOUDINARY IMAGE UPLOAD
     ======================================================= */

  const uploadDishImage =
    async (
      event
    ) => {

      const file =
        event.target.files?.[0];


      if (!file) {

        return;

      }


      setImageUploadError("");


      /* -----------------------------------------------------
         ONLY IMAGE FILES
         ----------------------------------------------------- */

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        setImageUploadError(
          "Please select an image file."
        );

        event.target.value =
          "";

        return;

      }


      /* -----------------------------------------------------
         FILE SIZE LIMIT
         ----------------------------------------------------- */

      const maxSize =
        5 * 1024 * 1024;


      if (
        file.size >
        maxSize
      ) {

        setImageUploadError(
          "Image must be smaller than 5 MB."
        );

        event.target.value =
          "";

        return;

      }


      try {

        setUploadingImage(
          true
        );


        /* ---------------------------------------------------
           FORM DATA FOR CLOUDINARY
           --------------------------------------------------- */

        const formData =
          new FormData();


        formData.append(
          "file",
          file
        );


        formData.append(
          "upload_preset",
          CLOUDINARY_UPLOAD_PRESET
        );


        /* ---------------------------------------------------
           OPTIONAL FOLDER
           --------------------------------------------------- */

        formData.append(
          "folder",
          "kitchenflow/menu"
        );


        /* ---------------------------------------------------
           SEND TO CLOUDINARY
           --------------------------------------------------- */

        const response =
          await fetch(
            CLOUDINARY_UPLOAD_URL,
            {
              method: "POST",

              body:
                formData,
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.error?.message ||
            "Cloudinary image upload failed."
          );

        }


        /* ---------------------------------------------------
           CLOUDINARY RETURNS secure_url
           --------------------------------------------------- */

        if (
          !data.secure_url
        ) {

          throw new Error(
            "Cloudinary did not return an image URL."
          );

        }


        /* ---------------------------------------------------
           SAVE URL IN FORM STATE
           --------------------------------------------------- */

        setDishForm(
          (current) => ({
            ...current,

            imageUrl:
              data.secure_url,
          })
        );


      } catch (err) {

        console.error(
          "Cloudinary upload error:",
          err
        );

        setImageUploadError(
          err.message ||
          "Unable to upload image."
        );


      } finally {

        setUploadingImage(
          false
        );

        event.target.value =
          "";

      }

    };


  /* =======================================================
     ADD NEW DISH
     ======================================================= */

  const addDish =
    async (
      event
    ) => {

      event.preventDefault();


      /* ---------------------------------------------------
         VALIDATE NAME
         --------------------------------------------------- */

      if (
        !dishForm.name.trim()
      ) {

        setMenuError(
          "Enter dish name"
        );

        return;

      }


      /* ---------------------------------------------------
         VALIDATE CATEGORY
         --------------------------------------------------- */

      if (
        !dishForm.category.trim()
      ) {

        setMenuError(
          "Enter dish category"
        );

        return;

      }


      /* ---------------------------------------------------
         VALIDATE PRICE
         --------------------------------------------------- */

      const price =
        Number(
          dishForm.price
        );


      if (
        dishForm.price === "" ||
        !Number.isFinite(price) ||
        price < 0
      ) {

        setMenuError(
          "Enter a valid price"
        );

        return;

      }


      /* ---------------------------------------------------
         DON'T ADD WHILE IMAGE IS UPLOADING
         --------------------------------------------------- */

      if (
        uploadingImage
      ) {

        setMenuError(
          "Please wait until the image finishes uploading."
        );

        return;

      }


      try {

        setAddingDish(
          true
        );

        setMenuError("");


        /* -------------------------------------------------
           SEND MENU ITEM TO OUR BACKEND
           ------------------------------------------------- */

        const response =
          await fetch(
            `${API_URL}/api/manager/menu-items`,
            {
              method: "POST",

              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({

                  name:
                    dishForm.name.trim(),

                  category:
                    dishForm.category.trim(),

                  price,

                  imageUrl:
                    dishForm.imageUrl.trim(),

                  isAvailable:
                    Boolean(
                      dishForm.isAvailable
                    ),

                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Unable to add menu item"
          );

        }


        /* -------------------------------------------------
           ADD NEW ITEM TO UI
           ------------------------------------------------- */

        if (
          data.menuItem
        ) {

          setMenuItems(
            (current) => [
              data.menuItem,
              ...current,
            ]
          );

        }


        /* -------------------------------------------------
           RESET FORM
           ------------------------------------------------- */

        setDishForm({

          name: "",

          category: "",

          price: "",

          imageUrl: "",

          isAvailable: true,

        });


        setImageUploadError("");


        setShowAddDish(
          false
        );


      } catch (err) {

        console.error(
          "Add dish error:",
          err
        );

        setMenuError(
          err.message ||
          "Unable to add menu item"
        );


      } finally {

        setAddingDish(
          false
        );

      }

    };


  /* =======================================================
     NAVIGATION
     ======================================================= */

  const changePage =
    (page) => {

      setActivePage(
        page
      );

      setMenuOpen(
        false
      );

    };


  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout =
    async () => {

      try {

        await fetch(
          `${API_URL}/api/auth/logout`,
          {
            method: "POST",

            credentials:
              "include",
          }
        );

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      } finally {

        window.location.href =
          "/";

      }

    };


  /* =======================================================
     EMPLOYEE CARD
     ======================================================= */

  const EmployeeCard =
    ({
      employee,
      type,
    }) => {

      const isWaiter =
        type === "waiter";


      const currentTable =
        employee.currentTable !==
          null &&
        employee.currentTable !==
          undefined &&
        employee.currentTable !==
          ""
          ? employee.currentTable
          : null;


      const employeeImage =
        employee.imageUrl ||
        employee.profileImage ||
        "";


      return (

        <div className="employee-card">

          <div className="employee-card-top">

            <div className="employee-avatar">

              {employeeImage ? (

                <img
                  src={
                    employeeImage
                  }
                  alt={
                    employee.name
                  }
                />

              ) : (

                <Icon
                  name={
                    isWaiter
                      ? "user"
                      : "chef"
                  }
                  size={29}
                />

              )}

            </div>


            <div className="employee-main">

              <div className="employee-name-row">

                <h3>
                  {employee.name}
                </h3>


                <span className="verified-icon">

                  <Icon
                    name="check"
                    size={14}
                  />

                </span>

              </div>


              <p className="employee-role">

                {isWaiter
                  ? "WAITER"
                  : "KITCHEN STAFF"}

              </p>


              <p className="employee-email">

                {employee.email}

              </p>

            </div>


            <div className="active-badge">

              <span className="active-dot" />

              ACTIVE

            </div>

          </div>


          <div className="employee-footer">

            <div className="status-information">

              <div className="status-label">

                <Icon
                  name={
                    isWaiter
                      ? "table"
                      : "activity"
                  }
                  size={14}
                />

                <span>

                  {isWaiter
                    ? "Serving Status"
                    : "Work Status"}

                </span>

              </div>


              <p
                className={
                  currentTable
                    ? "table-status busy"
                    : "table-status free"
                }
              >

                {isWaiter
                  ? currentTable !== null
                    ? `TABLE ${String(
                        currentTable
                      ).padStart(
                        2,
                        "0"
                      )}`
                    : "FREE"
                  : "ON DUTY"}

              </p>

            </div>


            <div className="last-active">

              <Icon
                name="clock"
                size={12}
              />

              <span>

                Last active{" "}

                {formatTime(
                  employee.lastActiveAt
                )}

              </span>

            </div>

          </div>

        </div>

      );

    };


  /* =======================================================
     STAT CARD
     ======================================================= */

  const StatCard =
    ({
      icon,
      title,
      value,
      subtitle,
    }) => (

      <div className="stat-card">

        <div className="stat-top">

          <div className="stat-icon">

            <Icon
              name={icon}
              size={22}
            />

          </div>


          <span className="stat-live">
            LIVE
          </span>

        </div>


        <div className="stat-content">

          <strong>
            {value}
          </strong>

          <h3>
            {title}
          </h3>

          <p>
            {subtitle}
          </p>

        </div>

      </div>

    );


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {

    return (

      <div className="manager-loading">

        <div className="loading-logo">

          <Icon
            name="chef"
            size={32}
          />

        </div>


        <h2>

          Kitchen

          <span>
            Flow
          </span>

        </h2>


        <p>
          Loading manager dashboard...
        </p>

      </div>

    );

  }


  /* =======================================================
     MAIN
     ======================================================= */

  return (

    <div className="manager-page">


      {/* ===================================================
          MOBILE OVERLAY
          =================================================== */}

      {menuOpen && (

        <div
          className="sidebar-overlay"
          onClick={() =>
            setMenuOpen(
              false
            )
          }
        />

      )}


      {/* ===================================================
          SIDEBAR
          =================================================== */}

      <aside
        className={`
          manager-sidebar
          ${
            menuOpen
              ? "sidebar-open"
              : ""
          }
        `}
      >

        <div className="sidebar-brand">

          <div className="brand-icon">

            <Icon
              name="chef"
              size={24}
            />

          </div>


          <div className="brand-text">

            <h2>

              KITCHEN
              <span>
                FLOW
              </span>

            </h2>


            <p>
              MANAGER PANEL
            </p>

          </div>


          <button
            className="mobile-close"
            onClick={() =>
              setMenuOpen(
                false
              )
            }
          >

            <Icon
              name="close"
              size={18}
            />

          </button>

        </div>


        {/* NAVIGATION */}

        <div className="sidebar-section">

          <p className="sidebar-title">
            WORKSPACE
          </p>


          <button
            className={`
              sidebar-link
              ${
                activePage ===
                "home"
                  ? "active"
                  : ""
              }
            `}
            onClick={() =>
              changePage(
                "home"
              )
            }
          >

            <Icon
              name="home"
              size={18}
            />

            <span>
              Home
            </span>

          </button>


          <button
            className={`
              sidebar-link
              ${
                activePage ===
                "orders"
                  ? "active"
                  : ""
              }
            `}
            onClick={() =>
              changePage(
                "orders"
              )
            }
          >

            <Icon
              name="orders"
              size={18}
            />

            <span>
              Orders
            </span>

            <small>
              LIVE
            </small>

          </button>


          <button
            className={`
              sidebar-link
              ${
                activePage ===
                "menu"
                  ? "active"
                  : ""
              }
            `}
            onClick={() =>
              changePage(
                "menu"
              )
            }
          >

            <Icon
              name="menuItems"
              size={18}
            />

            <span>
              Menu Items
            </span>

            <small>
              LIVE
            </small>

          </button>

        </div>


        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          {manager && (

            <div className="sidebar-user">

              <div className="sidebar-user-icon">

                {manager.imageUrl ? (

                  <img
                    src={
                      manager.imageUrl
                    }
                    alt={
                      manager.name
                    }
                  />

                ) : (

                  <Icon
                    name="user"
                    size={17}
                  />

                )}

              </div>


              <div>

                <strong>
                  {manager.name}
                </strong>

                <span>
                  Manager
                </span>

              </div>

            </div>

          )}


          <button
            className="logout-button"
            onClick={
              handleLogout
            }
          >

            <Icon
              name="logout"
              size={17}
            />

            Logout

          </button>

        </div>

      </aside>


      {/* ===================================================
          MAIN
          =================================================== */}

      <div className="manager-main">


        {/* =================================================
            HEADER
            ================================================= */}

        <header className="manager-header">

          <div className="header-left">

            <button
              className="menu-button"
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
            >

              <Icon
                name="menu"
                size={21}
              />

            </button>


            <div className="header-heading">

              <span>
                MANAGER DASHBOARD
              </span>


              <h1>

                {activePage ===
                "home"
                  ? "Overview"
                  : activePage ===
                    "orders"
                  ? "Orders"
                  : "Menu Items"}

              </h1>

            </div>

          </div>


          <div className="header-right">

            <button
              type="button"
              className="refresh-button"
              onClick={() => {

                fetchActiveUsers();

                if (
                  activePage ===
                  "orders"
                ) {

                  fetchOrders();

                }

                if (
                  activePage ===
                  "menu"
                ) {

                  fetchMenuItems();

                }

              }}
              disabled={
                refreshing
              }
            >

              <span
                className={
                  refreshing
                    ? "spinning"
                    : ""
                }
              >

                <Icon
                  name="refresh"
                  size={17}
                />

              </span>

            </button>


            <div className="header-user">

              <div className="header-user-text">

                <strong>
                  {manager?.name ||
                    "Manager"}
                </strong>

                <span>
                  MANAGER
                </span>

              </div>


              <div className="header-user-avatar">

                {manager?.imageUrl ? (

                  <img
                    src={
                      manager.imageUrl
                    }
                    alt={
                      manager.name
                    }
                  />

                ) : (

                  <Icon
                    name="user"
                    size={18}
                  />

                )}

              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            CONTENT
            ================================================= */}

        <main className="manager-content">


          {error && (

            <div className="error-message">
              {error}
            </div>

          )}


          {/* =================================================
              HOME
              ================================================= */}

          {activePage ===
            "home" && (

            <>

              <section className="dashboard-hero">

                <div className="hero-glow" />


                <div className="hero-content">

                  <div className="hero-label">

                    <span />

                    KITCHENFLOW

                  </div>


                  <h2>

                    Welcome back,{" "}

                    <span>
                      {manager?.name ||
                        "Manager"}
                    </span>

                  </h2>


                  <p>

                    Monitor your active team
                    and keep track of restaurant
                    floor activity from one place.

                  </p>

                </div>


                <div className="restaurant-status">

                  <span className="live-pulse" />

                  <div>

                    <strong>
                      RESTAURANT LIVE
                    </strong>

                    <p>
                      Team monitoring active
                    </p>

                  </div>

                </div>

              </section>


              {/* STATS */}

              <section className="stats-grid">

                <StatCard
                  icon="user"
                  title="Active Manager"
                  value={
                    manager
                      ? "01"
                      : "00"
                  }
                  subtitle="Management"
                />


                <StatCard
                  icon="users"
                  title="Active Waiters"
                  value={String(
                    waiters.length
                  ).padStart(
                    2,
                    "0"
                  )}
                  subtitle="Front of House"
                />


                <StatCard
                  icon="chef"
                  title="Kitchen Staff"
                  value={String(
                    kitchenStaff.length
                  ).padStart(
                    2,
                    "0"
                  )}
                  subtitle="Back of House"
                />


                <StatCard
                  icon="activity"
                  title="Active Team"
                  value={String(
                    (manager
                      ? 1
                      : 0) +
                    waiters.length +
                    kitchenStaff.length
                  ).padStart(
                    2,
                    "0"
                  )}
                  subtitle="Currently Online"
                />

              </section>


              {/* MANAGER */}

              <section className="dashboard-section">

                <div className="section-heading">

                  <div>

                    <span>
                      MANAGEMENT
                    </span>

                    <h2>

                      Active{" "}

                      <strong>
                        Manager
                      </strong>

                    </h2>

                  </div>


                  <p>
                    CURRENTLY ONLINE
                  </p>

                </div>


                {manager ? (

                  <div className="manager-card">

                    <div className="manager-card-avatar">

                      {manager.imageUrl ? (

                        <img
                          src={
                            manager.imageUrl
                          }
                          alt={
                            manager.name
                          }
                        />

                      ) : (

                        <Icon
                          name="user"
                          size={36}
                        />

                      )}

                    </div>


                    <div className="manager-card-info">

                      <div className="manager-name-line">

                        <h3>
                          {manager.name}
                        </h3>


                        <span className="online-pill">

                          <i />

                          ONLINE

                        </span>

                      </div>


                      <span className="gold-role">
                        MANAGER
                      </span>


                      <p>
                        {manager.email}
                      </p>

                    </div>


                    <div className="manager-activity">

                      <Icon
                        name="clock"
                        size={15}
                      />

                      <div>

                        <span>
                          LAST ACTIVE
                        </span>

                        <strong>
                          {formatTime(
                            manager.lastActiveAt
                          )}
                        </strong>

                      </div>

                    </div>

                  </div>

                ) : (

                  <div className="empty-state">
                    No active manager
                  </div>

                )}

              </section>


              {/* WAITERS */}

              <section className="dashboard-section">

                <div className="section-heading">

                  <div>

                    <span>
                      FRONT OF HOUSE
                    </span>

                    <h2>

                      Active{" "}

                      <strong>
                        Waiters
                      </strong>

                    </h2>

                  </div>


                  <div className="section-count">

                    <i />

                    {waiters.length}
                    {" "}
                    ONLINE

                  </div>

                </div>


                {waiters.length >
                0 ? (

                  <div className="employee-grid">

                    {waiters.map(
                      (
                        waiter
                      ) => (

                        <EmployeeCard
                          key={
                            waiter._id
                          }
                          employee={
                            waiter
                          }
                          type="waiter"
                        />

                      )
                    )}

                  </div>

                ) : (

                  <div className="empty-state">
                    No active waiters
                  </div>

                )}

              </section>


              {/* KITCHEN */}

              <section className="dashboard-section">

                <div className="section-heading">

                  <div>

                    <span>
                      BACK OF HOUSE
                    </span>

                    <h2>

                      Active{" "}

                      <strong>
                        Kitchen Staff
                      </strong>

                    </h2>

                  </div>


                  <div className="section-count">

                    <i />

                    {kitchenStaff.length}
                    {" "}
                    ONLINE

                  </div>

                </div>


                {kitchenStaff.length >
                0 ? (

                  <div className="employee-grid">

                    {kitchenStaff.map(
                      (
                        cook
                      ) => (

                        <EmployeeCard
                          key={
                            cook._id
                          }
                          employee={
                            cook
                          }
                          type="kitchen"
                        />

                      )
                    )}

                  </div>

                ) : (

                  <div className="empty-state">
                    No active kitchen staff
                  </div>

                )}

              </section>


              <footer className="dashboard-footer">

                <Icon
                  name="refresh"
                  size={11}
                />

                Last updated{" "}

                {formatTime(
                  lastUpdated
                )}

              </footer>

            </>

          )}


          {/* =================================================
              ORDERS
              ================================================= */}

          {activePage ===
            "orders" && (

            <section className="manager-page-section">

              <div className="page-toolbar">

                <div>

                  <span className="page-kicker">
                    ORDER MANAGEMENT
                  </span>

                  <h2 className="page-title">
                    Restaurant Orders
                  </h2>

                  <p className="page-description">

                    Monitor every order, table,
                    item, instruction and current
                    status.

                  </p>

                </div>


                <button
                  type="button"
                  className="page-refresh-button"
                  onClick={
                    fetchOrders
                  }
                  disabled={
                    ordersLoading
                  }
                >

                  <Icon
                    name="refresh"
                    size={16}
                  />

                  {ordersLoading
                    ? "Refreshing..."
                    : "Refresh"}

                </button>

              </div>


              <div className="order-filter-row">

                {[
                  "ALL",
                  "ORDERED",
                  "PROCESSING",
                  "COOKED",
                  "SERVED",
                ].map(
                  (
                    status
                  ) => (

                    <button
                      key={
                        status
                      }
                      type="button"
                      className={
                        orderFilter ===
                        status
                          ? "order-filter active"
                          : "order-filter"
                      }
                      onClick={() =>
                        setOrderFilter(
                          status
                        )
                      }
                    >

                      {status}

                    </button>

                  )
                )}

              </div>


              {ordersError && (

                <div className="error-message">
                  {ordersError}
                </div>

              )}


              {ordersLoading &&
              orders.length ===
                0 ? (

                <div className="page-loading-state">

                  <Icon
                    name="refresh"
                    size={28}
                  />

                  <p>
                    Loading orders...
                  </p>

                </div>

              ) : (

                (() => {

                  const filteredOrders =
                    orders.filter(
                      (
                        order
                      ) => {

                        if (
                          orderFilter ===
                          "ALL"
                        ) {

                          return true;

                        }


                        const status =
                          String(
                            order.displayStatus ||
                            order.status ||
                            "ORDERED"
                          ).toUpperCase();


                        return (
                          status ===
                          orderFilter
                        );

                      }
                    );


                  if (
                    filteredOrders.length ===
                    0
                  ) {

                    return (

                      <div className="empty-state">
                        No orders found.
                      </div>

                    );

                  }


                  return (

                    <div className="orders-grid">

                      {filteredOrders.map(
                        (
                          order
                        ) => {

                          const status =
                            String(
                              order.displayStatus ||
                              order.status ||
                              "ORDERED"
                            ).toUpperCase();


                          const total =
                            Number(
                              order.total
                            ) ||
                            (
                              Array.isArray(
                                order.items
                              )
                                ? order.items.reduce(
                                    (
                                      sum,
                                      item
                                    ) =>
                                      sum +
                                      (
                                        Number(
                                          item.unitPrice
                                        ) ||
                                        0
                                      ) *
                                      (
                                        Number(
                                          item.quantity
                                        ) ||
                                        1
                                      ),
                                    0
                                  )
                                : 0
                            );


                          return (

                            <article
                              key={
                                order._id
                              }
                              className="order-card"
                            >

                              <div className="order-card-header">

                                <div>

                                  <span className="order-table-label">
                                    TABLE
                                  </span>

                                  <h3>

                                    {order.tableNumber !==
                                      null &&
                                    order.tableNumber !==
                                      undefined
                                      ? `TABLE ${String(
                                          order.tableNumber
                                        ).padStart(
                                          2,
                                          "0"
                                        )}`
                                      : "TABLE --"}

                                  </h3>

                                  <p>

                                    Order #

                                    {String(
                                      order._id
                                    ).slice(
                                      -4
                                    )}

                                  </p>

                                </div>


                                <span
                                  className={`order-status status-${status.toLowerCase()}`}
                                >

                                  {status ===
                                  "READY"
                                    ? "COOKED"
                                    : status}

                                </span>

                              </div>


                              <div className="order-meta-row">

                                <span>
                                  {formatDateTime(
                                    order.createdAt
                                  )}
                                </span>


                                {order.createdByUser?.name && (

                                  <span>
                                    By{" "}
                                    {
                                      order.createdByUser.name
                                    }
                                  </span>

                                )}

                              </div>


                              <div className="order-items-list">

                                {Array.isArray(
                                  order.items
                                ) &&
                                  order.items.map(
                                    (
                                      item,
                                      index
                                    ) => (

                                      <div
                                        className="order-item-row"
                                        key={`${order._id}-${index}`}
                                      >

                                        <div className="order-item-image">

                                          {item.imageUrl ? (

                                            <img
                                              src={
                                                item.imageUrl
                                              }
                                              alt={
                                                item.name ||
                                                "Dish"
                                              }
                                            />

                                          ) : (

                                            <Icon
                                              name="menuItems"
                                              size={24}
                                            />

                                          )}

                                        </div>


                                        <div className="order-item-info">

                                          <h4>
                                            {item.name ||
                                              "Unknown Dish"}
                                          </h4>


                                          <div className="order-item-details">

                                            <span>
                                              Qty{" "}
                                              {item.quantity ||
                                                1}
                                            </span>

                                            <span>
                                              ₹
                                              {Number(
                                                item.unitPrice ||
                                                  0
                                              ).toFixed(
                                                0
                                              )}
                                            </span>

                                          </div>


                                          {item.instruction && (

                                            <p className="order-instruction">

                                              <strong>
                                                Note:
                                              </strong>{" "}

                                              {
                                                item.instruction
                                              }

                                            </p>

                                          )}

                                        </div>


                                        <strong className="order-item-total">

                                          ₹
                                          {(
                                            (
                                              Number(
                                                item.unitPrice
                                              ) ||
                                              0
                                            ) *
                                            (
                                              Number(
                                                item.quantity
                                              ) ||
                                              1
                                            )
                                          ).toFixed(
                                            0
                                          )}

                                        </strong>

                                      </div>

                                    )
                                  )}

                              </div>


                              <div className="order-total-row">

                                <span>
                                  Total
                                </span>

                                <strong>
                                  ₹
                                  {total.toFixed(
                                    0
                                  )}
                                </strong>

                              </div>


                              <div className="order-status-controls">

                                {[
                                  "ORDERED",
                                  "PROCESSING",
                                  "COOKED",
                                  "SERVED",
                                ].map(
                                  (
                                    nextStatus
                                  ) => (

                                    <button
                                      key={
                                        nextStatus
                                      }
                                      type="button"
                                      className={
                                        status ===
                                          nextStatus ||
                                        (
                                          nextStatus ===
                                            "COOKED" &&
                                          status ===
                                            "READY"
                                        )
                                          ? "selected"
                                          : ""
                                      }
                                      disabled={
                                        updatingOrderId ===
                                          order._id ||
                                        status ===
                                          nextStatus ||
                                        (
                                          nextStatus ===
                                            "COOKED" &&
                                          status ===
                                            "READY"
                                        )
                                      }
                                      onClick={() =>
                                        updateOrderStatus(
                                          order._id,
                                          nextStatus
                                        )
                                      }
                                    >

                                      {nextStatus}

                                    </button>

                                  )
                                )}

                              </div>

                            </article>

                          );

                        }
                      )}

                    </div>

                  );

                })()

              )}

            </section>

          )}


          {/* =================================================
              MENU
              ================================================= */}

          {activePage ===
            "menu" && (

            <section className="manager-page-section">


              {/* =================================================
                  MENU HEADER
                  ================================================= */}

              <div className="page-toolbar">

                <div>

                  <span className="page-kicker">
                    RESTAURANT MENU
                  </span>

                  <h2 className="page-title">
                    Menu Items
                  </h2>

                  <p className="page-description">

                    Manage dishes, categories,
                    prices, images and availability.

                  </p>

                </div>


                <button
                  type="button"
                  className="add-dish-button"
                  onClick={() => {

                    setMenuError("");

                    setImageUploadError("");

                    setShowAddDish(
                      true
                    );

                  }}
                >

                  + Add New Dish

                </button>

              </div>


              {menuError && (

                <div className="error-message">
                  {menuError}
                </div>

              )}


              {/* =================================================
                  ADD DISH MODAL
                  ================================================= */}

              {showAddDish && (

                <div className="dish-modal-backdrop">

                  <div className="dish-modal">


                    <div className="dish-modal-header">

                      <div>

                        <span className="page-kicker">
                          MENU MANAGEMENT
                        </span>

                        <h3>
                          Add New Dish
                        </h3>

                      </div>


                      <button
                        type="button"
                        className="modal-close-button"
                        onClick={() => {

                          if (
                            !addingDish &&
                            !uploadingImage
                          ) {

                            setShowAddDish(
                              false
                            );

                            setImageUploadError("");

                          }

                        }}
                      >

                        ×

                      </button>

                    </div>


                    <form
                      onSubmit={
                        addDish
                      }
                    >


                      {/* DISH NAME */}

                      <label>

                        Dish Name

                        <input
                          type="text"
                          value={
                            dishForm.name
                          }
                          onChange={(
                            event
                          ) =>
                            setDishForm(
                              (
                                current
                              ) => ({
                                ...current,

                                name:
                                  event.target.value,
                              })
                            )
                          }
                          placeholder="e.g. Chicken Biryani"
                        />

                      </label>


                      {/* CATEGORY */}

                      <label>

                        Category

                        <input
                          type="text"
                          value={
                            dishForm.category
                          }
                          onChange={(
                            event
                          ) =>
                            setDishForm(
                              (
                                current
                              ) => ({
                                ...current,

                                category:
                                  event.target.value,
                              })
                            )
                          }
                          placeholder="e.g. Main Course"
                        />

                      </label>


                      {/* PRICE */}

                      <label>

                        Price

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            dishForm.price
                          }
                          onChange={(
                            event
                          ) =>
                            setDishForm(
                              (
                                current
                              ) => ({
                                ...current,

                                price:
                                  event.target.value,
                              })
                            )
                          }
                          placeholder="220"
                        />

                      </label>


                      {/* =================================================
                          CLOUDINARY IMAGE
                          ================================================= */}

                      <label>

                        Dish Image

                        <div className="cloudinary-upload-box">

                          <input
                            id="dish-image-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={
                              uploadDishImage
                            }
                            disabled={
                              uploadingImage ||
                              addingDish
                            }
                          />


                          <label
                            htmlFor="dish-image-upload"
                            className="cloudinary-upload-button"
                          >

                            <Icon
                              name="upload"
                              size={20}
                            />

                            {uploadingImage
                              ? "Uploading Image..."
                              : "Choose Food Image"}

                          </label>


                          <span className="cloudinary-upload-help">

                            JPG, PNG or WEBP
                            {" "}
                            •
                            {" "}
                            Max 5 MB

                          </span>

                        </div>

                      </label>


                      {/* IMAGE UPLOAD ERROR */}

                      {imageUploadError && (

                        <div className="error-message">

                          {imageUploadError}

                        </div>

                      )}


                      {/* IMAGE PREVIEW */}

                      {dishForm.imageUrl && (

                        <div className="dish-image-preview">

                          <img
                            src={
                              dishForm.imageUrl
                            }
                            alt="Dish preview"
                          />


                          <div>

                            <strong>
                              Image uploaded
                            </strong>

                            <span>
                              Cloudinary image ready
                            </span>

                          </div>

                        </div>

                      )}


                      {/* AVAILABLE */}

                      <label className="availability-checkbox-label">

                        <input
                          type="checkbox"
                          checked={
                            dishForm.isAvailable
                          }
                          onChange={(
                            event
                          ) =>
                            setDishForm(
                              (
                                current
                              ) => ({
                                ...current,

                                isAvailable:
                                  event.target.checked,
                              })
                            )
                          }
                        />

                        Available immediately

                      </label>


                      {/* ACTIONS */}

                      <div className="dish-modal-actions">

                        <button
                          type="button"
                          className="modal-cancel-button"
                          onClick={() => {

                            if (
                              !addingDish &&
                              !uploadingImage
                            ) {

                              setShowAddDish(
                                false
                              );

                              setImageUploadError("");

                            }

                          }}
                        >

                          Cancel

                        </button>


                        <button
                          type="submit"
                          className="modal-submit-button"
                          disabled={
                            addingDish ||
                            uploadingImage
                          }
                        >

                          {uploadingImage
                            ? "Uploading..."
                            : addingDish
                            ? "Adding..."
                            : "Add Dish"}

                        </button>

                      </div>


                    </form>

                  </div>

                </div>

              )}


              {/* =================================================
                  TOOLBAR
                  ================================================= */}

              <div className="menu-toolbar-row">

                <span>

                  {menuItems.length}
                  {" "}
                  menu items

                </span>


                <button
                  type="button"
                  className="page-refresh-button"
                  onClick={
                    fetchMenuItems
                  }
                  disabled={
                    menuLoading
                  }
                >

                  <Icon
                    name="refresh"
                    size={16}
                  />

                  {menuLoading
                    ? "Refreshing..."
                    : "Refresh"}

                </button>

              </div>


              {/* =================================================
                  MENU LOADING
                  ================================================= */}

              {menuLoading &&
              menuItems.length ===
                0 ? (

                <div className="page-loading-state">

                  <Icon
                    name="refresh"
                    size={28}
                  />

                  <p>
                    Loading menu...
                  </p>

                </div>

              ) : menuItems.length ===
                0 ? (

                <div className="empty-state">
                  No menu items found.
                </div>

              ) : (

                <div className="menu-category-list">

                  {Object.entries(
                    menuItems.reduce(
                      (
                        groups,
                        item
                      ) => {

                        const category =
                          item.category ||
                          "Other";


                        if (
                          !groups[
                            category
                          ]
                        ) {

                          groups[
                            category
                          ] = [];

                        }


                        groups[
                          category
                        ].push(
                          item
                        );


                        return groups;

                      },
                      {}
                    )
                  )
                    .sort(
                      (
                        [a],
                        [b]
                      ) =>
                        a.localeCompare(
                          b
                        )
                    )
                    .map(
                      (
                        [
                          category,
                          items,
                        ]
                      ) => (

                        <section
                          key={
                            category
                          }
                          className="menu-category-section"
                        >

                          <div className="menu-category-heading">

                            <div>

                              <span>
                                CATEGORY
                              </span>

                              <h3>
                                {category}
                              </h3>

                            </div>


                            <strong>
                              {items.length}
                            </strong>

                          </div>


                          <div className="menu-items-grid">

                            {items.map(
                              (
                                item
                              ) => (

                                <article
                                  key={
                                    item._id
                                  }
                                  className={
                                    item.isAvailable
                                      ? "menu-item-card"
                                      : "menu-item-card unavailable"
                                  }
                                >


                                  {/* IMAGE */}

                                  <div className="menu-item-image">

                                    {item.imageUrl ? (

                                      <img
                                        src={
                                          item.imageUrl
                                        }
                                        alt={
                                          item.name
                                        }
                                        onError={(
                                          event
                                        ) => {

                                          event.currentTarget.style.display =
                                            "none";

                                        }}
                                      />

                                    ) : (

                                      <Icon
                                        name="menuItems"
                                        size={30}
                                      />

                                    )}

                                  </div>


                                  {/* CONTENT */}

                                  <div className="menu-item-content">

                                    <div className="menu-item-title-row">

                                      <div>

                                        <h4>
                                          {item.name}
                                        </h4>

                                        <span>
                                          {item.category}
                                        </span>

                                      </div>


                                      {/* =================================================
                                          PRICE EDITOR
                                          ================================================= */}

                                      {editingPriceId ===
                                      item._id ? (

                                        <div className="price-edit-mode">

                                          <div className="price-input-wrapper">

                                            <span>
                                              ₹
                                            </span>

                                            <input
                                              type="number"
                                              min="0"
                                              step="1"
                                              value={
                                                editingPrice
                                              }
                                              autoFocus
                                              disabled={
                                                savingPriceId ===
                                                item._id
                                              }
                                              onChange={(
                                                event
                                              ) =>
                                                setEditingPrice(
                                                  event
                                                    .target
                                                    .value
                                                )
                                              }
                                              onKeyDown={(
                                                event
                                              ) => {

                                                if (
                                                  event.key ===
                                                  "Enter"
                                                ) {

                                                  event.preventDefault();

                                                  updateMenuPrice(
                                                    item._id
                                                  );

                                                }


                                                if (
                                                  event.key ===
                                                  "Escape"
                                                ) {

                                                  event.preventDefault();

                                                  cancelPriceEdit();

                                                }

                                              }}
                                            />

                                          </div>


                                          {/* RED X */}

                                          <button
                                            type="button"
                                            className="price-cancel-button"
                                            onClick={
                                              cancelPriceEdit
                                            }
                                            disabled={
                                              savingPriceId ===
                                              item._id
                                            }
                                            title="Cancel"
                                          >

                                            ×

                                          </button>


                                          {/* GOLDEN CHECK */}

                                          <button
                                            type="button"
                                            className="price-save-button"
                                            onClick={() =>
                                              updateMenuPrice(
                                                item._id
                                              )
                                            }
                                            disabled={
                                              savingPriceId ===
                                              item._id
                                            }
                                            title="Save"
                                          >

                                            {savingPriceId ===
                                            item._id
                                              ? "..."
                                              : "✓"}

                                          </button>

                                        </div>

                                      ) : (

                                        <div className="price-display-mode">

                                          <strong>

                                            ₹
                                            {Number(
                                              item.price ||
                                                0
                                            ).toFixed(
                                              0
                                            )}

                                          </strong>


                                          <button
                                            type="button"
                                            className="price-edit-button"
                                            onClick={() =>
                                              startPriceEdit(
                                                item
                                              )
                                            }
                                            title="Edit price"
                                          >

                                            <Icon
                                              name="edit"
                                              size={16}
                                            />

                                          </button>

                                        </div>

                                      )}

                                    </div>


                                    {/* AVAILABILITY */}

                                    <label className="availability-toggle">

                                      <input
                                        type="checkbox"
                                        checked={Boolean(
                                          item.isAvailable
                                        )}
                                        disabled={
                                          updatingMenuId ===
                                          item._id
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateMenuAvailability(
                                            item._id,
                                            event.target.checked
                                          )
                                        }
                                      />


                                      <span className="availability-switch" />


                                      <span>

                                        {item.isAvailable
                                          ? "Available"
                                          : "Unavailable"}

                                      </span>

                                    </label>

                                  </div>

                                </article>

                              )
                            )}

                          </div>

                        </section>

                      )
                    )}

                </div>

              )}

            </section>

          )}

        </main>

      </div>

    </div>

  );

};


export default Manager;