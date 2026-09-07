import React from "react";


/* =========================================================
   KITCHEN ORDER LIST
   ========================================================= */

const KitchenOrderList = ({
  orders = [],
  loading = false,
  error = "",
  onRefresh,
  onStatusChange,
  updatingOrderId = null,
}) => {

  /* =======================================================
     SAFE ORDERS
     ======================================================= */

  const safeOrders = Array.isArray(orders)
    ? orders
    : [];


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading && safeOrders.length === 0) {
    return (
      <section className="manager-page-section">

        <div className="page-loading-state">

          <p>
            Loading orders...
          </p>

        </div>

      </section>
    );
  }


  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {
    return (
      <section className="manager-page-section">

        <div className="error-message">
          {error}
        </div>

      </section>
    );
  }


  /* =======================================================
     EMPTY
     ======================================================= */

  if (safeOrders.length === 0) {
    return (
      <section className="manager-page-section">

        <div className="empty-state">
          No kitchen orders found.
        </div>

      </section>
    );
  }


  return (
    <section className="manager-page-section">

      {/* ===================================================
          ORDERS GRID

          Uses the SAME:
          .orders-grid
          .order-card
          .order-card-header
          .order-item-row
          etc.

          as Manager OrdersList.
          =================================================== */}

      <div className="orders-grid">

        {safeOrders.map((order) => {

          /* =================================================
             ORDER STATUS
             ================================================= */

          const status = String(
            order?.displayStatus ||
            order?.status ||
            "NEW"
          ).trim().toUpperCase();


          /* =================================================
             TABLE NUMBER
             ================================================= */

          const tableNumber =
            order?.tableNumber ??
            order?.table?.tableNumber ??
            order?.table?.number ??
            "--";


          return (
            <article
              key={
                order?._id ||
                order?.id
              }
              className="order-card"
            >

              {/* =============================================
                  ORDER HEADER
                  ============================================= */}

              <div className="order-card-header">

                <div>

                  <span className="order-table-label">
                    TABLE
                  </span>


                  <h3>
                    {tableNumber !== "--"
                      ? `TABLE ${String(
                          tableNumber
                        ).padStart(2, "0")}`
                      : "TABLE --"}
                  </h3>


                  <p>
                    Order #
                    {String(
                      order?._id ||
                      order?.id ||
                      ""
                    ).slice(-4)}
                  </p>

                </div>


                {/* =========================================
                    CURRENT STATUS
                    ========================================= */}

                <span
                  className={`order-status status-${status.toLowerCase()}`}
                >
                  {status === "READY"
                    ? "COOKED"
                    : status}
                </span>

              </div>


              {/* =============================================
                  ORDER META
                  ============================================= */}

              <div className="order-meta-row">

                <span>

                  {order?.createdAt
                    ? new Date(
                        order.createdAt
                      ).toLocaleString(
                        [],
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "--"}

                </span>


                {order?.createdByUser?.name && (

                  <span>
                    By{" "}
                    {order.createdByUser.name}
                  </span>

                )}

              </div>


              {/* =============================================
                  ORDER ITEMS
                  ============================================= */}

              <div className="order-items-list">

                {Array.isArray(order?.items) &&
                order.items.length > 0 ? (

                  order.items.map(
                    (item, index) => {

                      /* =====================================
                         IMAGE

                         Support all common structures.
                         ===================================== */

                      const itemImage =
                        item?.imageUrl ||
                        item?.image ||
                        item?.menuItemId?.imageUrl ||
                        item?.menuItemId?.image ||
                        item?.menuItem?.imageUrl ||
                        item?.menuItem?.image ||
                        "";


                      /* =====================================
                         ITEM NAME

                         Support populated menu item too.
                         ===================================== */

                      const itemName =
                        item?.name ||
                        item?.menuItemId?.name ||
                        item?.menuItem?.name ||
                        "Unknown Dish";


                      /* =====================================
                         QUANTITY
                         ===================================== */

                      const quantity =
                        Number(
                          item?.quantity
                        ) || 1;


                      return (

                        <div
                          className="order-item-row"
                          key={`${order?._id || order?.id}-${index}`}
                        >

                          {/* =================================
                              ITEM IMAGE
                              ================================= */}

                          <div className="order-item-image">

                            {itemImage ? (

                              <img
                                src={itemImage}
                                alt={itemName}
                                loading="lazy"
                                onError={(event) => {

                                  /*
                                   * If image fails,
                                   * hide broken image and
                                   * show placeholder.
                                   */

                                  event.currentTarget.style.display =
                                    "none";

                                  const placeholder =
                                    event.currentTarget
                                      .parentElement
                                      ?.querySelector(
                                        ".kitchen-item-image-placeholder"
                                      );

                                  if (placeholder) {
                                    placeholder.style.display =
                                      "flex";
                                  }

                                }}
                              />

                            ) : null}


                            {/* =================================
                                IMAGE PLACEHOLDER
                                ================================= */}

                            <div
                              className="kitchen-item-image-placeholder"
                              style={{
                                display: itemImage
                                  ? "none"
                                  : "flex",
                              }}
                            >
                              🍽️
                            </div>

                          </div>


                          {/* =================================
                              ITEM INFORMATION
                              
                              IMPORTANT:
                              NO PRICE HERE.
                              ================================= */}

                          <div className="order-item-info">

                            <h4>
                              {itemName}
                            </h4>


                            {/* QUANTITY ONLY */}

                            <div className="order-item-details">

                              <span>
                                Qty{" "}
                                {quantity}
                              </span>

                            </div>


                            {/* =================================
                                SPECIAL NOTE

                                NO ICON.
                                ================================= */}

                            {item?.instruction && (

                              <p className="order-instruction">

                                <strong>
                                  Note:
                                </strong>{" "}

                                {item.instruction}

                              </p>

                            )}

                          </div>

                        </div>

                      );

                    }
                  )

                ) : (

                  <div className="order-item-row">

                    <div className="order-item-info">

                      <h4>
                        No items found
                      </h4>

                    </div>

                  </div>

                )}

              </div>


              {/* =============================================
                  KITCHEN ACTION BUTTON

                  ONLY ONE BUTTON
                  ============================================= */}

              <div className="kitchen-order-action">

                {/* =========================================
                    ORDERED → PROCESSING
                    ========================================= */}

                {status === "ORDERED" && (

                  <button
                    type="button"
                    className="kitchen-order-action-btn"
                    onClick={() =>
                      onStatusChange?.(
                        order._id ||
                        order.id,
                        "PROCESSING"
                      )
                    }
                    disabled={
                      updatingOrderId ===
                      (order._id || order.id)
                    }
                  >

                    {updatingOrderId ===
                    (order._id || order.id)
                      ? "Starting..."
                      : "Start Preparing"}

                  </button>

                )}


                {/* =========================================
                    PROCESSING → COOKED
                    ========================================= */}

                {status === "PROCESSING" && (

                  <button
                    type="button"
                    className="kitchen-order-action-btn"
                    onClick={() =>
                      onStatusChange?.(
                        order._id ||
                        order.id,
                        "COOKED"
                      )
                    }
                    disabled={
                      updatingOrderId ===
                      (order._id || order.id)
                    }
                  >

                    {updatingOrderId ===
                    (order._id || order.id)
                      ? "Updating..."
                      : "Mark Cooked"}

                  </button>

                )}


                {/* =========================================
                    COOKED
                    ========================================= */}

                {status === "COOKED" && (

                  <button
                    type="button"
                    className="kitchen-order-action-btn completed"
                    disabled
                  >
                    Cooked
                  </button>

                )}


                {/* =========================================
                    READY

                    Backward compatibility with old
                    backend status.
                    ========================================= */}

                {status === "READY" && (

                  <button
                    type="button"
                    className="kitchen-order-action-btn completed"
                    disabled
                  >
                    Cooked
                  </button>

                )}


                {/* =========================================
                    SERVED
                    ========================================= */}

                {status === "SERVED" && (

                  <button
                    type="button"
                    className="kitchen-order-action-btn completed"
                    disabled
                  >
                    Served
                  </button>

                )}

              </div>

            </article>
          );

        })}

      </div>

    </section>
  );
};


/* =========================================================
   DEFAULT EXPORT

   IMPORTANT:
   Kitchen.jsx imports this as:

   import KitchenOrderList from
   "../components/KitchenOrderList.jsx";
   ========================================================= */

export default KitchenOrderList;