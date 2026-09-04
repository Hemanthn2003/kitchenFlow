import React from "react";
import Icon from "./Icon.jsx";

const STATUS_FILTERS = [
  "ALL",
  "ORDERED",
  "PROCESSING",
  "COOKED",
  "SERVED",
];

const OrdersList = ({
  orders = [],
  loading = false,
  error = "",
  filter = "ALL",
  onFilterChange,
  onRefresh,
  onStatusChange,
  updatingOrderId = null,
}) => {
  const filteredOrders = orders.filter(
    (order) => {
      if (filter === "ALL") {
        return true;
      }

      const status = String(
        order.displayStatus ||
          order.status ||
          "NEW"
      ).toUpperCase();

      return status === filter;
    }
  );

  return (
    <section className="manager-page-section">
      <div className="page-toolbar">
        <div>
          <span className="page-kicker">
            ORDER MANAGEMENT
          </span>

          <h2 className="page-title">
            Restaurant Orders
          </h2>

          <p className="page-description">
            Monitor every order, table, item,
            instruction and current status.
          </p>
        </div>

        <button
          type="button"
          className="page-refresh-button"
          onClick={onRefresh}
          disabled={loading}
        >
          <Icon
            name="refresh"
            size={16}
          />

          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      <div className="order-filter-row">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            className={
              filter === status
                ? "order-filter active"
                : "order-filter"
            }
            onClick={() =>
              onFilterChange?.(status)
            }
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="page-loading-state">
          <Icon
            name="refresh"
            size={28}
          />

          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          No orders found.
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => {
            const status = String(
              order.displayStatus ||
                order.status ||
                "NEW"
            ).toUpperCase();

            const calculatedTotal =
              Array.isArray(order.items)
                ? order.items.reduce(
                    (sum, item) =>
                      sum +
                      (Number(
                        item.unitPrice
                      ) || 0) *
                        (Number(
                          item.quantity
                        ) || 1),
                    0
                  )
                : 0;

            const total =
              Number(order.total) ||
              calculatedTotal;

            return (
              <article
                key={order._id}
                className="order-card"
              >
                <div className="order-card-header">
                  <div>
                    <span className="order-table-label">
                      TABLE
                    </span>

                    <h3>
                      {order.tableNumber !==
                        null &&
                      order.tableNumber !==
                        undefined
                        ? `TABLE ${String(
                            order.tableNumber
                          ).padStart(2, "0")}`
                        : "TABLE --"}
                    </h3>

                    <p>
                      Order #
                      {String(
                        order._id
                      ).slice(-4)}
                    </p>
                  </div>

                  <span
                    className={`order-status status-${status.toLowerCase()}`}
                  >
                    {status === "READY"
                      ? "COOKED"
                      : status}
                  </span>
                </div>

                <div className="order-meta-row">
                  <span>
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleString([], {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--"}
                  </span>

                  {order.createdByUser?.name && (
                    <span>
                      By{" "}
                      {order.createdByUser.name}
                    </span>
                  )}
                </div>

                <div className="order-items-list">
                  {Array.isArray(
                    order.items
                  ) &&
                    order.items.map(
                      (item, index) => (
                        <div
                          className="order-item-row"
                          key={`${order._id}-${index}`}
                        >
                          <div className="order-item-image">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={
                                  item.name ||
                                  "Dish"
                                }
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <Icon
                                name="menuItems"
                                size={24}
                              />
                            )}
                          </div>

                          <div className="order-item-info">
                            <h4>
                              {item.name ||
                                "Unknown Dish"}
                            </h4>

                            <div className="order-item-details">
                              <span>
                                Qty{" "}
                                {item.quantity ||
                                  1}
                              </span>

                              <span>
                                ₹
                                {Number(
                                  item.unitPrice ||
                                    0
                                ).toFixed(0)}
                              </span>
                            </div>

                            {item.instruction && (
                              <p className="order-instruction">
                                <strong>
                                  Note:
                                </strong>{" "}
                                {item.instruction}
                              </p>
                            )}
                          </div>

                          <strong className="order-item-total">
                            ₹
                            {(
                              (Number(
                                item.unitPrice
                              ) || 0) *
                              (Number(
                                item.quantity
                              ) || 1)
                            ).toFixed(0)}
                          </strong>
                        </div>
                      )
                    )}
                </div>

                <div className="order-total-row">
                  <span>Total</span>

                  <strong>
                    ₹{total.toFixed(0)}
                  </strong>
                </div>

                <div className="order-status-controls">
                  {[
                    "ORDERED",
                    "PROCESSING",
                    "COOKED",
                    "SERVED",
                  ].map((nextStatus) => {
                    const selected =
                      status === nextStatus ||
                      (nextStatus === "COOKED" &&
                        status === "READY");

                    return (
                      <button
                        key={nextStatus}
                        type="button"
                        className={
                          selected
                            ? "selected"
                            : ""
                        }
                        disabled={
                          updatingOrderId ===
                            order._id ||
                          selected
                        }
                        onClick={() =>
                          onStatusChange?.(
                            order._id,
                            nextStatus
                          )
                        }
                      >
                        {nextStatus}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default OrdersList;