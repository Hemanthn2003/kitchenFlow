import React from "react";
import Icon from "./Icon.jsx";
import { formatDate } from "./waiterFunctions.js";

const WaiterBillsPage = ({
  bills,
  loading,
  billDate,
  billNumber,
  setBillDate,
  setBillNumber,
  onSearch,
  onReset,
}) => {
  return (
    <section className="manager-content waiter-content-section">
      <div className="page-heading">
        <div>
          <span>
            BILL HISTORY
          </span>

          <h1>
            My{" "}
            <strong>
              Bills
            </strong>
          </h1>

          <p>
            View bills created
            from your served
            tables.
          </p>
        </div>
      </div>

      <div className="waiter-bill-filter">
        <div className="waiter-filter-field">
          <label>
            <Icon
              name="clock"
              size={16}
            />

            Date
          </label>

          <input
            type="date"
            value={billDate}
            onChange={(event) =>
              setBillDate(
                event.target.value
              )
            }
          />
        </div>

        <div className="waiter-filter-field bill-number-field">
          <label>
            <Icon
              name="orders"
              size={16}
            />

            Bill Number
          </label>

          <input
            type="text"
            placeholder="Enter bill number"
            value={
              billNumber
            }
            onChange={(
              event
            ) =>
              setBillNumber(
                event.target.value
              )
            }
          />
        </div>

        <button
          type="button"
          className="waiter-primary-button"
          onClick={
            onSearch
          }
        >
          <Icon
            name="orders"
            size={18}
          />

          Find Bills
        </button>

        <button
          type="button"
          className="waiter-outline-button"
          onClick={
            onReset
          }
        >
          Reset
        </button>
      </div>

      {loading ? (
        <div className="waiter-loading">
          Loading bills...
        </div>
      ) : bills.length ===
        0 ? (
        <div className="waiter-empty-state">
          <Icon
            name="orders"
            size={44}
          />

          <h3>
            No Bills Found
          </h3>

          <p>
            Try changing the
            date or bill
            number.
          </p>
        </div>
      ) : (
        <div className="waiter-bill-grid">
          {bills.map(
            (bill) => (
              <div
                key={
                  bill._id
                }
                className="waiter-bill-card"
              >
                <div className="waiter-bill-card-top">
                  <div>
                    <span>
                      BILL NO.
                    </span>

                    <h3>
                      {
                        bill.billNumber
                      }
                    </h3>
                  </div>

                  <div className="waiter-bill-status">
                    {
                      bill.status
                    }
                  </div>
                </div>

                <div className="waiter-bill-table-info">
                  <Icon
                    name="table"
                    size={17}
                  />

                  Table{" "}
                  <strong>
                    {
                      bill.tableNumber
                    }
                  </strong>
                </div>

                <div className="waiter-bill-items">
                  {bill.items?.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`${bill._id}-${index}`}
                      >
                        <span>
                          {
                            item.name
                          }

                          <small>
                            {" "}
                            ×{" "}
                            {
                              item.quantity
                            }
                          </small>
                        </span>

                        <strong>
                          ₹
                          {Number(
                            item.totalPrice
                          ).toFixed(
                            2
                          )}
                        </strong>
                      </div>
                    )
                  )}
                </div>

                <div className="waiter-bill-total">
                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      bill.totalAmount
                    ).toFixed(
                      2
                    )}
                  </strong>
                </div>

                <div className="waiter-bill-footer">
                  <span>
                    Payment
                  </span>

                  <strong>
                    {
                      bill.paymentStatus
                    }
                  </strong>
                </div>

                <div className="waiter-bill-date">
                  {formatDate(
                    bill.createdAt
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
};

export default WaiterBillsPage;