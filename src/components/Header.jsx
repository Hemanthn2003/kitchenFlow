import React from "react";
import Icon from "./Icon.jsx";
import CurrentUser from "./CurrentUser.jsx";

const Header = ({
  activePage = "home",
  onMenuToggle,
  onRefresh,
  refreshing = false,
  user,
  role = "Manager",
}) => {
  const normalizedRole = String(role || "Manager")
    .trim()
    .toUpperCase();

  const isAdmin = normalizedRole === "ADMIN";
  const isWaiter = normalizedRole === "WAITER";
  const isKitchen = normalizedRole === "KITCHEN";

  /* =========================================================
     PAGE TITLE
     ========================================================= */

  let pageTitle = "Overview";

  if (isAdmin) {
    const adminPageTitles = {
      home: "Overview",
      users: "Employees",
      analytics: "Analytics",
      "table-performance": "Table Performance",
      bills: "Bills",
      settings: "Settings",
      "popular-dishes": "Popular Dishes",
    };

    pageTitle =
      adminPageTitles[activePage] ||
      "Overview";
  } else if (isKitchen) {
    pageTitle =
      activePage === "orders"
        ? "Orders"
        : "Orders";
  } else if (isWaiter) {
    pageTitle =
      activePage === "tables"
        ? "Tables"
        : activePage === "picked"
          ? "Your Tables"
          : activePage === "bills"
            ? "Bills"
            : activePage === "my-orders"
              ? "My Orders"
              : "Waiter";
  } else {
    pageTitle =
      activePage === "home"
        ? "Overview"
        : activePage === "orders"
          ? "Orders"
          : activePage === "menu"
            ? "Menu Items"
            : activePage === "tables"
              ? "Tables"
              : activePage === "bills"
                ? "Bills"
                : activePage;
  }

  /* =========================================================
     DASHBOARD LABEL
     ========================================================= */

  const dashboardLabel = isAdmin
    ? "ADMIN DASHBOARD"
    : isKitchen
      ? "KITCHEN DASHBOARD"
      : isWaiter
        ? "WAITER DASHBOARD"
        : "MANAGER DASHBOARD";

  /* =========================================================
     CURRENT USER ROLE
     ========================================================= */

  const currentUserRole = isAdmin
    ? "Admin"
    : isKitchen
      ? "Kitchen"
      : isWaiter
        ? "Waiter"
        : "Manager";

  return (
    <header className="manager-header">

      {/* =====================================================
          LEFT SIDE
          ===================================================== */}

      <div className="header-left">

        <button
          type="button"
          className="menu-button"
          onClick={onMenuToggle}
          aria-label="Open navigation"
        >
          <Icon
            name="menu"
            size={21}
          />
        </button>

        <div className="header-heading">

          <span>
            {dashboardLabel}
          </span>

          <h1>
            {pageTitle}
          </h1>

        </div>

      </div>

      {/* =====================================================
          RIGHT SIDE
          ===================================================== */}

      <div className="header-right">

        <button
          type="button"
          className="refresh-button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh dashboard"
          title="Refresh dashboard"
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

        <CurrentUser
          user={user}
          role={currentUserRole}
          variant="header"
        />

      </div>

    </header>
  );
};

export default Header;