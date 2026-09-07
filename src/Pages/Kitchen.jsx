import React, {
  useEffect,
  useState,
} from "react";

import Header from "../components/Header.jsx";
import KitchenOrderList from "../components/KitchenOrderList.jsx";
import Icon from "../components/Icon.jsx";

import {
  loadKitchenOrders,
  updateKitchenOrderStatus,
} from "../components/kitchenFunctions.jsx";

import "./Kitchen.css";


const Kitchen = () => {

  /* =====================================================
     KITCHEN MENU
     ===================================================== */

  const [menuOpen, setMenuOpen] =
    useState(false);


  /* =====================================================
     KITCHEN ORDERS
     ===================================================== */

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);


  /* =====================================================
     LOAD KITCHEN ORDERS
     ===================================================== */

  const fetchKitchenOrders = async () => {

    await loadKitchenOrders({
      setOrders,
      setLoading,
      setError,
    });

  };


  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  useEffect(() => {

    fetchKitchenOrders();

  }, []);


  /* =====================================================
     KITCHEN STATUS CHANGE

     ORDERED
        ↓
     PROCESSING
        ↓
     COOKED
     ===================================================== */

  const handleKitchenStatusChange = async (
    orderId,
    nextStatus
  ) => {

    await updateKitchenOrderStatus({
      orderId,
      nextStatus,
      orders,
      setOrders,
      setUpdatingOrderId,
      setError,
    });

  };


  return (

    <div className="kitchen-page">

      {/* =================================================
          KITCHEN SIDEBAR
          ================================================= */}

      {menuOpen && (
        <>

          <div
            className="kitchen-sidebar-overlay"
            onClick={() =>
              setMenuOpen(false)
            }
          />

          <aside className="kitchen-sidebar">

            {/* =================================================
                SIDEBAR HEADER
                ================================================= */}

            <div className="kitchen-sidebar-header">

              <div className="kitchen-sidebar-brand">

                <div className="kitchen-sidebar-brand-icon">
                  <Icon
                    name="chef"
                    size={22}
                  />
                </div>

                <div>
                  <strong>
                    KitchenFlow
                  </strong>

                  <span>
                    KITCHEN
                  </span>
                </div>

              </div>


              <button
                type="button"
                className="kitchen-sidebar-close"
                onClick={() =>
                  setMenuOpen(false)
                }
                aria-label="Close navigation"
              >
                <Icon
                  name="close"
                  size={19}
                />
              </button>

            </div>


            {/* =================================================
                NO NAVIGATION OPTIONS
                ================================================= */}

            <div className="kitchen-sidebar-content" />


            {/* =================================================
                LOGOUT
                ================================================= */}

            <div className="kitchen-sidebar-bottom">

              <button
                type="button"
                className="kitchen-sidebar-logout"
                onClick={() => {
                  localStorage.removeItem(
                    "user"
                  );

                  localStorage.removeItem(
                    "token"
                  );

                  window.location.href =
                    "/login";
                }}
              >

                <Icon
                  name="logout"
                  size={18}
                />

                <span>
                  Logout
                </span>

              </button>

            </div>

          </aside>

        </>
      )}


      {/* =================================================
          HEADER
          ================================================= */}

      <Header
        activePage="orders"
        onMenuToggle={() =>
          setMenuOpen(
            (previous) =>
              !previous
          )
        }
        onRefresh={
          fetchKitchenOrders
        }
        refreshing={
          loading
        }
        role="KITCHEN"
      />


      <main className="kitchen-content">

        {/* =================================================
            PAGE HERO
            ================================================= */}

        <section className="kitchen-hero">

          <div className="kitchen-hero-content">

            <div className="kitchen-kicker">

              <span className="kitchen-kicker-dot" />

              BACK OF HOUSE

            </div>


            <h1>
              Kitchen Orders
            </h1>


            <p>
              Prepare incoming restaurant orders
              and update them as they move through
              the kitchen.
            </p>

          </div>


          {/* =================================================
              REFRESH
              ================================================= */}

          <button
            type="button"
            className="kitchen-refresh-button"
            onClick={
              fetchKitchenOrders
            }
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

        </section>


        {/* =================================================
            KITCHEN STATUS SUMMARY
            ================================================= */}

        <section className="kitchen-summary">


          <div className="kitchen-summary-card">

            <div className="kitchen-summary-icon">

              <Icon
                name="orders"
                size={21}
              />

            </div>

            <div>

              <span>
                ORDERS QUEUE
              </span>

              <strong>
                {String(
                  orders.length
                ).padStart(2, "0")}
              </strong>

            </div>

          </div>


          <div className="kitchen-summary-card">

            <div className="kitchen-summary-icon processing">

              <Icon
                name="activity"
                size={21}
              />

            </div>

            <div>

              <span>
                IN PREPARATION
              </span>

              <strong>
                {String(
                  orders.filter(
                    (order) =>
                      String(
                        order?.status || ""
                      ).toUpperCase() ===
                      "PROCESSING"
                  ).length
                ).padStart(2, "0")}
              </strong>

            </div>

          </div>


          <div className="kitchen-summary-card">

            <div className="kitchen-summary-icon incoming">

              <Icon
                name="clock"
                size={21}
              />

            </div>

            <div>

              <span>
                NEW ORDERS
              </span>

              <strong>
                {String(
                  orders.filter(
                    (order) =>
                      String(
                        order?.status || ""
                      ).toUpperCase() ===
                      "ORDERED"
                  ).length
                ).padStart(2, "0")}
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            ERROR
            ================================================= */}

        {error ? (

          <div className="kitchen-error">

            <Icon
              name="activity"
              size={16}
            />

            <span>
              {error}
            </span>

          </div>

        ) : null}


        {/* =================================================
            KITCHEN ORDER LIST
            ================================================= */}

        <KitchenOrderList
          orders={orders}
          loading={loading}
          error=""
          onRefresh={
            fetchKitchenOrders
          }
          onStatusChange={
            handleKitchenStatusChange
          }
          updatingOrderId={
            updatingOrderId
          }
        />

      </main>

    </div>

  );

};


export default Kitchen;