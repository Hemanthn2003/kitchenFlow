import React from "react";
import CurrentUser from "./CurrentUser.jsx";
import Icon from "./Icon.jsx";

const WaiterSidebar = ({
  open,
  activePage,
  setActivePage,
  user,
  onClose,
  onLogout,
}) => {
  const changePage = (page) => {
    setActivePage(page);
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`manager-sidebar waiter-sidebar ${
          open ? "sidebar-open" : ""
        }`}
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
              <span>FLOW</span>
            </h2>

            <p>WAITER PANEL</p>
          </div>

          <button
            type="button"
            className="mobile-close"
            onClick={onClose}
          >
            <Icon
              name="close"
              size={18}
            />
          </button>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-title">
            WORKSPACE
          </p>

          <button
            type="button"
            className={`sidebar-link ${
              activePage === "tables"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changePage("tables")
            }
          >
            <Icon
              name="table"
              size={18}
            />

            <span>Tables</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${
              activePage === "picked"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changePage("picked")
            }
          >
            <Icon
              name="orders"
              size={18}
            />

            <span>
              Picked Tables
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${
              activePage === "bills"
                ? "active"
                : ""
            }`}
            onClick={() =>
              changePage("bills")
            }
          >
            <Icon
              name="orders"
              size={18}
            />

            <span>Bills</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <CurrentUser
            user={user}
            role="Waiter"
            variant="sidebar"
          />

          <button
            type="button"
            className="logout-button"
            onClick={onLogout}
          >
            <Icon
              name="logout"
              size={17}
            />

            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default WaiterSidebar;