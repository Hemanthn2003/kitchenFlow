import React from "react";
import Icon from "./Icon.jsx";
import WaiterOrderPanel from "./WaiterOrderPanel.jsx";

const WaiterTableCard = ({
  table,
  user,
  isPicked = false,
  expandedTable,
  actionLoading,
  menuItems,
  tableOrders,
  orderDrafts,
  onPick,
  onDrop,
  onCheckout,
  onToggleOrder,
  onUpdateDraft,
  onPlaceOrder,
}) => {
  const isAvailable =
    table.status ===
    "AVAILABLE";

  const isBillRequested =
    table.status ===
    "BILL_REQUESTED";

  const expanded =
    expandedTable ===
    table._id;

  return (
    <div
      className={`waiter-table-card ${
        isPicked
          ? "picked-table-card"
          : ""
      } ${
        isBillRequested
          ? "bill-requested-card"
          : ""
      } ${
        expanded
          ? "table-expanded-card"
          : ""
      }`}
    >
      <div className="waiter-table-card-top">
        <div className="waiter-table-icon">
          <Icon
            name="table"
            size={30}
          />
        </div>

        <div className="waiter-table-number">
          Table

          <strong>
            {table.tableNumber}
          </strong>
        </div>
      </div>

      <div className="waiter-table-status">
        <span>Status</span>

        <strong
          className={
            isAvailable
              ? "status-available"
              : isBillRequested
              ? "status-billing"
              : "status-unavailable"
          }
        >
          {isAvailable
            ? "AVAILABLE"
            : isBillRequested
            ? "CHECKOUT REQUESTED"
            : "OCCUPIED"}
        </strong>
      </div>

      {!isAvailable &&
        !isPicked &&
        table.waiterId?.name && (
          <div className="assigned-waiter">
            Picked by{" "}
            <strong>
              {
                table
                  .waiterId
                  .name
              }
            </strong>
          </div>
        )}

      {isAvailable &&
        !isPicked && (
          <button
            type="button"
            className="waiter-primary-button"
            disabled={
              actionLoading ===
              `pick-${table._id}`
            }
            onClick={() =>
              onPick(table)
            }
          >
            <Icon
              name="plus"
              size={17}
            />

            {actionLoading ===
            `pick-${table._id}`
              ? "Picking..."
              : "Pick Table"}
          </button>
        )}

      {isPicked &&
        !isBillRequested && (
          <div className="picked-table-actions">
            <button
              type="button"
              className="waiter-primary-button"
              onClick={() =>
                onToggleOrder(
                  table._id
                )
              }
            >
              <Icon
                name="menuItems"
                size={17}
              />

              Take Order

              <Icon
                name={
                  expanded
                    ? "close"
                    : "plus"
                }
                size={16}
              />
            </button>

            <button
              type="button"
              className="waiter-outline-button"
              disabled={
                actionLoading ===
                `drop-${table._id}`
              }
              onClick={() =>
                onDrop(table)
              }
            >
              Drop Table
            </button>

            <button
              type="button"
              className="waiter-gold-button"
              disabled={
                actionLoading ===
                `checkout-${table._id}`
              }
              onClick={() =>
                onCheckout(table)
              }
            >
              <Icon
                name="orders"
                size={17}
              />

              Checkout
            </button>
          </div>
        )}

      {isPicked &&
        isBillRequested && (
          <div className="waiter-billing-state">
            <Icon
              name="clock"
              size={18}
            />

            Waiting for manager
            to generate the bill.
          </div>
        )}

      {isPicked &&
        expanded && (
          <WaiterOrderPanel
            table={table}
            menuItems={
              menuItems
            }
            orders={
              tableOrders[
                table._id
              ] || []
            }
            orderDrafts={
              orderDrafts
            }
            actionLoading={
              actionLoading
            }
            onUpdateDraft={
              onUpdateDraft
            }
            onPlaceOrder={
              onPlaceOrder
            }
          />
        )}
    </div>
  );
};

export default WaiterTableCard;