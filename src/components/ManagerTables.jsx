import React from "react";
import Icon from "./Icon.jsx";

const ManagerTables = ({
  tables = [],
  tableStats = {},
  loading = false,
  error = "",
  onRefresh,
}) => {
  const safeTables = Array.isArray(tables)
    ? tables
    : [];

  const total =
    Number(tableStats?.total) ||
    safeTables.length;

  const free =
    Number(tableStats?.free) ||
    safeTables.filter(
      (table) =>
        String(table?.status || "")
          .trim()
          .toUpperCase() === "AVAILABLE"
    ).length;

  const occupied =
    Number(tableStats?.occupied) ||
    safeTables.filter(
      (table) =>
        String(table?.status || "")
          .trim()
          .toUpperCase() !== "AVAILABLE"
    ).length;

  const getStatus = (table) => {
    const status = String(
      table?.status || "AVAILABLE"
    )
      .trim()
      .toUpperCase();

    if (status === "AVAILABLE") {
      return "AVAILABLE";
    }

    if (status === "BILL_REQUESTED") {
      return "BILL REQUESTED";
    }

    if (status === "OCCUPIED") {
      return "OCCUPIED";
    }

    return status.replaceAll("_", " ");
  };

  const getStatusClass = (table) => {
    const status = String(
      table?.status || "AVAILABLE"
    )
      .trim()
      .toUpperCase();

    if (status === "AVAILABLE") {
      return "available";
    }

    if (status === "BILL_REQUESTED") {
      return "bill-requested";
    }

    return "occupied";
  };

  const getWaiterName = (table) => {
    return (
      table?.waiterId?.name ||
      table?.waiter?.name ||
      table?.assignedWaiter?.name ||
      table?.waiterName ||
      "Not assigned"
    );
  };

  const getTableNumber = (table, index) => {
    return (
      table?.tableNumber ??
      table?.number ??
      index + 1
    );
  };

  return (
    <section className="manager-tables-page">

      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <div className="manager-page-header">

        <div>
          <span className="page-kicker">
            RESTAURANT FLOOR
          </span>

          <h2>
            Tables
          </h2>

          <p>
            View the current status and
            waiter assignment of every table.
          </p>
        </div>

        <button
          type="button"
          className="manager-refresh-button"
          onClick={onRefresh}
          disabled={loading}
        >
          <Icon
            name="refresh"
            size={17}
          />

          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* ====================================================
          TABLE SUMMARY
      ==================================================== */}

      <div className="manager-table-stats">

        <div className="manager-table-stat-card">

          <div className="manager-table-stat-icon">
            <Icon
              name="table"
              size={20}
            />
          </div>

          <div>
            <strong>
              {String(total).padStart(2, "0")}
            </strong>

            <span>
              Total Tables
            </span>
          </div>

        </div>


        <div className="manager-table-stat-card">

          <div className="manager-table-stat-icon">
            <Icon
              name="check"
              size={20}
            />
          </div>

          <div>
            <strong>
              {String(free).padStart(2, "0")}
            </strong>

            <span>
              Available
            </span>
          </div>

        </div>


        <div className="manager-table-stat-card">

          <div className="manager-table-stat-icon">
            <Icon
              name="orders"
              size={20}
            />
          </div>

          <div>
            <strong>
              {String(occupied).padStart(2, "0")}
            </strong>

            <span>
              Occupied
            </span>
          </div>

        </div>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* ====================================================
          LOADING
      ==================================================== */}

      {loading && safeTables.length === 0 ? (
        <div className="manager-tables-loading">

          <div className="manager-tables-loading-icon">
            <Icon
              name="refresh"
              size={25}
            />
          </div>

          <h3>
            Loading tables...
          </h3>

          <p>
            Getting the latest restaurant
            floor information.
          </p>

        </div>
      ) : safeTables.length === 0 ? (

        <div className="manager-tables-empty">

          <div className="manager-tables-empty-icon">
            <Icon
              name="table"
              size={28}
            />
          </div>

          <h3>
            No tables found
          </h3>

          <p>
            There are currently no tables
            available to display.
          </p>

        </div>

      ) : (

        /* ==================================================
            TABLE GRID
        ================================================== */

        <div className="manager-table-grid">

          {safeTables.map(
            (table, index) => {

              const status =
                getStatus(table);

              const statusClass =
                getStatusClass(table);

              const tableNumber =
                getTableNumber(
                  table,
                  index
                );

              const waiterName =
                getWaiterName(table);

              return (
                <article
                  key={
                    table?._id ||
                    table?.id ||
                    `table-${tableNumber}`
                  }
                  className={`manager-table-card ${statusClass}`}
                >

                  {/* ========================================
                      TABLE TOP
                  ======================================== */}

                  <div className="manager-table-card-top">

                    <div className="manager-table-number">

                      <span>
                        TABLE
                      </span>

                      <strong>
                        {tableNumber}
                      </strong>

                    </div>

                    <span
                      className={`manager-table-status ${statusClass}`}
                    >
                      <span className="manager-status-dot" />

                      {status}
                    </span>

                  </div>


                  {/* ========================================
                      TABLE VISUAL
                  ======================================== */}

                  <div className="manager-table-visual">

                    <div className="manager-table-icon-wrap">
                      <Icon
                        name="table"
                        size={38}
                      />
                    </div>

                    <div className="manager-table-visual-ring" />

                  </div>


                  {/* ========================================
                      TABLE INFORMATION
                  ======================================== */}

                  <div className="manager-table-info">

                    <div className="manager-table-info-row">

                      <span>
                        <Icon
                          name="user"
                          size={15}
                        />

                        Waiter
                      </span>

                      <strong>
                        {waiterName}
                      </strong>

                    </div>


                    <div className="manager-table-info-row">

                      <span>
                        <Icon
                          name="activity"
                          size={15}
                        />

                        Status
                      </span>

                      <strong>
                        {status}
                      </strong>

                    </div>

                  </div>


                  {/* ========================================
                      MANAGER VIEW NOTE
                  ======================================== */}

                  <div className="manager-table-manager-note">

                    <Icon
                      name="users"
                      size={14}
                    />

                    <span>
                      Manager view
                    </span>

                  </div>

                </article>
              );
            }
          )}

        </div>
      )}

    </section>
  );
};

export default ManagerTables;