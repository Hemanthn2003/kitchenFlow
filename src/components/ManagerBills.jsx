import React, { useMemo, useState } from "react";
import Icon from "./Icon.jsx";
const API_BASE = "http://localhost:5000";

const ManagerBills = ({
  bills = [],
  loading = false,
  onRefresh,
  onGenerate,
  onPay,
}) => {
  const [selectedMethod, setSelectedMethod] = useState({});
  const [upiBill, setUpiBill] = useState(null);
  const [processingId, setProcessingId] = useState("");
  const [message, setMessage] = useState("");

  const getBillId = (bill) =>
    bill?._id ||
    bill?.id ||
    bill?.billId ||
    "";

  const getTableNumber = (bill) =>
    bill?.tableId?.tableNumber ??
    bill?.tableNumber ??
    bill?.table?.tableNumber ??
    "—";

  const getWaiterName = (bill) =>
    bill?.waiterId?.name ||
    bill?.waiter?.name ||
    "Waiter";

  const getItems = (bill) => {
    if (Array.isArray(bill?.items)) {
      return bill.items;
    }

    if (Array.isArray(bill?.orderItems)) {
      return bill.orderItems;
    }

    return [];
  };

  const getItemName = (item) =>
    item?.name ||
    item?.menuItemName ||
    item?.menuItem?.name ||
    "Menu Item";

  const getItemQuantity = (item) =>
    Number(
      item?.quantity ??
      item?.qty ??
      1
    );

  const getItemPrice = (item) =>
    Number(
      item?.price ??
      item?.unitPrice ??
      item?.menuItem?.price ??
      0
    );

  const getBillTotal = (bill) => {
    const value =
      bill?.totalAmount ??
      bill?.total ??
      bill?.grandTotal ??
      bill?.amount;

    if (value !== undefined && value !== null) {
      return Number(value) || 0;
    }

    return getItems(bill).reduce(
      (sum, item) =>
        sum +
        getItemPrice(item) *
          getItemQuantity(item),
      0
    );
  };

  const getBillStatus = (bill) =>
    String(
      bill?.paymentStatus ||
      bill?.status ||
      "UNPAID"
    ).toUpperCase();

  const isPaid = (bill) =>
    getBillStatus(bill) === "PAID";

  const isGenerated = (bill) =>
    String(bill?.status || "").toUpperCase() ===
    "GENERATED";

  const unpaidBills = useMemo(
    () =>
      bills.filter(
        (bill) => !isPaid(bill)
      ),
    [bills]
  );

  const paidBills = useMemo(() => {
    const cutoff =
      Date.now() -
      30 * 24 * 60 * 60 * 1000;

    return bills
      .filter((bill) => {
        if (!isPaid(bill)) return false;

        const dateValue =
          bill?.paidAt ||
          bill?.updatedAt ||
          bill?.createdAt;

        if (!dateValue) return true;

        const date =
          new Date(dateValue).getTime();

        return (
          Number.isNaN(date) ||
          date >= cutoff
        );
      })
      .sort(
        (a, b) =>
          new Date(
            b?.paidAt ||
              b?.updatedAt ||
              b?.createdAt ||
              0
          ) -
          new Date(
            a?.paidAt ||
              a?.updatedAt ||
              a?.createdAt ||
              0
          )
      );
  }, [bills]);

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const handleMethodChange = (
    bill,
    method
  ) => {
    const billId = getBillId(bill);

    setSelectedMethod((previous) => ({
      ...previous,
      [billId]: method,
    }));
  };

  const handleGenerate = async (bill) => {
    const billId = getBillId(bill);

    if (!billId) {
      setMessage("Bill ID is missing.");
      return;
    }

    try {
      setMessage("");
      setProcessingId(`generate-${billId}`);

      if (onGenerate) {
        await onGenerate(bill);
      } else {
        const response = await fetch(
          `${API_BASE}/api/manager/bills/${billId}/generate`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to generate bill."
          );
        }
      }

      setMessage("Bill generated successfully.");

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error(
        "Generate bill error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to generate bill."
      );
    } finally {
      setProcessingId("");
    }
  };

  const handlePay = async (
    bill,
    method,
    closeUpi = false
  ) => {
    const billId = getBillId(bill);

    if (!billId) {
      setMessage("Bill ID is missing.");
      return;
    }

    try {
      setMessage("");
      setProcessingId(`pay-${billId}`);

      if (onPay) {
        await onPay(bill, method);
      } else {
        const response = await fetch(
          `${API_BASE}/api/manager/bills/${billId}/pay`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              paymentMethod: method,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to mark bill as paid."
          );
        }
      }

      setMessage(
        `Payment received via ${method}.`
      );

      if (closeUpi) {
        setUpiBill(null);
      }

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to mark bill as paid."
      );
    } finally {
      setProcessingId("");
    }
  };

  const handlePaymentClick = (
    bill
  ) => {
    const billId = getBillId(bill);
    const method =
      selectedMethod[billId] || "CASH";

    if (method === "UPI") {
      setUpiBill(bill);
      return;
    }

    handlePay(bill, method);
  };

  const handlePrint = (bill) => {
    const tableNumber =
      getTableNumber(bill);

    const waiterName =
      getWaiterName(bill);

    const items = getItems(bill);

    const total =
      getBillTotal(bill);

    const paymentMethod =
      bill?.paymentMethod || "—";

    const billDate =
      bill?.paidAt ||
      bill?.updatedAt ||
      bill?.createdAt;

    const itemRows = items
      .map((item) => {
        const name = getItemName(item);
        const quantity =
          getItemQuantity(item);
        const price =
          getItemPrice(item);
        const amount =
          quantity * price;

        return `
          <tr>
            <td>${escapeHtml(name)}</td>
            <td>${quantity}</td>
            <td>₹${price.toFixed(2)}</td>
            <td>₹${amount.toFixed(2)}</td>
          </tr>
        `;
      })
      .join("");

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=850,height=900"
      );

    if (!printWindow) {
      setMessage(
        "Please allow pop-ups to print the bill."
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KitchenFlow Bill</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family:
                "Inter",
                "Segoe UI",
                Arial,
                sans-serif;
              color: #111827;
              background: #ffffff;
            }

            .bill {
              max-width: 760px;
              margin: 0 auto;
            }

            .header {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding-bottom: 22px;
              border-bottom: 2px solid #d9ad45;
            }

            .brand {
              font-family:
                Georgia,
                "Times New Roman",
                serif;
              font-size: 30px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }

            .subtitle {
              margin-top: 5px;
              color: #64748b;
              font-size: 13px;
            }

            .bill-meta {
              text-align: right;
              font-size: 13px;
              line-height: 1.8;
            }

            .customer {
              display: grid;
              grid-template-columns:
                repeat(2, 1fr);
              gap: 12px;
              margin: 25px 0;
            }

            .meta-box {
              padding: 13px 15px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
            }

            .meta-label {
              display: block;
              margin-bottom: 4px;
              color: #64748b;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.7px;
            }

            .meta-value {
              font-weight: 700;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 18px;
            }

            th {
              padding: 12px 10px;
              background: #0b356d;
              color: white;
              text-align: left;
              font-size: 12px;
            }

            td {
              padding: 12px 10px;
              border-bottom:
                1px solid #e2e8f0;
              font-size: 13px;
            }

            .summary {
              width: 300px;
              margin: 25px 0 0 auto;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }

            .total {
              margin-top: 7px;
              padding-top: 14px;
              border-top: 2px solid #0b356d;
              font-size: 20px;
              font-weight: 800;
            }

            .paid {
              margin-top: 30px;
              padding: 12px;
              border: 1px solid #22c55e;
              border-radius: 8px;
              color: #15803d;
              background: #f0fdf4;
              text-align: center;
              font-weight: 800;
            }

            .footer {
              margin-top: 35px;
              padding-top: 18px;
              border-top:
                1px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 12px;
            }

            @media print {
              body {
                padding: 15px;
              }
            }
          </style>
        </head>

        <body>
          <div class="bill">

            <div class="header">
              <div>
                <div class="brand">
                  KitchenFlow
                </div>

                <div class="subtitle">
                  Restaurant Management System
                </div>
              </div>

              <div class="bill-meta">
                <strong>PAID BILL</strong><br />
                ${formatDate(billDate)}<br />
                ${formatTime(billDate)}
              </div>
            </div>

            <div class="customer">
              <div class="meta-box">
                <span class="meta-label">
                  Table
                </span>

                <span class="meta-value">
                  Table ${escapeHtml(
                    String(tableNumber)
                  )}
                </span>
              </div>

              <div class="meta-box">
                <span class="meta-label">
                  Waiter
                </span>

                <span class="meta-value">
                  ${escapeHtml(
                    waiterName
                  )}
                </span>
              </div>

              <div class="meta-box">
                <span class="meta-label">
                  Payment Method
                </span>

                <span class="meta-value">
                  ${escapeHtml(
                    paymentMethod
                  )}
                </span>
              </div>

              <div class="meta-box">
                <span class="meta-label">
                  Bill ID
                </span>

                <span class="meta-value">
                  ${escapeHtml(
                    String(
                      getBillId(bill)
                    )
                  )}
                </span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                ${
                  itemRows ||
                  `
                    <tr>
                      <td colspan="4">
                        No item details available
                      </td>
                    </tr>
                  `
                }
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <strong>
                  ${formatCurrency(total)}
                </strong>
              </div>

              <div class="summary-row total">
                <span>Total</span>
                <strong>
                  ${formatCurrency(total)}
                </strong>
              </div>
            </div>

            <div class="paid">
              PAYMENT COMPLETED
            </div>

            <div class="footer">
              Thank you for dining with
              KitchenFlow.
            </div>

          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const renderItems = (bill) => {
    const items = getItems(bill);

    if (!items.length) {
      return (
        <div className="manager-bill-no-items">
          <Icon
            name="menuItems"
            size={22}
          />
          <span>No item details available</span>
        </div>
      );
    }

    return (
      <div className="manager-bill-items">
        {items.map((item, index) => {
          const quantity =
            getItemQuantity(item);

          const price =
            getItemPrice(item);

          return (
            <div
              className="manager-bill-item"
              key={
                item?._id ||
                item?.id ||
                `${getItemName(item)}-${index}`
              }
            >
              <div className="manager-bill-item-info">
                <strong>
                  {getItemName(item)}
                </strong>

                <span>
                  {quantity} ×{" "}
                  {formatCurrency(price)}
                </span>
              </div>

              <strong className="manager-bill-item-total">
                {formatCurrency(
                  quantity * price
                )}
              </strong>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPaymentOptions = (
    bill
  ) => {
    const billId = getBillId(bill);

    const currentMethod =
      selectedMethod[billId] || "CASH";

    return (
      <div className="manager-payment-section">
        <div className="manager-payment-label">
          <span>
            Payment Method
          </span>

          <small>
            Select one
          </small>
        </div>

        <div className="manager-payment-options">
          {["CASH", "CARD", "UPI"].map(
            (method) => (
              <button
                type="button"
                key={method}
                className={`manager-payment-option ${
                  currentMethod === method
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleMethodChange(
                    bill,
                    method
                  )
                }
              >
                <span className="manager-payment-icon">
                  <Icon
                    name={
                      method === "CASH"
                        ? "cash"
                        : method === "CARD"
                          ? "creditCard"
                          : "upi"
                    }
                    size={22}
                  />
                </span>

                <span>
                  {method}
                </span>

                {currentMethod ===
                  method && (
                  <span className="manager-payment-check">
                    <Icon
                      name="check"
                      size={14}
                    />
                  </span>
                )}
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  const renderUnpaidBill = (
    bill
  ) => {
    const billId = getBillId(bill);

    const generated =
      isGenerated(bill);

    const total =
      getBillTotal(bill);

    return (
      <article
        className="manager-bill-card unpaid-card"
        key={billId}
      >
        <div className="manager-bill-card-glow" />

        <div className="manager-bill-card-top">
          <div className="manager-bill-table-icon">
            <Icon
              name="table"
              size={30}
            />
          </div>

          <div className="manager-bill-heading">
            <span className="manager-bill-eyebrow">
              BILL REQUEST
            </span>

            <h3>
              Table {getTableNumber(bill)}
            </h3>

            <p>
              {getWaiterName(bill)}
            </p>
          </div>

          <span className="manager-bill-status pending">
            <span />
            {generated
              ? "GENERATED"
              : "UNPAID"}
          </span>
        </div>

        <div className="manager-bill-divider" />

        <div className="manager-bill-date">
          <Icon
            name="clock"
            size={16}
          />

          <span>
            {formatDate(
              bill?.checkoutAt ||
                bill?.createdAt
            )}

            {formatTime(
              bill?.checkoutAt ||
                bill?.createdAt
            ) && (
              <>
                {" · "}
                {formatTime(
                  bill?.checkoutAt ||
                    bill?.createdAt
                )}
              </>
            )}
          </span>
        </div>

        <div className="manager-bill-items-title">
          <span>ORDER ITEMS</span>

          <span>
            {getItems(bill).length}{" "}
            {getItems(bill).length === 1
              ? "item"
              : "items"}
          </span>
        </div>

        {renderItems(bill)}

        <div className="manager-bill-total-box">
          <div>
            <span>Total Amount</span>
            <small>Including all items</small>
          </div>

          <strong>
            {formatCurrency(total)}
          </strong>
        </div>

        {!generated &&
          renderPaymentOptions(bill)}

        {generated &&
          renderPaymentOptions(bill)}

        <div className="manager-bill-actions">
          {!generated ? (
            <button
              type="button"
              className="manager-primary-button"
              disabled={
                processingId ===
                `generate-${billId}`
              }
              onClick={() =>
                handleGenerate(bill)
              }
            >
              <Icon
                name="plus"
                size={19}
              />

              <span>
                {processingId ===
                `generate-${billId}`
                  ? "Generating..."
                  : "Generate Bill"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="manager-primary-button"
              disabled={
                processingId ===
                `pay-${billId}`
              }
              onClick={() =>
                handlePaymentClick(bill)
              }
            >
              <Icon
                name="check"
                size={19}
              />

              <span>
                {processingId ===
                `pay-${billId}`
                  ? "Processing..."
                  : "Mark Paid"}
              </span>
            </button>
          )}
        </div>
      </article>
    );
  };

  const renderPaidBill = (
    bill
  ) => {
    const billId = getBillId(bill);

    return (
      <article
        className="manager-bill-card paid-card"
        key={billId}
      >
        <div className="manager-bill-card-top">
          <div className="manager-bill-table-icon paid">
            <Icon
              name="check"
              size={28}
            />
          </div>

          <div className="manager-bill-heading">
            <span className="manager-bill-eyebrow">
              COMPLETED BILL
            </span>

            <h3>
              Table {getTableNumber(bill)}
            </h3>

            <p>
              {getWaiterName(bill)}
            </p>
          </div>

          <span className="manager-bill-status paid">
            <Icon
              name="check"
              size={13}
            />
            PAID
          </span>
        </div>

        <div className="manager-bill-divider" />

        <div className="manager-paid-meta">
          <div>
            <span>Paid On</span>

            <strong>
              {formatDate(
                bill?.paidAt ||
                  bill?.updatedAt ||
                  bill?.createdAt
              )}
            </strong>
          </div>

          <div>
            <span>Method</span>

            <strong>
              {bill?.paymentMethod ||
                "—"}
            </strong>
          </div>
        </div>

        <div className="manager-bill-items-title">
          <span>ORDER ITEMS</span>

          <span>
            {getItems(bill).length}{" "}
            {getItems(bill).length === 1
              ? "item"
              : "items"}
          </span>
        </div>

        {renderItems(bill)}

        <div className="manager-bill-total-box paid-total">
          <div>
            <span>Amount Paid</span>
            <small>
              Payment completed
            </small>
          </div>

          <strong>
            {formatCurrency(
              getBillTotal(bill)
            )}
          </strong>
        </div>

        <div className="manager-bill-actions">
          <button
            type="button"
            className="manager-print-button"
            onClick={() =>
              handlePrint(bill)
            }
          >
            <Icon
              name="orders"
              size={19}
            />

            <span>
              Print Bill
            </span>
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="manager-bills-page">
      <div className="manager-bills-hero">
        <div>
          <span className="manager-section-kicker">
            FINANCIAL CONTROL
          </span>

          <h1>Bills</h1>

          <p>
            Manage checkout requests,
            payments and completed
            restaurant bills.
          </p>
        </div>

        <button
          type="button"
          className="manager-refresh-button"
          onClick={() => onRefresh?.()}
          disabled={loading}
        >
          <Icon
            name="refresh"
            size={20}
          />

          <span>
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>
      </div>

      {message && (
        <div className="manager-bill-message">
          <Icon
            name="activity"
            size={18}
          />

          <span>{message}</span>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >
            <Icon
              name="close"
              size={15}
            />
          </button>
        </div>
      )}

      <div className="manager-bill-section-head">
        <div>
          <span className="manager-section-kicker">
            NEEDS ATTENTION
          </span>

          <h2>Unpaid Bills</h2>
        </div>

        <div className="manager-bill-count">
          {unpaidBills.length}
        </div>
      </div>

      {loading &&
      !unpaidBills.length ? (
        <div className="manager-bill-grid">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              className="manager-bill-skeleton"
              key={index}
            >
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          ))}
        </div>
      ) : unpaidBills.length ? (
        <div className="manager-bill-grid">
          {unpaidBills.map(
            renderUnpaidBill
          )}
        </div>
      ) : (
        <div className="manager-bill-empty">
          <div className="manager-bill-empty-icon">
            <Icon
              name="check"
              size={38}
            />
          </div>

          <h3>All bills are clear</h3>

          <p>
            There are no unpaid bills
            waiting for payment.
          </p>
        </div>
      )}

      <div className="manager-bill-section-head paid-section-head">
        <div>
          <span className="manager-section-kicker">
            LAST 30 DAYS
          </span>

          <h2>Paid Bills</h2>
        </div>

        <div className="manager-bill-count completed">
          {paidBills.length}
        </div>
      </div>

      {paidBills.length ? (
        <div className="manager-bill-grid">
          {paidBills.map(
            renderPaidBill
          )}
        </div>
      ) : (
        <div className="manager-bill-empty">
          <div className="manager-bill-empty-icon muted">
            <Icon
              name="orders"
              size={36}
            />
          </div>

          <h3>No paid bills yet</h3>

          <p>
            Completed bills from the
            last 30 days will appear
            here.
          </p>
        </div>
      )}

      {upiBill && (
        <div
          className="manager-upi-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setUpiBill(null);
            }
          }}
        >
          <div className="manager-upi-modal">
            <button
              type="button"
              className="manager-upi-close"
              onClick={() =>
                setUpiBill(null)
              }
            >
              <Icon
                name="close"
                size={21}
              />
            </button>

            <div className="manager-upi-icon">
              <Icon
                name="menuItems"
                size={32}
              />
            </div>

            <span className="manager-section-kicker">
              UPI PAYMENT
            </span>

            <h2>Scan & Pay</h2>

            <p>
              Use your preferred UPI
              application to complete
              payment.
            </p>

            <div className="manager-qr">
              <div className="manager-qr-inner">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="manager-qr-center">
                <Icon
                  name="orders"
                  size={24}
                />
              </div>
            </div>

            <div className="manager-upi-amount">
              <span>Amount to Pay</span>

              <strong>
                {formatCurrency(
                  getBillTotal(upiBill)
                )}
              </strong>
            </div>

            <div className="manager-upi-note">
              <Icon
                name="activity"
                size={17}
              />

              <span>
                After receiving payment,
                confirm it below.
              </span>
            </div>

            <button
              type="button"
              className="manager-upi-paid-button"
              disabled={
                processingId ===
                `pay-${getBillId(
                  upiBill
                )}`
              }
              onClick={() =>
                handlePay(
                  upiBill,
                  "UPI",
                  true
                )
              }
            >
              <Icon
                name="check"
                size={19}
              />

              <span>
                {processingId ===
                `pay-${getBillId(upiBill)}`
                  ? "Confirming Payment..."
                  : "Payment Received · Mark Paid"}
              </span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

export default ManagerBills;