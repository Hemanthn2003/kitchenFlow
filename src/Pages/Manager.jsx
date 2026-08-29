import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchActiveUsers,
  fetchOrders,
  fetchMenuItems,
  addMenuItem,
  updateMenuAvailabilityLocal,
  updateOrder,
} from "../store/kitchenStore.js";

import "./Manager.css";


/* =========================================================
   API
   ========================================================= */

const API_URL =
  "http://localhost:5000";

const CLOUDINARY_CLOUD_NAME = "g0silssv";
const CLOUDINARY_UPLOAD_PRESET = "pizzaDemo";
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
        <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />
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

    return new Date(date).toLocaleTimeString(
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
   MANAGER PAGE
   ========================================================= */

const Manager = () => {

  /* =======================================================
     STATE
     ======================================================= */

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [activePage, setActivePage] =
    useState("home");

  const dispatch = useDispatch();

  const {
    users,
    orders,
    menuItems,
    loading: reduxLoading,
    errors,
    lastFetched,
  } = useSelector((state) => state.kitchen);

  /* =======================================================
     ACTIVE MANAGER / PROFILE IMAGE
     ======================================================= */

  const activeManager = Array.isArray(users?.manager)
    ? users.manager[0]
    : users?.manager;

  let loggedInUser = null;

  try {
    loggedInUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    loggedInUser = null;
  }

  const managerImage =
    activeManager?.imageUrl ||
    activeManager?.profileImage ||
    loggedInUser?.imageUrl ||
    loggedInUser?.profileImage ||
    "";

  const managerName =
    activeManager?.name ||
    loggedInUser?.name ||
    "Manager";

  const manager = activeManager;
  const waiters = Array.isArray(users?.waiters)
    ? users.waiters
    : [];
  const kitchenStaff = Array.isArray(users?.kitchenStaff)
    ? users.kitchenStaff
    : [];

  const loading = reduxLoading.users;
  const ordersLoading = reduxLoading.orders;
  const menuLoading = reduxLoading.menuItems;

  const [refreshing, setRefreshing] =
    useState(false);

  const [localError, setLocalError] =
    useState("");

  const error =
    localError ||
    errors.users ||
    "";

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [ordersError, setOrdersError] =
    useState("");

  const [menuError, setMenuError] =
    useState("");

  const [orderFilter, setOrderFilter] =
    useState("ALL");

  const [showAddDish, setShowAddDish] =
    useState(false);

  const [addingDish, setAddingDish] =
    useState(false);

  const [updatingMenuId, setUpdatingMenuId] =
    useState(null);

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  const [dishForm, setDishForm] =
    useState({
      name: "",
      category: "",
      price: "",
      imageUrl: "",
      isAvailable: true,
    });


  const [editingDish, setEditingDish] = useState(null);
  const [editDishForm, setEditDishForm] = useState({
    name: "", category: "", price: "", imageUrl: "", isAvailable: true,
  });
  const [savingDish, setSavingDish] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const initialUsersLoadRef = useRef(false);

  const menuCategories = Array.from(
    new Set(
      (Array.isArray(menuItems) ? menuItems : [])
        .map((item) => String(item.category || "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  /* =======================================================
     REDUX DATA LOADERS
     ======================================================= */

  const loadActiveUsers = async (force = false) => {
    try {
      setRefreshing(true);
      setLocalError("");

      await dispatch(
        fetchActiveUsers({ force })
      ).unwrap();

      setLastUpdated(new Date());
    } catch (err) {
      // Redux Toolkit can intentionally reject a duplicate request when
      // StrictMode mounts effects twice. That is not a real dashboard error.
      if (err?.name !== "ConditionError") {
        console.error("Manager dashboard error:", err);
        setLocalError(err?.message || err || "Unable to load dashboard");
      }
    } finally {
      setRefreshing(false);
    }
  };

  const loadOrders = async (force = false) => {
    try {
      setOrdersError("");
      await dispatch(
        fetchOrders({ force })
      ).unwrap();
    } catch (err) {
      console.error("Orders page error:", err);
      setOrdersError(
        err?.message ||
        err ||
        "Unable to load orders"
      );
    }
  };

  const loadMenuItems = async (force = false) => {
    try {
      setMenuError("");
      await dispatch(
        fetchMenuItems({ force })
      ).unwrap();
    } catch (err) {
      console.error("Menu page error:", err);
      setMenuError(
        err?.message ||
        err ||
        "Unable to load menu items"
      );
    }
  };


  /* =======================================================
     FIRST LOAD
     ======================================================= */

  useEffect(() => {
    if (initialUsersLoadRef.current || lastFetched.users) return;
    initialUsersLoadRef.current = true;
    loadActiveUsers(false);
  }, [lastFetched.users]);

  /* =======================================================
     LOAD PAGE DATA
     ======================================================= */

  useEffect(() => {
    if (activePage === "orders" && !lastFetched.orders) {
      loadOrders(false);
    }

    if (activePage === "menu" && !lastFetched.menuItems) {
      loadMenuItems(false);
    }
  }, [activePage, lastFetched.orders, lastFetched.menuItems]);


  /* =======================================================
     ORDER STATUS UPDATE
     ======================================================= */

  const updateOrderStatus = async (
    orderId,
    status
  ) => {
    try {
      setUpdatingOrderId(orderId);
      setOrdersError("");

      const response = await fetch(
        `${API_URL}/api/manager/orders/${orderId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to update order status"
        );
      }

      if (data.order) {
        dispatch(updateOrder(data.order));
      } else {
        await dispatch(
          fetchOrders({ force: true })
        ).unwrap();
      }
    } catch (err) {
      console.error("Order status update error:", err);
      setOrdersError(
        err.message ||
        "Unable to update order status"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };


  /* =======================================================
     MENU AVAILABILITY UPDATE
     ======================================================= */

  const updateMenuAvailability = async (
    itemId,
    isAvailable
  ) => {
    try {
      setUpdatingMenuId(itemId);
      setMenuError("");

      const response = await fetch(
        `${API_URL}/api/manager/menu-items/${itemId}/availability`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isAvailable }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to update availability"
        );
      }

      dispatch(
        updateMenuAvailabilityLocal({
          itemId,
          isAvailable:
            data.menuItem?.isAvailable ??
            isAvailable,
        })
      );
    } catch (err) {
      console.error("Menu availability error:", err);
      setMenuError(
        err.message ||
        "Unable to update availability"
      );
    } finally {
      setUpdatingMenuId(null);
    }
  };


  /* =======================================================
     CLOUDINARY IMAGE UPLOAD
     ======================================================= */

  const uploadImageToCloudinary = async (file) => {
    if (!file) return "";
    if (!file.type?.startsWith("image/")) {
      throw new Error("Please select a valid image file.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be smaller than 5 MB.");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "kitchenflow/menu");

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || !data.secure_url) {
      throw new Error(data?.error?.message || "Cloudinary image upload failed.");
    }
    return data.secure_url;
  };

  const uploadDishImage = async (event, mode = "add") => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageUploadError("");
    try {
      mode === "edit" ? setUploadingEditImage(true) : setUploadingImage(true);
      const imageUrl = await uploadImageToCloudinary(file);
      if (mode === "edit") {
        setEditDishForm((current) => ({ ...current, imageUrl }));
      } else {
        setDishForm((current) => ({ ...current, imageUrl }));
      }
    } catch (err) {
      setImageUploadError(err.message || "Unable to upload image.");
    } finally {
      mode === "edit" ? setUploadingEditImage(false) : setUploadingImage(false);
      event.target.value = "";
    }
  };

  const openEditDish = (item) => {
    setMenuError("");
    setImageUploadError("");
    setEditingDish(item);
    setEditDishForm({
      name: item.name || "",
      category: item.category || "",
      price: String(item.price ?? ""),
      imageUrl: item.imageUrl || "",
      isAvailable: Boolean(item.isAvailable),
    });
  };

  const closeEditDish = () => {
    if (savingDish) return;
    setEditingDish(null);
    setImageUploadError("");
  };

 const saveDishEdit = async (event) => {
  event.preventDefault();

  if (!editingDish?._id) {
    setMenuError("No menu item selected for editing.");
    return;
  }

  const name =
    String(editDishForm.name || "").trim();

  const category =
    String(editDishForm.category || "").trim();

  const imageUrl =
    String(editDishForm.imageUrl || "").trim();

  const price =
    Number(editDishForm.price);

  if (!name) {
    setMenuError(
      "Please enter a dish name."
    );
    return;
  }

  if (!category) {
    setMenuError(
      "Please select a category."
    );
    return;
  }

  if (
    editDishForm.price === "" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    setMenuError(
      "Please enter a valid price."
    );
    return;
  }

  if (uploadingEditImage) {
    setMenuError(
      "Please wait until the image upload is completed."
    );
    return;
  }

  try {
    setSavingDish(true);

    setMenuError("");

    const updatePayload = {
      name,
      category,
      price,
      imageUrl,
      isAvailable:
        Boolean(
          editDishForm.isAvailable
        ),
    };


    console.log(
      "Updating menu item:",
      editingDish._id
    );

    console.log(
      "Update payload:",
      updatePayload
    );


    const response =
      await fetch(
        `${API_URL}/api/manager/menu-items/${editingDish._id}`,
        {
          method: "PATCH",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              updatePayload
            ),
        }
      );


    const data =
      await response.json();


    console.log(
      "Menu update response:",
      data
    );


    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to update menu item"
      );
    }


    const updatedMenuItem =
      data?.menuItem ||
      data?.item;


    if (!updatedMenuItem?._id) {
      throw new Error(
        "Menu item was updated, but the server did not return the updated item."
      );
    }


    /*
      IMPORTANT:

      Update Redux immediately.

      Do not call fetchMenuItems again here.
      We already have the updated MongoDB document.
    */

  await dispatch(
  fetchMenuItems({
    force: true,
  })
).unwrap();


    setEditingDish(
      null
    );

    setImageUploadError(
      ""
    );


  } catch (err) {

    console.error(
      "Menu item update error:",
      err
    );

    setMenuError(
      err?.message ||
        "Unable to update menu item"
    );


  } finally {

    setSavingDish(
      false
    );

  }
};
  /* =======================================================
     ADD MENU ITEM
     ======================================================= */

  const addDish = async (event) => {
    event.preventDefault();

    if (!dishForm.name.trim()) {
      setMenuError("Enter dish name");
      return;
    }

    if (!dishForm.category.trim()) {
      setMenuError("Enter dish category");
      return;
    }

    if (
      dishForm.price === "" ||
      Number.isNaN(Number(dishForm.price)) ||
      Number(dishForm.price) < 0
    ) {
      setMenuError("Enter a valid price");
      return;
    }

    if (uploadingImage) {
      setMenuError("Please wait until the image upload finishes.");
      return;
    }

    try {
      setAddingDish(true);
      setMenuError("");

      const response = await fetch(
        `${API_URL}/api/manager/menu-items`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: dishForm.name.trim(),
            category: dishForm.category.trim(),
            price: Number(dishForm.price),
            imageUrl: dishForm.imageUrl.trim(),
            isAvailable:
              dishForm.isAvailable,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to add menu item"
        );
      }

      if (data.menuItem) {
        dispatch(
          addMenuItem(data.menuItem)
        );
      }

      setDishForm({
        name: "",
        category: "",
        price: "",
        imageUrl: "",
        isAvailable: true,
      });

      setShowAddDish(false);

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
      setAddingDish(false);
    }
  };


  /* =======================================================
     NAVIGATION
     ======================================================= */

  const changePage = (page) => {

    setActivePage(page);

    setMenuOpen(false);

  };


  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout = async () => {

    try {

      await fetch(
        `${API_URL}/api/auth/logout`,
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

      window.location.href =
        "/";

    }

  };


  /* =======================================================
     EMPLOYEE CARD
     ======================================================= */

  const EmployeeCard = ({
    employee,
    type,
  }) => {

    const isWaiter =
      type === "waiter";


    /*
      Use the value returned by the latest API response.
      Only null, undefined and "" mean FREE.
    */
    const currentTable =
      employee.currentTable !== null &&
      employee.currentTable !== undefined &&
      employee.currentTable !== ""
        ? employee.currentTable
        : null;


    return (

      <div
        className="
          employee-card
        "
      >

        {/* CARD TOP */}

        <div
          className="
            employee-card-top
          "
        >

          <div
            className="
              employee-avatar
            "
          >

            {employee.imageUrl || employee.profileImage ? (

              <img
                src={
                  employee.imageUrl || employee.profileImage
                }
                alt={
                  employee.name
                }
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
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


          <div
            className="
              employee-main
            "
          >

            <div
              className="
                employee-name-row
              "
            >

              <h3>
                {employee.name}
              </h3>


              <span
                className="
                  verified-icon
                "
              >
                <Icon
                  name="check"
                  size={14}
                />
              </span>

            </div>


            <p
              className="
                employee-role
              "
            >
              {isWaiter
                ? "WAITER"
                : "KITCHEN STAFF"}
            </p>


            <p
              className="
                employee-email
              "
            >
              {employee.email}
            </p>

          </div>


          <div
            className="
              active-badge
            "
          >

            <span
              className="
                active-dot
              "
            />

            ACTIVE

          </div>

        </div>


        {/* CARD BOTTOM */}

        <div
          className="
            employee-footer
          "
        >

          <div
            className="
              status-information
            "
          >

            <div
              className="
                status-label
              "
            >

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


          <div
            className="
              last-active
            "
          >

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

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
  }) => (

    <div
      className="
        stat-card
      "
    >

      <div
        className="
          stat-top
        "
      >

        <div
          className="
            stat-icon
          "
        >

          <Icon
            name={icon}
            size={22}
          />

        </div>


        <span
          className="
            stat-live
          "
        >
          LIVE
        </span>

      </div>


      <div
        className="
          stat-content
        "
      >

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

      <div
        className="
          manager-loading
        "
      >

        <div
          className="
            loading-logo
          "
        >

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

    <div
      className="
        manager-page
      "
    >

      {/* ===================================================
          MOBILE OVERLAY
          =================================================== */}

      {menuOpen && (

        <div
          className="
            sidebar-overlay
          "
          onClick={() =>
            setMenuOpen(false)
          }
        />

      )}


      {/* ===================================================
          SIDEBAR
          =================================================== */}

      <aside
        className={`
          manager-sidebar
          ${menuOpen
            ? "sidebar-open"
            : ""}
        `}
      >

        {/* BRAND */}

        <div
          className="
            sidebar-brand
          "
        >

          <div
            className="
              brand-icon
            "
          >

            <Icon
              name="chef"
              size={24}
            />

          </div>


          <div
            className="
              brand-text
            "
          >

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
            className="
              mobile-close
            "
            onClick={() =>
              setMenuOpen(false)
            }
          >

            <Icon
              name="close"
              size={18}
            />

          </button>

        </div>


        {/* NAVIGATION */}

        <div
          className="
            sidebar-section
          "
        >

          <p
            className="
              sidebar-title
            "
          >
            WORKSPACE
          </p>


          <button
            className={`
              sidebar-link
              ${
                activePage === "home"
                  ? "active"
                  : ""
              }
            `}
            onClick={() =>
              changePage("home")
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
                activePage === "orders"
                  ? "active"
                  : ""
              }
            `}
            onClick={() =>
              changePage("orders")
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
                activePage === "menu"
                  ? "active"
                  : ""
              }
            `}
            onClick={() =>
              changePage("menu")
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

        <div
          className="
            sidebar-bottom
          "
        >

          {manager && (

            <div
              className="
                sidebar-user
              "
            >

              <div
                className="
                  sidebar-user-icon
                "
              >

                <Icon
                  name="user"
                  size={17}
                />

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
            className="
              logout-button
            "
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
          MAIN AREA
          =================================================== */}

      <div
        className="
          manager-main
        "
      >

        {/* =================================================
            TOP HEADER
            ================================================= */}

        <header
          className="
            manager-header
          "
        >

          <div
            className="
              header-left
            "
          >

            <button
              className="
                menu-button
              "
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


            <div
              className="
                header-heading
              "
            >

              <span>
                MANAGER DASHBOARD
              </span>


              <h1>

                {activePage === "home"
                  ? "Overview"
                  : activePage ===
                    "orders"
                  ? "Orders"
                  : "Menu Items"}

              </h1>

            </div>

          </div>


          <div
            className="
              header-right
            "
          >

            <button
              type="button"
              className="
                refresh-button
              "
              onClick={async () => {
                await loadActiveUsers(true);

                if (activePage === "orders") {
                  await loadOrders(true);
                }

                if (activePage === "menu") {
                  await loadMenuItems(true);
                }
              }}
              disabled={refreshing}
              aria-label="Refresh active users"
              title="Refresh active users"
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


            <div
              className="
                header-user
              "
            >

              <div
                className="
                  header-user-text
                "
              >

                <strong>
                  {managerName}
                </strong>

                <span>
                  MANAGER
                </span>

              </div>


              <div
                className="
                  header-user-avatar
                "
              >

                {managerImage ? (
                  <img
                    src={managerImage}
                    alt={managerName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
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

        <main
          className="
            manager-content
          "
        >

          {/* ERROR */}

          {error && (

            <div
              className="
                error-message
              "
            >

              {error}

            </div>

          )}


          {/* =================================================
              HOME
              ================================================= */}

          {activePage === "home" && (

            <>

              {/* HERO */}

              <section
                className="
                  dashboard-hero
                "
              >

                <div
                  className="
                    hero-glow
                  "
                />


                <div
                  className="
                    hero-content
                  "
                >

                  <div
                    className="
                      hero-label
                    "
                  >

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


                <div
                  className="
                    restaurant-status
                  "
                >

                  <span
                    className="
                      live-pulse
                    "
                  />

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

              <section
                className="
                  stats-grid
                "
              >

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

              <section
                className="
                  dashboard-section
                "
              >

                <div
                  className="
                    section-heading
                  "
                >

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

                  <div
                    className="
                      manager-card
                    "
                  >

                    <div
                      className="
                        manager-card-avatar
                      "
                    >

                      {managerImage ? (
                        <img
                          src={managerImage}
                          alt={managerName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Icon
                          name="user"
                          size={36}
                        />
                      )}

                    </div>


                    <div
                      className="
                        manager-card-info
                      "
                    >

                      <div
                        className="
                          manager-name-line
                        "
                      >

                        <h3>
                          {manager.name}
                        </h3>


                        <span
                          className="
                            online-pill
                          "
                        >
                          <i />
                          ONLINE
                        </span>

                      </div>


                      <span
                        className="
                          gold-role
                        "
                      >
                        MANAGER
                      </span>


                      <p>
                        {manager.email}
                      </p>

                    </div>


                    <div
                      className="
                        manager-activity
                      "
                    >

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

                  <div
                    className="
                      empty-state
                    "
                  >
                    No active manager
                  </div>

                )}

              </section>


              {/* WAITERS */}

              <section
                className="
                  dashboard-section
                "
              >

                <div
                  className="
                    section-heading
                  "
                >

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


                  <div
                    className="
                      section-count
                    "
                  >

                    <i />

                    {waiters.length}
                    {" "}
                    ONLINE

                  </div>

                </div>


                {waiters.length > 0 ? (

                  <div
                    className="
                      employee-grid
                    "
                  >

                    {waiters.map(
                      (waiter) => (

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

                  <div
                    className="
                      empty-state
                    "
                  >
                    No active waiters
                  </div>

                )}

              </section>


              {/* KITCHEN */}

              <section
                className="
                  dashboard-section
                "
              >

                <div
                  className="
                    section-heading
                  "
                >

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


                  <div
                    className="
                      section-count
                    "
                  >

                    <i />

                    {kitchenStaff.length}
                    {" "}
                    ONLINE

                  </div>

                </div>


                {kitchenStaff.length > 0 ? (

                  <div
                    className="
                      employee-grid
                    "
                  >

                    {kitchenStaff.map(
                      (cook) => (

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

                  <div
                    className="
                      empty-state
                    "
                  >
                    No active kitchen staff
                  </div>

                )}

              </section>


              {/* FOOTER */}

              <footer
                className="
                  dashboard-footer
                "
              >

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

          {activePage === "orders" && (
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
                    Monitor every order, table, item,
                    instruction and current status.
                  </p>
                </div>

                <button
                  type="button"
                  className="page-refresh-button"
                  onClick={() => loadOrders(true)}
                  disabled={ordersLoading}
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
                ].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={
                      orderFilter === status
                        ? "order-filter active"
                        : "order-filter"
                    }
                    onClick={() =>
                      setOrderFilter(status)
                    }
                  >
                    {status}
                  </button>
                ))}
              </div>

              {ordersError && (
                <div className="error-message">
                  {ordersError}
                </div>
              )}

              {ordersLoading && orders.length === 0 ? (
                <div className="page-loading-state">
                  <Icon
                    name="refresh"
                    size={28}
                  />
                  <p>Loading orders...</p>
                </div>
              ) : (() => {
                const filteredOrders =
                  orders.filter((order) => {
                    if (orderFilter === "ALL") {
                      return true;
                    }

                    const status = String(
                      order.displayStatus ||
                        order.status ||
                        "NEW"
                    ).toUpperCase();

                    return status === orderFilter;
                  });

                if (filteredOrders.length === 0) {
                  return (
                    <div className="empty-state">
                      No orders found.
                    </div>
                  );
                }

                return (
                  <div className="orders-grid">
                    {filteredOrders.map((order) => {
                      const status = String(
                        order.displayStatus ||
                          order.status ||
                          "NEW"
                      ).toUpperCase();

                      const total =
                        Number(order.total) ||
                        (Array.isArray(order.items)
                          ? order.items.reduce(
                              (sum, item) =>
                                sum +
                                (Number(item.unitPrice) || 0) *
                                  (Number(item.quantity) || 1),
                              0
                            )
                          : 0);

                      return (
                        <article
                          key={order._id}
                          className="order-card"
                        >
                          <div className="order-card-header">
                            <div>
                              <span className="order-table-label">
                                TABLE
                              </span>
                              <h3>
                                {order.tableNumber !== null &&
                                order.tableNumber !== undefined
                                  ? `TABLE ${String(
                                      order.tableNumber
                                    ).padStart(2, "0")}`
                                  : "TABLE --"}
                              </h3>
                              <p>
                                Order #{String(order._id).slice(-4)}
                              </p>
                            </div>

                            <span
                              className={`order-status status-${status.toLowerCase()}`}
                            >
                              {status === "READY"
                                ? "COOKED"
                                : status}
                            </span>
                          </div>

                          <div className="order-meta-row">
                            <span>
                              {order.createdAt
                                ? new Date(
                                    order.createdAt
                                  ).toLocaleString([], {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "--"}
                            </span>

                            {order.createdByUser?.name && (
                              <span>
                                By {order.createdByUser.name}
                              </span>
                            )}
                          </div>

                          <div className="order-items-list">
                            {Array.isArray(order.items) &&
                              order.items.map((item, index) => (
                                <div
                                  className="order-item-row"
                                  key={`${order._id}-${index}`}
                                >
                                  <div className="order-item-image">
                                    {item.imageUrl ? (
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name || "Dish"}
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
                                        Qty {item.quantity || 1}
                                      </span>
                                      <span>
                                        ₹{Number(
                                          item.unitPrice || 0
                                        ).toFixed(0)}
                                      </span>
                                    </div>

                                    {item.instruction && (
                                      <p className="order-instruction">
                                        <strong>Note:</strong>{" "}
                                        {item.instruction}
                                      </p>
                                    )}
                                  </div>

                                  <strong className="order-item-total">
                                    ₹{(
                                      (Number(
                                        item.unitPrice
                                      ) || 0) *
                                      (Number(
                                        item.quantity
                                      ) || 1)
                                    ).toFixed(0)}
                                  </strong>
                                </div>
                              ))}
                          </div>

                          <div className="order-total-row">
                            <span>Total</span>
                            <strong>
                              ₹{total.toFixed(0)}
                            </strong>
                          </div>

                          <div className="order-status-controls">
                            {[
                              "ORDERED",
                              "PROCESSING",
                              "COOKED",
                              "SERVED",
                            ].map((nextStatus) => (
                              <button
                                key={nextStatus}
                                type="button"
                                className={
                                  status === nextStatus ||
                                  (nextStatus === "COOKED" &&
                                    status === "READY")
                                    ? "selected"
                                    : ""
                                }
                                disabled={
                                  updatingOrderId ===
                                    order._id ||
                                  status === nextStatus ||
                                  (nextStatus === "COOKED" &&
                                    status === "READY")
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
                            ))}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                );
              })()}
            </section>
          )}


          {/* =================================================
              MENU
              ================================================= */}

          {activePage === "menu" && (
            <section className="manager-page-section">

              <div className="page-toolbar">
                <div>
                  <span className="page-kicker">
                    RESTAURANT MENU
                  </span>
                  <h2 className="page-title">
                    Menu Items
                  </h2>
                  <p className="page-description">
                    Manage dishes, categories, prices,
                    images and availability.
                  </p>
                </div>

                <button
                  type="button"
                  className="add-dish-button"
                  onClick={() => {
                    setMenuError("");
                    setShowAddDish(true);
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

              {showAddDish && (
                <div className="dish-modal-backdrop">
                  <div className="dish-modal">
                    <div className="dish-modal-header">
                      <div>
                        <span className="page-kicker">
                          MENU MANAGEMENT
                        </span>
                        <h3>Add New Dish</h3>
                      </div>

                      <button
                        type="button"
                        className="modal-close-button"
                        onClick={() =>
                          setShowAddDish(false)
                        }
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={addDish}>
                      <label>
                        Dish Name
                        <input
                          type="text"
                          value={dishForm.name}
                          onChange={(event) =>
                            setDishForm((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          placeholder="e.g. Veg Biryani"
                        />
                      </label>

                      <label>
                        Category
                        <select
                          value={dishForm.category}
                          onChange={(event) => setDishForm((current) => ({ ...current, category: event.target.value }))}
                        >
                          <option value="">Select existing category</option>
                          {menuCategories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Price
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={dishForm.price}
                          onChange={(event) =>
                            setDishForm((current) => ({
                              ...current,
                              price: event.target.value,
                            }))
                          }
                          placeholder="220"
                        />
                      </label>

                      <label>
                        Dish Image
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={(event) => uploadDishImage(event, "add")}
                          disabled={uploadingImage || addingDish}
                        />
                        <small>Choose an image to upload directly to Cloudinary (max 5 MB).</small>
                      </label>

                      {imageUploadError && (
                        <div className="error-message">{imageUploadError}</div>
                      )}

                      {dishForm.imageUrl && (
                        <div className="dish-image-preview">
                          <img
                            src={dishForm.imageUrl}
                            alt="Dish preview"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        </div>
                      )}

                      <label className="availability-checkbox-label">
                        <input
                          type="checkbox"
                          checked={dishForm.isAvailable}
                          onChange={(event) =>
                            setDishForm((current) => ({
                              ...current,
                              isAvailable:
                                event.target.checked,
                            }))
                          }
                        />
                        Available immediately
                      </label>

                      <div className="dish-modal-actions">
                        <button
                          type="button"
                          className="modal-cancel-button"
                          onClick={() =>
                            setShowAddDish(false)
                          }
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="modal-submit-button"
                          disabled={addingDish || uploadingImage}
                        >
                          {addingDish
                            ? "Adding..."
                            : uploadingImage
                            ? "Uploading Image..."
                            : "Add Dish"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {editingDish && (
                <div className="dish-modal-backdrop">
                  <div className="dish-modal">
                    <div className="dish-modal-header">
                      <div>
                        <span className="page-kicker">MENU MANAGEMENT</span>
                        <h3>Edit Menu Item</h3>
                      </div>
                      <button type="button" className="modal-close-button" onClick={closeEditDish}>×</button>
                    </div>

                    <form onSubmit={saveDishEdit}>
                      <label>Dish Name
                        <input type="text" value={editDishForm.name}
                          onChange={(event) => setEditDishForm((current) => ({ ...current, name: event.target.value }))} />
                      </label>

                      <label>Category
                        <select value={editDishForm.category}
                          onChange={(event) => setEditDishForm((current) => ({ ...current, category: event.target.value }))}>
                          <option value="">Select category</option>
                          {menuCategories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </label>

                      <label>Price
                        <input type="number" min="0" step="0.01" value={editDishForm.price}
                          onChange={(event) => setEditDishForm((current) => ({ ...current, price: event.target.value }))} />
                      </label>

                      <label>Replace Dish Image
                        <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={(event) => uploadDishImage(event, "edit")}
                          disabled={uploadingEditImage || savingDish} />
                        <small>Browse a new image and it will replace the current Cloudinary image after saving.</small>
                      </label>

                      {editDishForm.imageUrl && (
                        <div className="dish-image-preview">
                          <img src={editDishForm.imageUrl} alt="Dish preview"
                            onError={(event) => { event.currentTarget.style.display = "none"; }} />
                        </div>
                      )}

                      <label className="availability-checkbox-label">
                        <input type="checkbox" checked={editDishForm.isAvailable}
                          onChange={(event) => setEditDishForm((current) => ({ ...current, isAvailable: event.target.checked }))} />
                        Available for ordering
                      </label>

                      {imageUploadError && <div className="error-message">{imageUploadError}</div>}

                      <div className="dish-modal-actions">
                        <button type="button" className="modal-cancel-button" onClick={closeEditDish} disabled={savingDish}>Cancel</button>
                        <button type="submit" className="modal-submit-button" disabled={savingDish || uploadingEditImage}>
                          {savingDish ? "Saving..." : uploadingEditImage ? "Uploading Image..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="menu-toolbar-row">
                <span>
                  {menuItems.length} menu items
                </span>

                <button
                  type="button"
                  className="page-refresh-button"
                  onClick={() => loadMenuItems(true)}
                  disabled={menuLoading}
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

              {menuLoading && menuItems.length === 0 ? (
                <div className="page-loading-state">
                  <Icon
                    name="refresh"
                    size={28}
                  />
                  <p>Loading menu...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="empty-state">
                  No menu items found.
                </div>
              ) : (
                <div className="menu-category-list">
                  {Object.entries(
                    menuItems.reduce(
                      (groups, item) => {
                        const category =
                          item.category ||
                          "Other";

                        if (!groups[category]) {
                          groups[category] = [];
                        }

                        groups[category].push(item);

                        return groups;
                      },
                      {}
                    )
                  )
                    .sort(([a], [b]) =>
                      a.localeCompare(b)
                    )
                    .map(([category, items]) => (
                      <section
                        key={category}
                        className="menu-category-section"
                      >
                        <div className="menu-category-heading">
                          <div>
                            <span>
                              CATEGORY
                            </span>
                            <h3>{category}</h3>
                          </div>
                          <strong>
                            {items.length}
                          </strong>
                        </div>

                        <div className="menu-items-grid">
                          {items.map((item) => (
                            <article
                              key={item._id}
                              className={
                                item.isAvailable
                                  ? "menu-item-card"
                                  : "menu-item-card unavailable"
                              }
                            >
                              <div className="menu-item-image">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    onError={(event) => {
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

                                  <strong>
                                    ₹{Number(
                                      item.price || 0
                                    ).toFixed(0)}
                                  </strong>
                                </div>

                                <button
                                  type="button"
                                  className="page-refresh-button"
                                  onClick={() => openEditDish(item)}
                                >
                                  <Icon name="edit" size={16} />
                                  Edit Item
                                </button>

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
                                    onChange={(event) =>
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
                          ))}
                        </div>
                      </section>
                    ))}
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