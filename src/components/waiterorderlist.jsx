import React, { useMemo } from "react";
import Icon from "./Icon.jsx";

const WaiterOrderList = ({
  orders = [],
  loading = false,
  onRefresh,
}) => {
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a?.createdAt || 0).getTime();
      const dateB = new Date(b?.createdAt || 0).getTime();

      return dateB - dateA;
    });
  }, [orders]);

  const getStatusClass = (status) => {
    switch (status) {
      case "ORDERED":
        return "waiter-order-status-ordered";

      case "PROCESSING":
        return "waiter-order-status-processing";

      case "COOKED":
        return "waiter-order-status-cooked";

      default:
        return "waiter-order-status-default";
    }
  };

  const formatStatus = (status) => {
    if (!status) {
      return "UNKNOWN";
    }

    return String(status).replaceAll("_", " ");
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTableNumber = (order) => {
    if (order?.tableNumber !== undefined && order?.tableNumber !== null) {
      return order.tableNumber;
    }

    if (
      order?.tableId &&
      typeof order.tableId === "object" &&
      order.tableId.tableNumber !== undefined
    ) {
      return order.tableId.tableNumber;
    }

    return "—";
  };

  const getOrderNumber = (order, index) => {
    if (order?.orderNumber) {
      return order.orderNumber;
    }

    if (order?._id) {
      return `#${String(order._id).slice(-6).toUpperCase()}`;
    }

    return `#${index + 1}`;
  };

  const getItems = (order) => {
    if (!Array.isArray(order?.items)) {
      return [];
    }

    return order.items;
  };

  const getItemPrice = (item) => {
    const quantity = Number(item?.quantity) || 1;
    const unitPrice = Number(item?.unitPrice) || 0;

    return quantity * unitPrice;
  };

  const getOrderTotal = (order) => {
    if (
      order?.totalAmount !== undefined &&
      order?.totalAmount !== null
    ) {
      return Number(order.totalAmount) || 0;
    }

    if (
      order?.totalPrice !== undefined &&
      order?.totalPrice !== null
    ) {
      return Number(order.totalPrice) || 0;
    }

    return getItems(order).reduce(
      (total, item) => total + getItemPrice(item),
      0
    );
  };

  if (loading) {
    return (
      <section className="waiter-orders-page">
        <div className="waiter-order-page-heading">
          <div>
            <span className="waiter-page-kicker">ORDER TRACKING</span>
            <h2>My Orders</h2>
            <p>
              Track the current status of the orders you have taken.
            </p>
          </div>
        </div>

        <div className="waiter-orders-loading">
          <Icon name="loader" size={28} />
          <span>Loading your orders...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="waiter-orders-page">
      <div className="waiter-order-page-heading">
        <div>
          <span className="waiter-page-kicker">ORDER TRACKING</span>

          <h2>My Orders</h2>

          <p>
            Orders taken by you are shown here until the bill is
            generated.
          </p>
        </div>

        <button
          type="button"
          className="waiter-orders-refresh"
          onClick={onRefresh}
          disabled={loading}
        >
          <Icon name="refresh" size={17} />
          Refresh
        </button>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="waiter-orders-empty">
          <div className="waiter-orders-empty-icon">
            <Icon name="receipt" size={34} />
          </div>

          <h3>No Active Orders</h3>

          <p>
            Orders that you take will appear here with their current
            kitchen status.
          </p>
        </div>
      ) : (
        <div className="waiter-order-grid">
          {sortedOrders.map((order, index) => {
            const items = getItems(order);
            const total = getOrderTotal(order);
            const status = order?.status;

            return (
              <article
                className="waiter-order-card"
                key={order?._id || `${getOrderNumber(order, index)}`}
              >
                {/* ==================================================
                    CARD HEADER
                   ================================================== */}

                <div className="waiter-order-card-header">
                  <div>
                    <span className="waiter-order-label">
                      ORDER
                    </span>

                    <h3>
                      {getOrderNumber(order, index)}
                    </h3>
                  </div>

                  <div className="waiter-order-table-badge">
                    <Icon name="table" size={16} />

                    <span>
                      Table {getTableNumber(order)}
                    </span>
                  </div>
                </div>

                {/* ==================================================
                    ORDER INFO
                   ================================================== */}

                <div className="waiter-order-info">
                  <div>
                    <span>Placed</span>

                    <strong>
                      {formatDate(order?.createdAt)}
                    </strong>
                  </div>

                  <div>
                    <span>Items</span>

                    <strong>
                      {items.reduce(
                        (totalQuantity, item) =>
                          totalQuantity +
                          (Number(item?.quantity) || 1),
                        0
                      )}
                    </strong>
                  </div>
                </div>

                {/* ==================================================
                    ITEMS
                   ================================================== */}

                <div className="waiter-order-items">
                  <div className="waiter-order-items-title">
                    <span>Order Items</span>
                  </div>

                  {items.length === 0 ? (
                    <div className="waiter-order-no-items">
                      No item details available.
                    </div>
                  ) : (
                    items.map((item, itemIndex) => {
                      const quantity =
                        Number(item?.quantity) || 1;

                      const unitPrice =
                        Number(item?.unitPrice) || 0;

                      const itemTotal =
                        quantity * unitPrice;

                      return (
                        <div
                          className="waiter-order-item"
                          key={
                            item?._id ||
                            item?.menuItemId ||
                            `${item?.name}-${itemIndex}`
                          }
                        >
                          <div className="waiter-order-item-main">
                            <strong>
                              {item?.name || "Unnamed Item"}
                            </strong>

                            {item?.instruction && (
                              <small>
                                {item.instruction}
                              </small>
                            )}
                          </div>

                          <div className="waiter-order-item-meta">
                            <span>
                              × {quantity}
                            </span>

                            <strong>
                              ₹{itemTotal.toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* ==================================================
                    TOTAL
                   ================================================== */}

                <div className="waiter-order-total">
                  <span>Total</span>

                  <strong>
                    ₹{total.toFixed(2)}
                  </strong>
                </div>

                {/* ==================================================
                    SINGLE STATUS BOX
                   ================================================== */}

                <div
                  className={`waiter-order-status-box ${getStatusClass(
                    status
                  )}`}
                >
                  <div className="waiter-order-status-icon">
                    <Icon
                      name={
                        status === "COOKED"
                          ? "check"
                          : status === "PROCESSING"
                          ? "loader"
                          : "clock"
                      }
                      size={19}
                    />
                  </div>

                  <div className="waiter-order-status-content">
                    <span>Current Status</span>

                    <strong>
                      {formatStatus(status)}
                    </strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default WaiterOrderList;