import React from "react";
import Icon from "./Icon.jsx";
import WaiterTableCard from "./WaiterTableCard.jsx";

const WaiterPickedTablesPage = ({
  pickedTables,
  loading,
  user,
  actionLoading,
  expandedTable,
  menuItems,
  tableOrders,
  orderDrafts,
  onRefresh,
  onDrop,
  onCheckout,
  onToggleOrder,
  onUpdateDraft,
  onPlaceOrder,
}) => {
  return (
    <section className="manager-content waiter-content-section">
      <div className="page-heading">
        <div>
          <span>
            MY WORKSPACE
          </span>

          <h1>
            Picked{" "}
            <strong>
              Tables
            </strong>
          </h1>

          <p>
            Take orders, serve
            customers and
            checkout tables.
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

      {loading ? (
        <div className="waiter-loading">
          Loading your
          tables...
        </div>
      ) : pickedTables.length ===
        0 ? (
        <div className="waiter-empty-state">
          <Icon
            name="table"
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
        <div className="waiter-table-grid">
          {pickedTables.map(
            (table) => (
              <WaiterTableCard
                key={
                  table._id
                }
                table={
                  table
                }
                user={
                  user
                }
                isPicked
                actionLoading={
                  actionLoading
                }
                expandedTable={
                  expandedTable
                }
                menuItems={
                  menuItems
                }
                tableOrders={
                  tableOrders
                }
                orderDrafts={
                  orderDrafts
                }
                onDrop={
                  onDrop
                }
                onCheckout={
                  onCheckout
                }
                onToggleOrder={
                  onToggleOrder
                }
                onUpdateDraft={
                  onUpdateDraft
                }
                onPlaceOrder={
                  onPlaceOrder
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
};

export default WaiterPickedTablesPage;