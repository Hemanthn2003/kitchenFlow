import React from "react";
import Icon from "./Icon.jsx";

// ============================================================
// DROP TABLE MODAL
// ============================================================

export const DropTableModal = ({
  table,
  actionLoading,
  onCancel,
  onConfirm,
}) => {
  if (!table) {
    return null;
  }

  return (
    <div
      className="waiter-drop-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="waiter-drop-confirm-modal">
        <div className="waiter-drop-modal-icon">
          <Icon
            name="clock"
            size={30}
          />
        </div>

        <span className="waiter-drop-modal-kicker">
          TABLE ACTION
        </span>

        <h2>
          Confirm Drop Table
        </h2>

        <p>
          Are you sure you want
          to stop serving{" "}
          <strong>
            Table{" "}
            {
              table.tableNumber
            }
          </strong>
          ?
        </p>

        <div className="waiter-drop-modal-actions">
          <button
            type="button"
            className="waiter-drop-cancel-button"
            onClick={
              onCancel
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="waiter-drop-confirm-button"
            disabled={
              actionLoading ===
              `drop-${table._id}`
            }
            onClick={
              onConfirm
            }
          >
            {actionLoading ===
            `drop-${table._id}`
              ? "Dropping..."
              : "Confirm Drop"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CHECKOUT MODAL
// ============================================================

export const CheckoutModal = ({
  table,
  actionLoading,
  onCancel,
  onConfirm,
}) => {
  if (!table) {
    return null;
  }

  return (
    <div
      className="waiter-checkout-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="waiter-checkout-confirm-modal">
        <div className="waiter-checkout-modal-icon">
          <Icon
            name="orders"
            size={30}
          />
        </div>

        <span className="waiter-checkout-modal-kicker">
          CHECKOUT
        </span>

        <h2>
          Confirm Checkout
        </h2>

        <p>
          Send checkout request
          for{" "}
          <strong>
            Table{" "}
            {
              table.tableNumber
            }
          </strong>
          ?
          <br />
          The manager will
          generate the bill.
        </p>

        <div className="waiter-checkout-modal-actions">
          <button
            type="button"
            className="waiter-checkout-cancel-button"
            onClick={
              onCancel
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="waiter-checkout-confirm-button"
            disabled={
              actionLoading ===
              `checkout-${table._id}`
            }
            onClick={
              onConfirm
            }
          >
            <Icon
              name="orders"
              size={17}
            />

            {actionLoading ===
            `checkout-${table._id}`
              ? "Sending..."
              : "Confirm Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// READY ORDER NOTIFICATION
// ============================================================

export const ReadyOrderModal = ({
  order,
  onServe,
}) => {
  if (!order) {
    return null;
  }

  return (
    <div className="waiter-modal-overlay">
      <div className="waiter-ready-modal">
        <div className="waiter-notification-icon">
          <Icon
            name="orders"
            size={36}
          />
        </div>

        <span>
          ORDER READY
        </span>

        <h2>
          Table{" "}
          {
            order.tableNumber
          }{" "}
          Order Ready
        </h2>

        <p>
          The kitchen has
          completed the order.
          Please serve it to
          the customer.
        </p>

        <button
          type="button"
          className="waiter-primary-button"
          onClick={() =>
            onServe(order)
          }
        >
          <Icon
            name="check"
            size={18}
          />

          Serve Order
        </button>
      </div>
    </div>
  );
};

// ============================================================
// SERVE ORDER MODAL
// ============================================================

export const ServeOrderModal = ({
  order,
  actionLoading,
  onServe,
  onClose,
}) => {
  if (!order) {
    return null;
  }

  return (
    <div className="waiter-modal-overlay">
      <div className="waiter-serve-modal">
        <Icon
          name="chef"
          size={38}
        />

        <span>
          READY TO SERVE
        </span>

        <h2>
          Serve Table{" "}
          {
            order.tableNumber
          }
        </h2>

        <div className="waiter-serve-items">
          {order.items?.map(
            (
              item,
              index
            ) => (
              <div
                key={`${order._id}-${index}`}
              >
                <span>
                  {
                    item.name
                  }
                </span>

                <strong>
                  ×{" "}
                  {
                    item.quantity
                  }
                </strong>
              </div>
            )
          )}
        </div>

        <button
          type="button"
          className="waiter-gold-button"
          disabled={
            actionLoading ===
            `serve-${order._id}`
          }
          onClick={() =>
            onServe(order)
          }
        >
          <Icon
            name="check"
            size={18}
          />

          {actionLoading ===
          `serve-${order._id}`
            ? "Serving..."
            : "Mark Served"}
        </button>

        <button
          type="button"
          className="waiter-modal-close"
          onClick={
            onClose
          }
        >
          Close
        </button>
      </div>
    </div>
  );
};