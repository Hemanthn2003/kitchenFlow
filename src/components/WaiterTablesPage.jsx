import React from "react";
import Icon from "./Icon.jsx";
import WaiterTableCard from "./WaiterTableCard.jsx";

const WaiterTablesPage = ({
  tables,
  tableStats,
  loading,
  actionLoading,
  onRefresh,
  onPick,
}) => {
  return (
    <section className="manager-content waiter-content-section">
      <div className="page-heading">
        <div>
          <span>
            TABLE MANAGEMENT
          </span>

          <h1>
            Restaurant{" "}
            <strong>
              Tables
            </strong>
          </h1>

          <p>
            Pick an available
            table and start
            serving customers.
          </p>
        </div>

        <button
          type="button"
          className="waiter-refresh-button"
          onClick={onRefresh}
        >
          <Icon
            name="refresh"
            size={18}
          />

          Refresh
        </button>
      </div>

      <div className="waiter-stat-row">
        <div>
          <Icon
            name="table"
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
          <Icon
            name="check"
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
          <Icon
            name="clock"
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

      {loading ? (
        <div className="waiter-loading">
          Loading tables...
        </div>
      ) : tables.length === 0 ? (
        <div className="waiter-empty-state">
          <Icon
            name="table"
            size={44}
          />

          <h3>
            No Tables Found
          </h3>

          <p>
            There are no
            restaurant tables
            available.
          </p>
        </div>
      ) : (
        <div className="waiter-table-grid">
          {tables.map(
            (table) => (
              <WaiterTableCard
                key={
                  table._id
                }
                table={
                  table
                }
                actionLoading={
                  actionLoading
                }
                onPick={
                  onPick
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
};

export default WaiterTablesPage;