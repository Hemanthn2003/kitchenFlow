import React, { useEffect, useState } from "react";
import { loadTablePerformance } from "./AdminFunctions.js";

const AdminTablePerformance = () => {
  const [data, setData] = useState({
    tablesServedByWaiter: [],
    currentAssistance: {
      occupied: 0,
      available: 0,
      total: 0,
      tables: [],
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchPerformance = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await loadTablePerformance();

        if (!mounted) {
          return;
        }

        setData({
          tablesServedByWaiter: Array.isArray(
            response?.tablesServedByWaiter
          )
            ? response.tablesServedByWaiter
            : [],

          currentAssistance: {
            occupied: Number(
              response?.currentAssistance?.occupied || 0
            ),

            available: Number(
              response?.currentAssistance?.available || 0
            ),

            total: Number(
              response?.currentAssistance?.total || 0
            ),

            tables: Array.isArray(
              response?.currentAssistance?.tables
            )
              ? response.currentAssistance.tables
              : [],
          },
        });
      } catch (err) {
        console.error(
          "Admin table performance error:",
          err
        );

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load table performance analytics"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPerformance();

    return () => {
      mounted = false;
    };
  }, []);

  const waiterData =
    data.tablesServedByWaiter || [];

  const occupied = Number(
    data.currentAssistance?.occupied || 0
  );

  const available = Number(
    data.currentAssistance?.available || 0
  );

  const total = Number(
    data.currentAssistance?.total ||
      occupied + available
  );

  const maxTablesServed =
    waiterData.length > 0
      ? Math.max(
          ...waiterData.map((waiter) =>
            Number(waiter?.tablesServed || 0)
          )
        )
      : 0;

  const occupiedPercentage =
    total > 0
      ? (occupied / total) * 100
      : 0;

  const availablePercentage =
    total > 0
      ? (available / total) * 100
      : 0;

  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <section className="admin-table-performance">
        <div className="admin-section-loading">
          <div className="admin-loading-spinner"></div>

          <p>
            Loading table performance...
          </p>
        </div>
      </section>
    );
  }

  /* ==========================================================
     ERROR
     ========================================================== */

  if (error) {
    return (
      <section className="admin-table-performance">
        <div className="admin-section-error">
          <h3>
            Unable to load table performance
          </h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  /* ==========================================================
     MAIN PAGE
     ========================================================== */

  return (
    <section className="admin-table-performance">

      {/* PAGE HEADER */}

      <div className="admin-page-heading">
        <div>
          <h1>
            Table Performance
          </h1>

          <p>
            Monitor table service performance
            and current table assistance.
          </p>
        </div>
      </div>


      {/* PERFORMANCE GRID */}

      <div className="admin-performance-grid">

        {/* ====================================================
            TABLES SERVED BY WAITERS
           ==================================================== */}

        <div className="admin-performance-card admin-waiter-performance-card">

          <div className="admin-card-header">
            <div>
              <h2>
                Tables Served by Waiters
              </h2>

              <p>
                Number of completed table
                sessions handled by each waiter.
              </p>
            </div>
          </div>


          {waiterData.length === 0 ? (

            <div className="admin-empty-state">

              <div className="admin-empty-icon">
                ▥
              </div>

              <h3>
                No table service data
              </h3>

              <p>
                Paid bills will appear here after
                tables are completed.
              </p>

            </div>

          ) : (

            <div className="admin-waiter-bars">

              {waiterData.map(
                (waiter, index) => {

                  const served = Number(
                    waiter?.tablesServed || 0
                  );

                  const width =
                    maxTablesServed > 0
                      ? (served /
                          maxTablesServed) *
                        100
                      : 0;

                  const waiterName =
                    waiter?.waiterName ||
                    "Unknown Waiter";

                  const waiterEmail =
                    waiter?.email || "";

                  const waiterImage =
                    waiter?.imageUrl || "";

                  return (
                    <div
                      className="admin-waiter-bar-row"
                      key={
                        waiter?.waiterId ||
                        waiterEmail ||
                        `${waiterName}-${index}`
                      }
                    >

                      {/* WAITER */}

                      <div className="admin-waiter-info">

                        <div className="admin-waiter-avatar">

                          {waiterImage ? (

                            <img
                              src={waiterImage}
                              alt={waiterName}
                            />

                          ) : (

                            <span>
                              {waiterName
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                          )}

                        </div>


                        <div className="admin-waiter-name">

                          <strong>
                            {waiterName}
                          </strong>

                          {waiterEmail && (
                            <span>
                              {waiterEmail}
                            </span>
                          )}

                        </div>

                      </div>


                      {/* BAR */}

                      <div className="admin-waiter-bar-area">

                        <div className="admin-waiter-bar-track">

                          <div
                            className="admin-waiter-bar-fill"
                            style={{
                              width: `${width}%`,
                            }}
                          />

                        </div>

                        <strong className="admin-waiter-count">
                          {served}
                        </strong>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>


        {/* ====================================================
            TABLES CURRENTLY ASSISTED
           ==================================================== */}

        <div className="admin-performance-card admin-current-table-card">

          <div className="admin-card-header">
            <div>

              <h2>
                Tables Currently Assisted
              </h2>

              <p>
                Current availability and occupied
                table status.
              </p>

            </div>
          </div>


          {/* DONUT */}

          <div className="admin-table-donut-section">

            <div
              className="admin-table-donut"
              style={{
                "--occupied-percent":
                  `${occupiedPercentage}%`,

                "--available-percent":
                  `${availablePercentage}%`,
              }}
            >

              <div className="admin-table-donut-center">

                <strong>
                  {total}
                </strong>

                <span>
                  Tables
                </span>

              </div>

            </div>


            {/* LEGEND */}

            <div className="admin-table-legend">

              <div className="admin-table-legend-item">

                <span className="admin-legend-dot occupied"></span>

                <div>

                  <strong>
                    {occupied}
                  </strong>

                  <span>
                    Occupied
                  </span>

                </div>

              </div>


              <div className="admin-table-legend-item">

                <span className="admin-legend-dot available"></span>

                <div>

                  <strong>
                    {available}
                  </strong>

                  <span>
                    Available
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              ACTIVE TABLES
             ================================================== */}

          <div className="admin-current-table-list">

            <div className="admin-current-table-title">

              <h3>
                Active Tables
              </h3>

              <span>
                {occupied}
              </span>

            </div>


            {data.currentAssistance?.tables
              ?.length === 0 ? (

              <div className="admin-small-empty">
                No tables are currently occupied.
              </div>

            ) : (

              <div className="admin-active-table-items">

                {data.currentAssistance.tables.map(
                  (table, index) => {

                    const tableNumber =
                      table?.tableNumber ??
                      "—";

                    const waiterName =
                      table?.waiter?.name ||
                      "";

                    const tableStatus =
                      String(
                        table?.status ||
                          "OCCUPIED"
                      )
                        .replaceAll("_", " ")
                        .toUpperCase();

                    return (
                      <div
                        className="admin-active-table-item"
                        key={
                          table?.tableId ||
                          tableNumber ||
                          index
                        }
                      >

                        <div className="admin-active-table-number">
                          {tableNumber}
                        </div>


                        <div className="admin-active-table-info">

                          <strong>
                            Table {tableNumber}
                          </strong>

                          <span>
                            {waiterName
                              ? `Assisted by ${waiterName}`
                              : "Currently occupied"}
                          </span>

                        </div>


                        <div className="admin-active-table-status">
                          {tableStatus}
                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </section>
  );
};

export default AdminTablePerformance;