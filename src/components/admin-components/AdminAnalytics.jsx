import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Icon from "../Icon.jsx";

import {
  loadSalesAnalytics,
  loadPopularDishes,
  formatCurrency,
} from "./AdminFunctions.js";


/* ============================================================
   AVAILABLE SALES PERIODS
   ============================================================ */

const PERIODS = [
  {
    value: "day",
    label: "Daily",
  },
  {
    value: "week",
    label: "Weekly",
  },
  {
    value: "month",
    label: "Monthly",
  },
  {
    value: "year",
    label: "Yearly",
  },
  {
    value: "2year",
    label: "2 Years",
  },
];


/* ============================================================
   PREVIOUS PERIOD DESCRIPTION
   ============================================================ */

const getComparisonLabel = (
  selectedPeriod
) => {
  switch (selectedPeriod) {
    case "day":
      return "Previous 24 Hours";

    case "week":
      return "Previous 7 Days";

    case "month":
      return "Previous 30 Days";

    case "year":
      return "Previous 1 Year";

    case "2year":
      return "Previous 2 Years";

    default:
      return "Previous Equivalent Period";
  }
};


/* ============================================================
   CURRENT PERIOD DESCRIPTION
   ============================================================ */

const getCurrentPeriodLabel = (
  selectedPeriod
) => {
  switch (selectedPeriod) {
    case "day":
      return "Current 24 Hours";

    case "week":
      return "Current 7 Days";

    case "month":
      return "Current 30 Days";

    case "year":
      return "Current 1 Year";

    case "2year":
      return "Current 2 Years";

    default:
      return "Current Period";
  }
};


/* ============================================================
   ANALYTICS
   ============================================================ */

