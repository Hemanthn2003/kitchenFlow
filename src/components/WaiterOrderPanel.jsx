import React from "react";
import Icon from "./Icon.jsx";

const getDraft = (
  orderDrafts,
  tableId,
  menuItemId
) =>
  orderDrafts?.[
    tableId
  ]?.[menuItemId] || {
    selected: false,
    quantity: 1,
    instruction: "",
  };

const WaiterOrderPanel = ({
  table,
  menuItems,
  orders,
  orderDrafts,
  actionLoading,
  onUpdateDraft,
  onPlaceOrder,
}) => {
  return (
    <div className="waiter-order-expanded">
      <div className="waiter-existing-orders">
        <div className="waiter-existing-orders-heading">
          <div>
            <span>
              ORDER HISTORY
            </span>

            <h4>
              Current Orders
            </h4>
          </div>

          <Icon
            name="orders"
            size={20}
          />
        </div>

        {orders.length > 0 ? (
          orders.map(
            (order) => (
              <div
                key={
                  order._id
                }
                className="waiter-order-history-card"
              >
                <div className="waiter-order-history-top">
                  <span>
                    Order
                  </span>

                  <strong>
                    {order.status}
                  </strong>
                </div>

                {order.items?.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${order._id}-${index}`}
                      className="waiter-history-item"
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
            )
          )
        ) : (
          <p className="waiter-empty-order">
            No orders placed
            yet.
          </p>
        )}
      </div>

      <div className="waiter-new-order-header">
        <div>
          <span>
            NEW ORDER
          </span>

          <h3>
            Build Order
          </h3>

          <p>
            Select dishes for
            Table{" "}
            {
              table.tableNumber
            }
          </p>
        </div>

        <button
          type="button"
          className="waiter-place-order-button"
          disabled={
            actionLoading ===
            `order-${table._id}`
          }
          onClick={() =>
            onPlaceOrder(table)
          }
        >
          <Icon
            name="orders"
            size={17}
          />

          {actionLoading ===
          `order-${table._id}`
            ? "Placing..."
            : "Place Order"}
        </button>
      </div>

      <div className="waiter-menu-grid">
        {menuItems.map(
          (item) => {
            const draft =
              getDraft(
                orderDrafts,
                table._id,
                item._id
              );

            return (
              <div
                key={
                  item._id
                }
                className={`waiter-menu-card ${
                  draft.selected
                    ? "selected-menu-card"
                    : ""
                }`}
              >
                <div className="waiter-menu-image-wrap">
                  {item.imageUrl ? (
                    <img
                      src={
                        item.imageUrl
                      }
                      alt={
                        item.name
                      }
                    />
                  ) : (
                    <div className="waiter-menu-placeholder">
                      <Icon
                        name="chef"
                        size={30}
                      />
                    </div>
                  )}

                  <label className="waiter-checkbox">
                    <input
                      type="checkbox"
                      checked={
                        draft.selected
                      }
                      onChange={(
                        event
                      ) =>
                        onUpdateDraft(
                          table._id,
                          item._id,
                          {
                            selected:
                              event
                                .target
                                .checked,
                          }
                        )
                      }
                    />

                    <span />
                  </label>
                </div>

                <div className="waiter-menu-info">
                  <h4>
                    {item.name}
                  </h4>

                  <strong>
                    ₹
                    {Number(
                      item.price
                    ).toFixed(
                      2
                    )}
                  </strong>
                </div>

                {draft.selected && (
                  <div className="waiter-menu-controls">
                    <div className="waiter-quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateDraft(
                            table._id,
                            item._id,
                            {
                              quantity:
                                Math.max(
                                  1,
                                  Number(
                                    draft.quantity
                                  ) -
                                    1
                                ),
                            }
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {
                          draft.quantity
                        }
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateDraft(
                            table._id,
                            item._id,
                            {
                              quantity:
                                Number(
                                  draft.quantity
                                ) +
                                1,
                            }
                          )
                        }
                      >
                        <Icon
                          name="plus"
                          size={15}
                        />
                      </button>
                    </div>

                    <textarea
                      placeholder="Special notes..."
                      value={
                        draft.instruction
                      }
                      onChange={(
                        event
                      ) =>
                        onUpdateDraft(
                          table._id,
                          item._id,
                          {
                            instruction:
                              event
                                .target
                                .value,
                          }
                        )
                      }
                    />
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default WaiterOrderPanel;