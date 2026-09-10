import React, {
  useEffect,
  useState,
} from "react";

import Icon from "../Icon.jsx";

import {
  loadAdminBills,
  formatCurrency,
  formatDate,
  formatTime,
  printAdminBill,
  printAdminBillsReport,
} from "./AdminFunctions.js";


const AdminBills = () => {

  const [bills, setBills] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [billNumber, setBillNumber] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [
    selectedBill,
    setSelectedBill,
  ] =
    useState(null);


  /* =========================================================
     LOAD BILLS
     ========================================================= */

  const loadBills =
    async ({
      number = billNumber,
      from = fromDate,
      to = toDate,
    } = {}) => {

      try {

        setLoading(true);

        setError("");


        const response =
          await loadAdminBills({
            billNumber:
              number,

            from,

            to,
          });


        setBills(
          Array.isArray(
            response?.bills
          )
            ? response.bills
            : []
        );

      } catch (
        requestError
      ) {

        console.error(
          "Admin bills error:",
          requestError
        );


        setError(
          requestError?.message ||
            "Unable to load bills"
        );

      } finally {

        setLoading(false);

      }

    };


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {

    loadBills({
      number: "",
      from: "",
      to: "",
    });

  }, []);


  /* =========================================================
     SEARCH
     ========================================================= */

  const handleSearch =
    (event) => {

      event.preventDefault();


      if (
        fromDate &&
        toDate &&
        fromDate > toDate
      ) {

        setError(
          "From date cannot be after To date."
        );

        return;

      }


      loadBills();

    };


  /* =========================================================
     CLEAR FILTERS
     ========================================================= */

  const clearFilters =
    () => {

      setBillNumber("");

      setFromDate("");

      setToDate("");

      setSelectedBill(
        null
      );


      loadBills({
        number: "",
        from: "",
        to: "",
      });

    };


  /* =========================================================
     PRINT ONE BILL
     ========================================================= */

  const handlePrintBill =
    (bill) => {

      printAdminBill(
        bill
      );

    };


  /* =========================================================
     PRINT ALL CURRENT FILTERED BILLS
     ========================================================= */

  const handlePrintAllBills =
    () => {

      if (
        bills.length === 0
      ) {
        return;
      }


      printAdminBillsReport(
        bills,
        fromDate,
        toDate
      );

    };


  return (

    <section className="admin-bills-page">


      {/* =====================================================
          PAGE HEADING
          ===================================================== */}

      <div className="admin-page-heading">

        <div>

          <span>
            TRANSACTION HISTORY
          </span>


          <h2>
            Bills
          </h2>


          <p>
            Search, review and print
            historical restaurant
            transactions.
          </p>

        </div>

      </div>


      {/* =====================================================
          FILTERS
          ===================================================== */}

      <form
        className="admin-bill-filters"
        onSubmit={
          handleSearch
        }
      >


        {/* BILL NUMBER */}

        <label>

          <span>
            BILL NUMBER
          </span>


          <div className="admin-search-input">

            <Icon
              name="search"
              size={16}
            />


            <input
              value={
                billNumber
              }
              onChange={(
                event
              ) =>
                setBillNumber(
                  event.target
                    .value
                )
              }
              placeholder="KF-..."
            />

          </div>

        </label>


        {/* FROM DATE */}

        <label>

          <span>
            FROM DATE
          </span>


          <input
            type="date"
            value={
              fromDate
            }
            max={
              toDate ||
              undefined
            }
            onChange={(
              event
            ) =>
              setFromDate(
                event.target
                  .value
              )
            }
          />

        </label>


        {/* TO DATE */}

        <label>

          <span>
            TO DATE
          </span>


          <input
            type="date"
            value={
              toDate
            }
            min={
              fromDate ||
              undefined
            }
            onChange={(
              event
            ) =>
              setToDate(
                event.target
                  .value
              )
            }
          />

        </label>


        {/* FILTER ACTIONS */}

        <div className="admin-filter-actions">

          <button
            type="submit"
            className="admin-primary-button"
            disabled={
              loading
            }
          >

            <Icon
              name="search"
              size={15}
            />


            {loading
              ? "Searching..."
              : "Search"}

          </button>


          <button
            type="button"
            className="admin-secondary-button"
            onClick={
              clearFilters
            }
            disabled={
              loading
            }
          >

            Clear

          </button>

        </div>

      </form>


      {/* =====================================================
          FILTERED BILL TOOLBAR
          ===================================================== */}

      <div className="admin-bills-toolbar">

        <div>

          <strong>
            {bills.length}
            {" "}
            {bills.length === 1
              ? "Bill"
              : "Bills"}
          </strong>


          <span>

            {fromDate &&
            toDate
              ? `${formatDate(
                  `${fromDate}T00:00:00`
                )} - ${formatDate(
                  `${toDate}T00:00:00`
                )}`

              : fromDate
                ? `From ${formatDate(
                    `${fromDate}T00:00:00`
                  )}`

                : toDate
                  ? `Until ${formatDate(
                      `${toDate}T00:00:00`
                    )}`

                  : "All historical bills"}

          </span>

        </div>


        <button
          type="button"
          className="admin-primary-button"
          onClick={
            handlePrintAllBills
          }
          disabled={
            loading ||
            bills.length === 0
          }
        >

          <Icon
            name="printer"
            size={16}
          />

          Print All Bills

        </button>

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
          BILL LIST
          ===================================================== */}

      {loading ? (

        <div className="admin-loading">

          Loading bills...

        </div>

      ) : bills.length === 0 ? (

        <div className="admin-empty-state">

          <Icon
            name="receipt"
            size={28}
          />


          <h3>
            No bills found
          </h3>


          <p>
            Try another bill
            number or date range.
          </p>

        </div>

      ) : (

        <div className="admin-bills-list">

          {bills.map(
            (bill) => (

              <article
                className="admin-bill-card"
                key={
                  bill._id
                }
              >


                {/* CARD HEADER */}

                <div className="admin-bill-card-top">

                  <div>

                    <span>
                      BILL
                    </span>


                    <h3>
                      {bill.billNumber}
                    </h3>

                  </div>


                  <span
                    className={`admin-bill-status ${
                      String(
                        bill.status ||
                          ""
                      ).toLowerCase()
                    }`}
                  >

                    {bill.status}

                  </span>

                </div>


                {/* BILL META */}

                <div className="admin-bill-meta">


                  <div>

                    <span>
                      TABLE
                    </span>


                    <strong>

                      {bill.tableNumber ||
                        bill.tableId
                          ?.tableNumber ||
                        "—"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      WAITER
                    </span>


                    <strong>

                      {bill.waiterId
                        ?.name ||
                        "—"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      DATE
                    </span>


                    <strong>

                      {formatDate(
                        bill.createdAt
                      )}

                    </strong>

                  </div>


                  <div>

                    <span>
                      TIME
                    </span>


                    <strong>

                      {formatTime(
                        bill.createdAt
                      )}

                    </strong>

                  </div>


                </div>


                {/* TOTAL */}

                <div className="admin-bill-total">

                  <span>
                    TOTAL
                  </span>


                  <strong>

                    {formatCurrency(
                      bill.totalAmount
                    )}

                  </strong>

                </div>


                {/* ACTIONS */}

                <div className="admin-bill-actions">

                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() =>
                      setSelectedBill(
                        bill
                      )
                    }
                  >

                    View Bill

                  </button>


                  <button
                    type="button"
                    className="admin-primary-button"
                    onClick={() =>
                      handlePrintBill(
                        bill
                      )
                    }
                  >

                    <Icon
                      name="printer"
                      size={15}
                    />

                    Print

                  </button>

                </div>


              </article>

            )
          )}

        </div>

      )}


      {/* =====================================================
          BILL DETAIL MODAL
          ===================================================== */}

      {selectedBill && (

        <div
          className="admin-modal-backdrop"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              setSelectedBill(
                null
              );

            }

          }}
        >

          <div className="admin-bill-modal">


            {/* MODAL HEADER */}

            <div className="admin-modal-heading">

              <div>

                <span>
                  HISTORICAL BILL
                </span>


                <h2>
                  {
                    selectedBill
                      .billNumber
                  }
                </h2>

              </div>


              <button
                type="button"
                className="admin-modal-close"
                onClick={() =>
                  setSelectedBill(
                    null
                  )
                }
              >

                <Icon
                  name="close"
                  size={18}
                />

              </button>

            </div>


            {/* MODAL META */}

            <div className="admin-detail-meta">


              <div>

                <span>
                  TABLE
                </span>


                <strong>

                  {selectedBill
                    .tableNumber ||
                    selectedBill
                      .tableId
                      ?.tableNumber ||
                    "—"}

                </strong>

              </div>


              <div>

                <span>
                  WAITER
                </span>


                <strong>

                  {selectedBill
                    .waiterId
                    ?.name ||
                    "—"}

                </strong>

              </div>


              <div>

                <span>
                  PAYMENT
                </span>


                <strong>

                  {selectedBill
                    .paymentMethod ||
                    selectedBill
                      .paymentStatus ||
                    "—"}

                </strong>

              </div>


            </div>


            {/* ITEMS */}

            <div className="admin-bill-items">

              {(
                Array.isArray(
                  selectedBill.items
                )
                  ? selectedBill.items
                  : []
              ).map(
                (
                  item,
                  index
                ) => (

                  <div
                    className="admin-bill-item"
                    key={
                      `${
                        item.name
                      }-${index}`
                    }
                  >

                    <div>

                      <strong>
                        {
                          item.name
                        }
                      </strong>


                      <span>

                        Qty
                        {" "}
                        {
                          item.quantity
                        }

                        {" · "}

                        {formatCurrency(
                          item.unitPrice
                        )}
                        {" each"}

                      </span>

                    </div>


                    <strong>

                      {formatCurrency(
                        item.totalPrice ??
                          Number(
                            item.quantity ||
                              0
                          ) *
                            Number(
                              item.unitPrice ||
                                0
                            )
                      )}

                    </strong>

                  </div>

                )
              )}

            </div>


            {/* MODAL TOTAL */}

            <div className="admin-bill-modal-total">

              <span>
                TOTAL
              </span>


              <strong>

                {formatCurrency(
                  selectedBill
                    .totalAmount
                )}

              </strong>

            </div>


            {/* PRINT */}

            <button
              type="button"
              className="admin-primary-button admin-full-button"
              onClick={() =>
                handlePrintBill(
                  selectedBill
                )
              }
            >

              <Icon
                name="printer"
                size={16}
              />

              Print Bill

            </button>


          </div>

        </div>

      )}


    </section>

  );

};


export default AdminBills;