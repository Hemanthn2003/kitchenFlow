import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Header from "../components/Header.jsx";
import CurrentUser from "../components/CurrentUser.jsx";
import ManagerList from "../components/ManagerList.jsx";
import WaitersList from "../components/WaitersList.jsx";
import KitchenList from "../components/KitchenList.jsx";
import MenuItems from "../components/MenuItems.jsx";
import OrdersList from "../components/OrdersList.jsx";
import Icon from "../components/Icon.jsx";

import {
  formatTime,
  loadActiveUsers,
  loadOrders,
  loadMenuItems,
  updateOrderStatus,
  updateMenuAvailability,
  uploadDishImage,
  addDish,
  saveDishEdit,
  handleLogout,
  refreshCurrentPage,
} from "../components/managerFunctions.js";

import "./Manager.css";

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
}) => (
  <div className="stat-card">
    <div className="stat-top">
      <div className="stat-icon">
        <Icon name={icon} size={22} />
      </div>

      <span className="stat-live">
        LIVE
      </span>
    </div>

    <div className="stat-content">
      <strong>{value}</strong>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  </div>
);

// ============================================================
// MANAGER COMPONENT
// ============================================================

const Manager = () => {
  // ==========================================================
  // GENERAL STATE
  // ==========================================================

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [activePage, setActivePage] =
    useState("home");

  const [refreshing, setRefreshing] =
    useState(false);

  const [localError, setLocalError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  // ==========================================================
  // ORDERS STATE
  // ==========================================================

  const [ordersError, setOrdersError] =
    useState("");

  const [orderFilter, setOrderFilter] =
    useState("ALL");

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  // ==========================================================
  // MENU STATE
  // ==========================================================

  const [menuError, setMenuError] =
    useState("");

  const [showAddDish, setShowAddDish] =
    useState(false);

  const [addingDish, setAddingDish] =
    useState(false);

  const [updatingMenuId, setUpdatingMenuId] =
    useState(null);

  // ==========================================================
  // ADD DISH FORM
  // ==========================================================

  const [dishForm, setDishForm] = useState({
    name: "",
    category: "",
    price: "",
    imageUrl: "",
    isAvailable: true,
  });

  // ==========================================================
  // EDIT DISH STATE
  // ==========================================================

  const [editingDish, setEditingDish] =
    useState(null);

  const [editDishForm, setEditDishForm] =
    useState({
      name: "",
      category: "",
      price: "",
      imageUrl: "",
      isAvailable: true,
    });

  const [savingDish, setSavingDish] =
    useState(false);

  // ==========================================================
  // IMAGE UPLOAD STATE
  // ==========================================================

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [
    uploadingEditImage,
    setUploadingEditImage,
  ] = useState(false);

  const [
    imageUploadError,
    setImageUploadError,
  ] = useState("");

  // ==========================================================
  // INITIAL USERS LOAD REFERENCE
  // ==========================================================

  const initialUsersLoadRef =
    useRef(false);

  // ==========================================================
  // REDUX
  // ==========================================================

  const dispatch = useDispatch();

  const {
    users,
    orders,
    menuItems,
    loading: reduxLoading,
    errors,
    lastFetched,
  } = useSelector(
    (state) => state.kitchen
  );

  // ==========================================================
  // ACTIVE MANAGER
  // ==========================================================

  const activeManager =
    Array.isArray(users?.manager)
      ? users.manager[0]
      : users?.manager;

  // ==========================================================
  // LOGGED-IN USER
  // ==========================================================

  let loggedInUser = null;

  try {
    loggedInUser = JSON.parse(
      localStorage.getItem("user") ||
        "null"
    );
  } catch {
    loggedInUser = null;
  }

  // ==========================================================
  // TEAM DATA
  // ==========================================================

  const manager = activeManager;

  const waiters = Array.isArray(
    users?.waiters
  )
    ? users.waiters
    : [];

  const kitchenStaff = Array.isArray(
    users?.kitchenStaff
  )
    ? users.kitchenStaff
    : [];

  const currentUser =
    manager || loggedInUser;

  // ==========================================================
  // LOADING STATES
  // ==========================================================

  const loading =
    reduxLoading?.users;

  const ordersLoading =
    reduxLoading?.orders;

  const menuLoading =
    reduxLoading?.menuItems;

  // ==========================================================
  // GENERAL ERROR
  // ==========================================================

  const error =
    localError ||
    errors?.users ||
    "";

  // ==========================================================
  // MENU CATEGORIES
  // ==========================================================

  const menuCategories =
    Array.from(
      new Set(
        (
          Array.isArray(menuItems)
            ? menuItems
            : []
        )
          .map((item) =>
            String(
              item.category || ""
            ).trim()
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b)
    );

  // ==========================================================
  // LOAD ACTIVE USERS ON FIRST LOAD
  // ==========================================================

  useEffect(() => {
    if (
      initialUsersLoadRef.current ||
      lastFetched?.users
    ) {
      return;
    }

    initialUsersLoadRef.current = true;

    loadActiveUsers({
      dispatch,
      force: false,
      setRefreshing,
      setLocalError,
      setLastUpdated,
    });
  }, [
    dispatch,
    lastFetched?.users,
  ]);

  // ==========================================================
  // LOAD ORDERS / MENU WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {
    if (
      activePage === "orders" &&
      !lastFetched?.orders
    ) {
      loadOrders({
        dispatch,
        force: false,
        setOrdersError,
      });
    }

    if (
      activePage === "menu" &&
      !lastFetched?.menuItems
    ) {
      loadMenuItems({
        dispatch,
        force: false,
        setMenuError,
      });
    }
  }, [
    dispatch,
    activePage,
    lastFetched?.orders,
    lastFetched?.menuItems,
  ]);

  // ==========================================================
  // OPEN EDIT DISH
  // ==========================================================

  const openEditDish = (item) => {
    setMenuError("");
    setImageUploadError("");

    setEditingDish(item);

    setEditDishForm({
      name: item?.name || "",

      category:
        item?.category || "",

      price: String(
        item?.price ?? ""
      ),

      imageUrl:
        item?.imageUrl || "",

      isAvailable:
        Boolean(item?.isAvailable),
    });
  };

  // ==========================================================
  // CLOSE EDIT DISH
  // ==========================================================

  const closeEditDish = () => {
    if (savingDish) {
      return;
    }

    setEditingDish(null);
    setImageUploadError("");
  };

  // ==========================================================
  // CHANGE PAGE
  // ==========================================================

  const changePage = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

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
          <span>Flow</span>
        </h2>

        <p>
          Loading manager dashboard...
        </p>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="manager-page">

      {/* ======================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}

      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
          }}
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`manager-sidebar ${
          menuOpen
            ? "sidebar-open"
            : ""
        }`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "275px",
          transform: menuOpen
            ? "translateX(0)"
            : "translateX(-105%)",
          zIndex: 1000,
          transition: "transform 0.28s ease",
        }}
        aria-hidden={!menuOpen}
      >

        {/* ====================================================
            SIDEBAR BRAND
        ==================================================== */}

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
              <span>FLOW</span>
            </h2>

            <p>
              MANAGER PANEL
            </p>
          </div>

          <button
            type="button"
            className="mobile-close"
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

        {/* ====================================================
            SIDEBAR NAVIGATION
        ==================================================== */}

        <div className="sidebar-section">

          <p className="sidebar-title">
            WORKSPACE
          </p>

          {/* HOME */}

          <button
            type="button"
            className={`sidebar-link ${
              activePage === "home"
                ? "active"
                : ""
            }`}
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

          {/* ORDERS */}

          <button
            type="button"
            className={`sidebar-link ${
              activePage === "orders"
                ? "active"
                : ""
            }`}
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

          {/* MENU */}

          <button
            type="button"
            className={`sidebar-link ${
              activePage === "menu"
                ? "active"
                : ""
            }`}
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

        {/* ====================================================
            SIDEBAR BOTTOM
        ==================================================== */}

        <div className="sidebar-bottom">

          <CurrentUser
            user={currentUser}
            role="Manager"
            variant="sidebar"
          />

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <Icon
              name="logout"
              size={17}
            />

            Logout
          </button>

        </div>

      </aside>

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <div className="manager-main">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <Header
          activePage={activePage}

          onMenuToggle={() =>
            setMenuOpen(
              (value) => !value
            )
          }

          onRefresh={() =>
            refreshCurrentPage({
              dispatch,
              activePage,
              setRefreshing,
              setLocalError,
              setLastUpdated,
              setOrdersError,
              setMenuError,
            })
          }

          refreshing={refreshing}

          user={currentUser}

          role="Manager"
        />

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <main className="manager-content">

          {/* ==================================================
              GENERAL ERROR
          ================================================== */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* ==================================================
              HOME PAGE
          ================================================== */}

          {activePage === "home" && (
            <>

              {/* ==============================================
                  HERO
              ============================================== */}

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
                    Monitor your active
                    team and keep track of
                    restaurant floor activity
                    from one place.
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

              {/* ==============================================
                  STATISTICS
              ============================================== */}

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
                  ).padStart(2, "0")}
                  subtitle="Front of House"
                />

                <StatCard
                  icon="chef"
                  title="Kitchen Staff"
                  value={String(
                    kitchenStaff.length
                  ).padStart(2, "0")}
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

              {/* ==============================================
                  MANAGER
              ============================================== */}

              <ManagerList
                manager={manager}
              />

              {/* ==============================================
                  WAITERS
              ============================================== */}

              <WaitersList
                waiters={waiters}
              />

              {/* ==============================================
                  KITCHEN STAFF
              ============================================== */}

              <KitchenList
                kitchenStaff={
                  kitchenStaff
                }
              />

              {/* ==============================================
                  FOOTER
              ============================================== */}

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

          {/* ==================================================
              ORDERS PAGE
          ================================================== */}

          {activePage === "orders" && (
            <OrdersList
              orders={orders}
              loading={ordersLoading}
              error={ordersError}
              filter={orderFilter}

              onFilterChange={
                setOrderFilter
              }

              onRefresh={() =>
                loadOrders({
                  dispatch,
                  force: true,
                  setOrdersError,
                })
              }

              onStatusChange={(
                orderId,
                status
              ) =>
                updateOrderStatus({
                  dispatch,
                  orderId,
                  status,
                  setUpdatingOrderId,
                  setOrdersError,
                })
              }

              updatingOrderId={
                updatingOrderId
              }
            />
          )}

          {/* ==================================================
              MENU PAGE
          ================================================== */}

          {activePage === "menu" && (
            <>

              <MenuItems
                menuItems={
                  menuItems
                }

                loading={
                  menuLoading
                }

                onRefresh={() =>
                  loadMenuItems({
                    dispatch,
                    force: true,
                    setMenuError,
                  })
                }

                onAdd={() => {
                  setMenuError("");
                  setImageUploadError("");

                  setDishForm({
                    name: "",
                    category: "",
                    price: "",
                    imageUrl: "",
                    isAvailable: true,
                  });

                  setShowAddDish(true);
                }}

                onEdit={
                  openEditDish
                }

                onToggleAvailability={(
                  itemId,
                  isAvailable
                ) =>
                  updateMenuAvailability({
                    dispatch,
                    itemId,
                    isAvailable,
                    setUpdatingMenuId,
                    setMenuError,
                  })
                }

                updatingMenuId={
                  updatingMenuId
                }
              />

              {/* ==============================================
                  MENU ERROR
              ============================================== */}

              {menuError && (
                <div className="error-message">
                  {menuError}
                </div>
              )}

              {/* ==============================================
                  ADD DISH MODAL
              ============================================== */}

              {showAddDish && (
                <div className="dish-modal-backdrop">

                  <div className="dish-modal">

                    {/* ========================================
                        MODAL HEADER
                    ======================================== */}

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
                            addingDish ||
                            uploadingImage
                          ) {
                            return;
                          }

                          setShowAddDish(false);
                          setImageUploadError("");
                        }}
                      >
                        ×
                      </button>

                    </div>

                    {/* ========================================
                        ADD FORM
                    ======================================== */}

                    <form
                      onSubmit={(event) =>
                        addDish({
                          event,
                          dispatch,
                          dishForm,
                          uploadingImage,
                          setAddingDish,
                          setMenuError,
                          setDishForm,
                          setShowAddDish,
                        })
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
                              (current) => ({
                                ...current,
                                name:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                          placeholder="e.g. Veg Biryani"
                        />
                      </label>

                      {/* CATEGORY */}

                      <label>
                        Category

                        <select
                          value={
                            dishForm.category
                          }
                          onChange={(
                            event
                          ) =>
                            setDishForm(
                              (current) => ({
                                ...current,
                                category:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                        >

                          <option value="">
                            Select existing category
                          </option>

                          {menuCategories.map(
                            (
                              category
                            ) => (
                              <option
                                key={
                                  category
                                }
                                value={
                                  category
                                }
                              >
                                {category}
                              </option>
                            )
                          )}

                        </select>
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
                              (current) => ({
                                ...current,
                                price:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                          placeholder="220"
                        />
                      </label>

                      {/* IMAGE */}

                      <label>
                        Dish Image

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={(
                            event
                          ) =>
                            uploadDishImage({
                              event,
                              mode: "add",
                              setDishForm,
                              setEditDishForm,
                              setUploadingImage,
                              setUploadingEditImage,
                              setImageUploadError,
                            })
                          }
                          disabled={
                            uploadingImage ||
                            addingDish
                          }
                        />

                        <small>
                          Choose an image to upload
                          directly to Cloudinary
                          (max 5 MB).
                        </small>
                      </label>

                      {/* IMAGE ERROR */}

                      {imageUploadError && (
                        <div className="error-message">
                          {
                            imageUploadError
                          }
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

                        </div>
                      )}

                      {/* AVAILABILITY */}

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
                              (current) => ({
                                ...current,
                                isAvailable:
                                  event
                                    .target
                                    .checked,
                              })
                            )
                          }
                        />

                        Available immediately

                      </label>

                      {/* BUTTONS */}

                      <div className="dish-modal-actions">

                        <button
                          type="button"
                          className="modal-cancel-button"
                          onClick={() => {
                            if (
                              addingDish ||
                              uploadingImage
                            ) {
                              return;
                            }

                            setShowAddDish(false);
                            setImageUploadError("");
                          }}
                          disabled={
                            addingDish ||
                            uploadingImage
                          }
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

              {/* ==============================================
                  EDIT DISH MODAL
              ============================================== */}

              {editingDish && (
                <div className="dish-modal-backdrop">

                  <div className="dish-modal">

                    {/* ========================================
                        EDIT MODAL HEADER
                    ======================================== */}

                    <div className="dish-modal-header">

                      <div>

                        <span className="page-kicker">
                          MENU MANAGEMENT
                        </span>

                        <h3>
                          Edit Menu Item
                        </h3>

                      </div>

                      <button
                        type="button"
                        className="modal-close-button"
                        onClick={
                          closeEditDish
                        }
                        disabled={
                          savingDish
                        }
                      >
                        ×
                      </button>

                    </div>

                    {/* ========================================
                        EDIT FORM
                    ======================================== */}

                    <form
                      onSubmit={(event) =>
                        saveDishEdit({
                          event,
                          dispatch,
                          editingDish,
                          editDishForm,
                          uploadingEditImage,
                          setSavingDish,
                          setMenuError,
                          setEditingDish,
                          setImageUploadError,
                        })
                      }
                    >

                      {/* DISH NAME */}

                      <label>
                        Dish Name

                        <input
                          type="text"
                          value={
                            editDishForm.name
                          }
                          onChange={(
                            event
                          ) =>
                            setEditDishForm(
                              (current) => ({
                                ...current,
                                name:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                        />
                      </label>

                      {/* CATEGORY */}

                      <label>
                        Category

                        <select
                          value={
                            editDishForm.category
                          }
                          onChange={(
                            event
                          ) =>
                            setEditDishForm(
                              (current) => ({
                                ...current,
                                category:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                        >

                          <option value="">
                            Select category
                          </option>

                          {menuCategories.map(
                            (
                              category
                            ) => (
                              <option
                                key={
                                  category
                                }
                                value={
                                  category
                                }
                              >
                                {category}
                              </option>
                            )
                          )}

                        </select>
                      </label>

                      {/* PRICE */}

                      <label>
                        Price

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            editDishForm.price
                          }
                          onChange={(
                            event
                          ) =>
                            setEditDishForm(
                              (current) => ({
                                ...current,
                                price:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                        />
                      </label>

                      {/* REPLACE IMAGE */}

                      <label>
                        Replace Dish Image

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={(
                            event
                          ) =>
                            uploadDishImage({
                              event,
                              mode: "edit",
                              setDishForm,
                              setEditDishForm,
                              setUploadingImage,
                              setUploadingEditImage,
                              setImageUploadError,
                            })
                          }
                          disabled={
                            uploadingEditImage ||
                            savingDish
                          }
                        />

                        <small>
                          Browse a new image and it
                          will replace the current
                          Cloudinary image after saving.
                        </small>
                      </label>

                      {/* IMAGE PREVIEW */}

                      {editDishForm.imageUrl && (
                        <div className="dish-image-preview">

                          <img
                            src={
                              editDishForm.imageUrl
                            }
                            alt="Dish preview"
                          />

                        </div>
                      )}

                      {/* AVAILABILITY */}

                      <label className="availability-checkbox-label">

                        <input
                          type="checkbox"
                          checked={
                            editDishForm.isAvailable
                          }
                          onChange={(
                            event
                          ) =>
                            setEditDishForm(
                              (current) => ({
                                ...current,
                                isAvailable:
                                  event
                                    .target
                                    .checked,
                              })
                            )
                          }
                        />

                        Available for ordering

                      </label>

                      {/* IMAGE ERROR */}

                      {imageUploadError && (
                        <div className="error-message">
                          {
                            imageUploadError
                          }
                        </div>
                      )}

                      {/* BUTTONS */}

                      <div className="dish-modal-actions">

                        <button
                          type="button"
                          className="modal-cancel-button"
                          onClick={
                            closeEditDish
                          }
                          disabled={
                            savingDish
                          }
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="modal-submit-button"
                          disabled={
                            savingDish ||
                            uploadingEditImage
                          }
                        >
                          {savingDish
                            ? "Saving..."
                            : uploadingEditImage
                              ? "Uploading Image..."
                              : "Save Changes"}
                        </button>

                      </div>

                    </form>

                  </div>

                </div>
              )}

            </>
          )}

        </main>

      </div>

    </div>
  );
};

export default Manager;