const AdminAnalytics = () => {

  /* ==========================================================
     SALES
     ========================================================== */

  const [period, setPeriod] =
    useState("week");

  const [salesData, setSalesData] =
    useState(null);

  const [loadingSales, setLoadingSales] =
    useState(false);


  /* ==========================================================
     POPULAR DISHES
     ========================================================== */

  const [dishData, setDishData] =
    useState(null);

  const [category, setCategory] =
    useState("ALL");

  const [loadingDishes, setLoadingDishes] =
    useState(false);


  /* ==========================================================
     ERROR
     ========================================================== */

  const [error, setError] =
    useState("");


  /* ==========================================================
     STRICTMODE GUARDS

     These refs prevent the development-only StrictMode
     effect re-run from making the same GET request twice.

     They do NOT prevent requests when the user actually
     changes the selected period/category.
     ========================================================== */

  const salesInitialLoadRef =
    useRef(false);

  const dishesInitialLoadRef =
    useRef(false);


  /* ==========================================================
     REQUEST IDS

     Prevent an older response from overwriting a newer
     selection if the user changes filters quickly.
     ========================================================== */

  const salesRequestIdRef =
    useRef(0);

  const dishesRequestIdRef =
    useRef(0);


  /* ==========================================================
     LOAD SALES
     ========================================================== */

  const loadSales = async (
    selectedPeriod
  ) => {

    const requestId =
      ++salesRequestIdRef.current;

    try {

      setLoadingSales(true);

      setError("");


      const response =
        await loadSalesAnalytics({
          period:
            selectedPeriod,
        });


      if (
        requestId !==
        salesRequestIdRef.current
      ) {
        return;
      }


      setSalesData(
        response
      );

    } catch (
      requestError
    ) {

      if (
        requestId !==
        salesRequestIdRef.current
      ) {
        return;
      }


      console.error(
        "Admin sales analytics error:",
        requestError
      );


      setError(
        requestError?.message ||
          "Unable to load sales analytics"
      );

    } finally {

      if (
        requestId ===
        salesRequestIdRef.current
      ) {
        setLoadingSales(false);
      }

    }

  };


  /* ==========================================================
     LOAD POPULAR DISHES
     ========================================================== */

  const loadDishes = async (
    selectedCategory
  ) => {

    const requestId =
      ++dishesRequestIdRef.current;

    try {

      setLoadingDishes(
        true
      );


      const response =
        await loadPopularDishes({
          category:
            selectedCategory,
        });


      if (
        requestId !==
        dishesRequestIdRef.current
      ) {
        return;
      }


      setDishData(
        response
      );

    } catch (
      requestError
    ) {

      if (
        requestId !==
        dishesRequestIdRef.current
      ) {
        return;
      }


      console.error(
        "Admin dish analytics error:",
        requestError
      );


      setError(
        requestError?.message ||
          "Unable to load dish analytics"
      );

    } finally {

      if (
        requestId ===
        dishesRequestIdRef.current
      ) {
        setLoadingDishes(
          false
        );
      }

    }

  };


  /* ==========================================================
     SALES EFFECT

     First mount:
       one request only

     Actual period change:
       one new request
     ========================================================== */

  useEffect(() => {

    if (
      !salesInitialLoadRef.current
    ) {

      salesInitialLoadRef.current =
        true;

      loadSales(
        period
      );

      return;
    }


    /*
      When period changes, load exactly
      one new dataset.
    */

    loadSales(
      period
    );

  }, [period]);


  /* ==========================================================
     DISH EFFECT

     First mount:
       one request only

     Actual category change:
       one new request
     ========================================================== */

  useEffect(() => {

    if (
      !dishesInitialLoadRef.current
    ) {

      dishesInitialLoadRef.current =
        true;

      loadDishes(
        category
      );

      return;
    }


    loadDishes(
      category
    );

  }, [category]);


  /* ==========================================================
     SALES VALUES
     ========================================================== */

  const currentTotal =
    Number(
      salesData?.current?.total ||
        0
    );


  const previousTotal =
    Number(
      salesData?.previous?.total ||
        0
    );


  const change =
    Number(
      salesData?.change ||
        0
    );


  const series =
    Array.isArray(
      salesData?.current?.series
    )
      ? salesData.current.series
      : [];


  const maxSales =
    Math.max(
      ...series.map(
        (item) =>
          Number(
            item?.amount ||
              0
          )
      ),
      1
    );


  /* ==========================================================
     POPULAR DISHES
     ========================================================== */

  const topDishes =
    useMemo(() => {

      const dishes =
        Array.isArray(
          dishData?.dishes
        )
          ? dishData.dishes
          : [];


      return dishes.slice(
        0,
        10
      );

    }, [dishData]);


  const maxDishSales =
    Math.max(
      ...topDishes.map(
        (dish) =>
          Number(
            dish?.sales ||
              0
          )
      ),
      1
    );


  /* ==========================================================
     COMPARISON
     ========================================================== */

  const currentPeriodLabel =
    getCurrentPeriodLabel(
      period
    );


  const previousPeriodLabel =
    getComparisonLabel(
      period
    );


  const difference =
    currentTotal -
    previousTotal;


  /* ==========================================================
     RENDER
     ========================================================== */

  return (

    <section className="admin-analytics-page">


      {/* =====================================================
          HEADING
          ===================================================== */}

      <div className="admin-page-heading">

        <div>

          <span>
            BUSINESS INTELLIGENCE
          </span>


          <h2>
            Analytics
          </h2>


          <p>
            Restaurant performance from
            actual completed bills.
          </p>

        </div>

      </div>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (

        <div className="admin-error">

          {error}

        </div>

      )}


      {/* =====================================================
          KPI CARDS
          ===================================================== */}

      <div className="admin-analytics-kpis">


        {/* CURRENT */}

        <article className="admin-analytics-kpi">

          <div className="admin-kpi-icon">

            <Icon
              name="circle-dollar"
              size={21}
            />

          </div>


          <span>
            SELECTED PERIOD
          </span>


          <strong>
            {formatCurrency(
              currentTotal
            )}
          </strong>


          <small>
            {currentPeriodLabel}
          </small>

        </article>


        {/* PREVIOUS */}

        <article className="admin-analytics-kpi">

          <div className="admin-kpi-icon">

            <Icon
              name="calendar"
              size={21}
            />

          </div>


          <span>
            PREVIOUS PERIOD
          </span>


          <strong>
            {formatCurrency(
              previousTotal
            )}
          </strong>


          <small>
            {previousPeriodLabel}
          </small>

        </article>


        {/* GROWTH */}

        <article className="admin-analytics-kpi">

          <div className="admin-kpi-icon">

            <Icon
              name={
                change >= 0
                  ? "arrow-up"
                  : "arrow-down"
              }
              size={21}
            />

          </div>


          <span>
            GROWTH
          </span>


          <strong
            className={
              change >= 0
                ? "positive"
                : "negative"
            }
          >

            {change >= 0
              ? "+"
              : ""}

            {change.toFixed(
              1
            )}

            %

          </strong>


          <small>
            Versus previous equivalent period
          </small>

        </article>


        {/* DISHES */}

        <article className="admin-analytics-kpi">

          <div className="admin-kpi-icon">

            <Icon
              name="shopping-cart"
              size={21}
            />

          </div>


          <span>
            DISHES SOLD
          </span>


          <strong>

            {String(
              dishData?.totalQuantity ||
                0
            )}

          </strong>


          <small>
            Selected dish filter
          </small>

        </article>

      </div>


      {/* =====================================================
          SALES PERFORMANCE
          ===================================================== */}

      <section className="admin-chart-card">


        {/* HEADER */}

        <div className="admin-chart-heading">

          <div>

            <span>
              REVENUE
            </span>


            <h3>
              Sales Performance
            </h3>

          </div>


          <select
            value={
              period
            }
            onChange={(
              event
            ) =>
              setPeriod(
                event.target.value
              )
            }
          >

            {PERIODS.map(
              (item) => (

                <option
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }
                >

                  {item.label}

                </option>

              )
            )}

          </select>

        </div>


        {/* CHART */}

        {loadingSales ? (

          <div className="admin-chart-loading">

            Loading sales...

          </div>

        ) : series.length === 0 ? (

          <div className="admin-chart-empty">

            No sales data available.

          </div>

        ) : (

          <div className="admin-sales-chart">


            {/* Y AXIS */}

            <div className="admin-chart-y-axis">

              <span>
                {formatCurrency(
                  maxSales
                )}
              </span>


              <span>
                {formatCurrency(
                  maxSales *
                    0.75
                )}
              </span>


              <span>
                {formatCurrency(
                  maxSales *
                    0.5
                )}
              </span>


              <span>
                {formatCurrency(
                  maxSales *
                    0.25
                )}
              </span>


              <span>
                ₹0
              </span>

            </div>


            {/* BARS */}

            <div className="admin-chart-bars">

              {series.map(
                (
                  item,
                  index
                ) => {

                  const amount =
                    Number(
                      item?.amount ||
                        0
                    );


                  const height =
                    Math.max(
                      4,
                      (
                        amount /
                        maxSales
                      ) *
                        100
                    );


                  return (

                    <div
                      className="admin-chart-column"
                      key={
                        `${item?.start || item?.label || "sale"}-${index}`
                      }
                    >

                      <div className="admin-chart-bar-wrapper">

                        <span className="admin-chart-tooltip">

                          {formatCurrency(
                            amount
                          )}

                        </span>


                        <div
                          className="admin-chart-bar"
                          style={{
                            height:
                              `${height}%`,
                          }}
                        />

                      </div>


                      <span className="admin-chart-label">

                        {item?.label}

                      </span>

                    </div>

                  );

                }
              )}

            </div>

          </div>

        )}


        {/* ===================================================
            EQUIVALENT PERIOD COMPARISON
            =================================================== */}

        {!loadingSales &&
          salesData && (

            <div className="admin-sales-comparison">


              <div className="admin-sales-comparison-heading">

                <div>

                  <span>
                    PERIOD COMPARISON
                  </span>


                  <h4>
                    Current vs Previous
                  </h4>

                </div>


                <strong
                  className={
                    change >= 0
                      ? "positive"
                      : "negative"
                  }
                >

                  {change >= 0
                    ? "+"
                    : ""}

                  {change.toFixed(
                    1
                  )}

                  %

                </strong>

              </div>


              <div className="admin-sales-comparison-grid">


                {/* CURRENT */}

                <div className="admin-sales-comparison-item">

                  <span>
                    {currentPeriodLabel}
                  </span>


                  <strong>
                    {formatCurrency(
                      currentTotal
                    )}
                  </strong>

                </div>


                {/* PREVIOUS */}

                <div className="admin-sales-comparison-item">

                  <span>
                    {previousPeriodLabel}
                  </span>


                  <strong>
                    {formatCurrency(
                      previousTotal
                    )}
                  </strong>

                </div>


                {/* DIFFERENCE */}

                <div className="admin-sales-comparison-item">

                  <span>
                    Difference
                  </span>


                  <strong
                    className={
                      difference >= 0
                        ? "positive"
                        : "negative"
                    }
                  >

                    {difference >= 0
                      ? "+"
                      : ""}

                    {formatCurrency(
                      difference
                    )}

                  </strong>

                </div>

              </div>


              <p className="admin-sales-comparison-text">

                Sales for{" "}
                <strong>
                  {currentPeriodLabel}
                </strong>{" "}
                are{" "}
                <strong>
                  {change >= 0
                    ? "higher"
                    : "lower"}
                </strong>{" "}
                than the{" "}
                <strong>
                  {previousPeriodLabel}
                </strong>{" "}
                by{" "}
                <strong>
                  {Math.abs(
                    change
                  ).toFixed(
                    1
                  )}
                  %
                </strong>
                .

              </p>

            </div>

          )}

      </section>


      {/* =====================================================
          POPULAR DISHES

          This stays INSIDE Analytics.
          There is no separate sidebar page.
          ===================================================== */}

      <section className="admin-chart-card">


        {/* HEADER */}

        <div className="admin-chart-heading">

          <div>

            <span>
              MENU INTELLIGENCE
            </span>


            <h3>
              Popular Dishes
            </h3>

          </div>


          <select
            value={
              category
            }
            onChange={(
              event
            ) =>
              setCategory(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Categories
            </option>


            {(
              Array.isArray(
                dishData?.categories
              )
                ? dishData.categories
                : []
            ).map(
              (item) => (

                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >

                  {item}

                </option>

              )
            )}

          </select>

        </div>


        {/* DISH DATA */}

        {loadingDishes ? (

          <div className="admin-chart-loading">

            Loading dishes...

          </div>

        ) : topDishes.length === 0 ? (

          <div className="admin-chart-empty">

            No dish sales available.

          </div>

        ) : (

          <div className="admin-dish-ranking">

            {topDishes.map(
              (
                dish,
                index
              ) => {

                const sales =
                  Number(
                    dish?.sales ||
                      0
                  );


                const quantity =
                  Number(
                    dish?.quantity ||
                      0
                  );


                const percentage =
                  (
                    sales /
                    maxDishSales
                  ) *
                    100;


                return (

                  <div
                    className="admin-dish-row"
                    key={
                      dish?.menuItemId ||
                      dish?.name ||
                      index
                    }
                  >


                    {/* RANK */}

                    <div className="admin-dish-rank">

                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </div>


                    {/* MAIN */}

                    <div className="admin-dish-main">

                      <div className="admin-dish-title">

                        <strong>
                          {dish?.name}
                        </strong>


                        <span>
                          {dish?.category}
                        </span>

                      </div>


                      <div className="admin-dish-progress">

                        <div
                          style={{
                            width:
                              `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  percentage
                                )
                              )}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* QUANTITY */}

                    <div className="admin-dish-values">

                      <strong>
                        {quantity}
                      </strong>


                      <span>
                        sold
                      </span>

                    </div>


                    {/* REVENUE */}

                    <div className="admin-dish-revenue">

                      {formatCurrency(
                        sales
                      )}

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </section>


    </section>

  );

};


export default AdminAnalytics;