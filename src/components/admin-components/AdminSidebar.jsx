import React from "react";
import Icon from "../Icon.jsx";

const AdminSidebar = ({
  open = false,
  activePage = "home",
  onClose,
  onNavigate,
  onLogout,
}) => {
  const handleNavigate = (page) => {
    onNavigate?.(page);
    onClose?.();
  };

  return (
    <>
      {open && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`admin-sidebar ${
          open ? "admin-sidebar-open" : ""
        }`}
      >

        {/* =================================================
            BRAND
            ================================================= */}

        <div className="admin-sidebar-brand">

          <div className="admin-brand-mark">
            <Icon
              name="chef"
              size={24}
            />
          </div>

          <div>
            <strong>
              KitchenFlow
            </strong>

            <span>
              ADMIN PANEL
            </span>
          </div>

        </div>


        {/* =================================================
            NAVIGATION
            ================================================= */}

        <nav className="admin-sidebar-nav">

          {/* =================================================
              DASHBOARD
              ================================================= */}

          <button
            type="button"
            className={
              activePage === "home"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleNavigate("home")
            }
          >
            <Icon
              name="activity"
              size={18}
            />

            <span>
              Dashboard
            </span>
          </button>


          {/* =================================================
              MANAGEMENT
              ================================================= */}

          <div className="admin-nav-label">
            MANAGEMENT
          </div>


          {/* EMPLOYEES */}

          <button
            type="button"
            className={
              activePage === "users"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleNavigate("users")
            }
          >
            <Icon
              name="users"
              size={18}
            />

            <span>
              Employees
            </span>
          </button>


          {/* MENU ITEMS */}

          <button
            type="button"
            className={
              activePage === "menu"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleNavigate("menu")
            }
          >
            <Icon
              name="menuItems"
              size={18}
            />

            <span>
              Menu Items
            </span>
          </button>


          {/* =================================================
              ANALYTICS
              ================================================= */}

          <div className="admin-nav-label">
            ANALYTICS
          </div>


          {/* ANALYTICS */}

          <button
            type="button"
            className={
              activePage === "analytics"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleNavigate("analytics")
            }
          >
            <Icon
              name="activity"
              size={18}
            />

            <span>
              Analytics
            </span>
          </button>


          {/* TABLE PERFORMANCE */}

          <button
            type="button"
            className={
              activePage === "table-performance"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleNavigate(
                "table-performance"
              )
            }
          >
            <Icon
              name="table"
              size={18}
            />

            <span>
              Table Performance
            </span>
          </button>


          {/* =================================================
              REPORTS
              ================================================= */}

          <div className="admin-nav-label">
            REPORTS
          </div>


          {/* BILLS */}

          <button
            type="button"
            className={
              activePage === "bills"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleNavigate("bills")
            }
          >
            <Icon
              name="receipt"
              size={18}
            />

            <span>
              Bills
            </span>
          </button>

        </nav>


        {/* =================================================
            BOTTOM
            ================================================= */}

        <div className="admin-sidebar-bottom">

          <button
            type="button"
            className="admin-nav-item admin-logout-item"
            onClick={onLogout}
          >
            <Icon
              name="logout"
              size={18}
            />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>
    </>
  );
};

export default AdminSidebar;