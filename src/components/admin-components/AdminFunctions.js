// ============================================================
// ADMIN FUNCTIONS
// KitchenFlow Admin dashboard API functions
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL;


/* ============================================================
   CLOUDINARY
   ============================================================ */

const CLOUDINARY_CLOUD_NAME =
  "g0silssv";

const CLOUDINARY_UPLOAD_PRESET =
  "pizzaDemo";

const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


/* ============================================================
   GENERIC REQUEST
   ============================================================ */

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const response =
    await fetch(
      `${API_URL}/api${endpoint}`,
      {
        credentials: "include",

        ...options,

        headers: {
          "Content-Type":
            "application/json",

          ...(options.headers || {}),
        },
      }
    );

  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Admin request failed"
    );
  }

  return data;
};


/* ============================================================
   ADMIN PROFILE
   ============================================================ */

export const loadAdminProfile =
  async () => {
    return await apiRequest(
      "/admin/me"
    );
  };


/* ============================================================
   USERS
   ============================================================ */

export const loadAdminUsers =
  async () => {
    return await apiRequest(
      "/admin/users"
    );
  };


export const addAdminUser =
  async (userData) => {
    return await apiRequest(
      "/admin/users",
      {
        method: "POST",

        body:
          JSON.stringify(
            userData
          ),
      }
    );
  };


export const editAdminUser =
  async (
    userId,
    userData
  ) => {
    return await apiRequest(
      `/admin/users/${userId}`,
      {
        method: "PATCH",

        body:
          JSON.stringify(
            userData
          ),
      }
    );
  };


export const changeAdminUserRole =
  async (
    userId,
    role
  ) => {
    return await apiRequest(
      `/admin/users/${userId}/role`,
      {
        method: "PATCH",

        body:
          JSON.stringify({
            role,
          }),
      }
    );
  };


export const fireAdminUser =
  async (userId) => {
    return await apiRequest(
      `/admin/users/${userId}`,
      {
        method: "DELETE",
      }
    );
  };


/* ============================================================
   USER IMAGE UPLOAD
   ============================================================ */

export const uploadAdminUserImage =
  async (file) => {
    if (!file) {
      return "";
    }

    if (
      !file.type?.startsWith(
        "image/"
      )
    ) {
      throw new Error(
        "Please select a valid image file."
      );
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      throw new Error(
        "Image must be smaller than 5 MB."
      );
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET
    );

    formData.append(
      "folder",
      "kitchenflow/users"
    );

    const response =
      await fetch(
        CLOUDINARY_UPLOAD_URL,
        {
          method: "POST",
          body: formData,
        }
      );

    let data = {};

    try {
      data =
        await response.json();
    } catch {
      data = {};
    }

    if (
      !response.ok ||
      !data?.secure_url
    ) {
      throw new Error(
        data?.error?.message ||
          "Cloudinary image upload failed."
      );
    }

    return data.secure_url;
  };


/* ============================================================
   BILLS
   ============================================================ */

export const loadAdminBills =
  async ({
    billNumber = "",
    date = "",
    from = "",
    to = "",
  } = {}) => {
    const params =
      new URLSearchParams();

    if (billNumber.trim()) {
      params.set(
        "billNumber",
        billNumber
          .trim()
          .toUpperCase()
      );
    }

    if (date) {
      params.set(
        "date",
        date
      );
    }

    if (from) {
      params.set(
        "from",
        from
      );
    }

    if (to) {
      params.set(
        "to",
        to
      );
    }

    const query =
      params.toString();

    return await apiRequest(
      `/admin/bills${
        query
          ? `?${query}`
          : ""
      }`
    );
  };


/* ============================================================
   SALES ANALYTICS
   ============================================================ */

export const loadSalesAnalytics =
  async ({
    period = "week",
    start = "",
    end = "",
  } = {}) => {
    const params =
      new URLSearchParams();

    params.set(
      "period",
      period
    );

    if (
      period === "custom"
    ) {
      if (start) {
        params.set(
          "start",
          start
        );
      }

      if (end) {
        params.set(
          "end",
          end
        );
      }
    }

    const query =
      params.toString();

    return await apiRequest(
      `/admin/analytics/sales?${query}`
    );
  };


/* ============================================================
   POPULAR DISH ANALYTICS
   ============================================================ */

export const loadPopularDishes =
  async ({
    category = "ALL",
    start = "",
    end = "",
  } = {}) => {
    const params =
      new URLSearchParams();

    if (category) {
      params.set(
        "category",
        category
      );
    }

    if (start) {
      params.set(
        "start",
        start
      );
    }

    if (end) {
      params.set(
        "end",
        end
      );
    }

    const query =
      params.toString();

    return await apiRequest(
      `/admin/analytics/popular-dishes${
        query
          ? `?${query}`
          : ""
      }`
    );
  };


/* ============================================================
   TABLE PERFORMANCE
   ============================================================ */

export const loadTablePerformance =
  async () => {
    return await apiRequest(
      "/admin/analytics/table-performance"
    );
  };


/* ============================================================
   LOGOUT
   ============================================================ */

export const adminLogout =
  async () => {
    return await apiRequest(
      "/auth/logout",
      {
        method: "POST",
      }
    );
  };


/* ============================================================
   FORMATTING
   ============================================================ */

export const formatCurrency =
  (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };


export const formatDate =
  (value) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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


export const formatTime =
  (value) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


/* ============================================================
   PRINT HELPERS
   ============================================================ */

const escapeHtml =
  (value) => {
    return String(
      value ?? ""
    )
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
  };


const getBillItems =
  (bill) => {
    if (
      Array.isArray(
        bill?.items
      )
    ) {
      return bill.items;
    }

    if (
      Array.isArray(
        bill?.orderItems
      )
    ) {
      return bill.orderItems;
    }

    return [];
  };


const getTableNumber =
  (bill) => {
    return (
      bill?.tableNumber ||
      bill?.tableId?.tableNumber ||
      "—"
    );
  };


const getWaiterName =
  (bill) => {
    return (
      bill?.waiterId?.name ||
      bill?.waiterName ||
      "—"
    );
  };


const createItemRows =
  (items = []) => {
    return items
      .map(
        (item) => {
          const quantity =
            Number(
              item?.quantity || 0
            );

          const unitPrice =
            Number(
              item?.unitPrice ||
                item?.price ||
                0
            );

          const totalPrice =
            Number(
              item?.totalPrice ??
                quantity *
                  unitPrice
            );

          return `
            <tr>
              <td>
                ${escapeHtml(
                  item?.name ||
                    "Item"
                )}
              </td>

              <td class="center">
                ${quantity}
              </td>

              <td class="right">
                ${formatCurrency(
                  unitPrice
                )}
              </td>

              <td class="right">
                ${formatCurrency(
                  totalPrice
                )}
              </td>
            </tr>
          `;
        }
      )
      .join("");
  };


const getPrintStyles =
  () => {
    return `
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 30px;
        background: #ffffff;
        color: #111827;
        font-family: Arial, Helvetica, sans-serif;
      }

      .bill-page {
        width: 100%;
        max-width: 780px;
        margin: 0 auto;
      }

      .bill-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
        padding-bottom: 20px;
        border-bottom: 2px solid #d9ad45;
      }

      .bill-brand {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 30px;
        font-weight: 700;
      }

      .bill-subtitle {
        margin-top: 5px;
        color: #64748b;
        font-size: 12px;
      }

      .bill-heading {
        color: #0b356d;
        font-size: 15px;
        font-weight: 800;
        text-align: right;
      }

      .bill-heading small {
        display: block;
        margin-top: 5px;
        color: #64748b;
        font-size: 11px;
        font-weight: 400;
        line-height: 1.6;
      }

      .bill-meta {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin: 22px 0;
      }

      .bill-meta-card {
        padding: 12px 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 7px;
      }

      .bill-meta-card span {
        display: block;
        margin-bottom: 4px;
        color: #64748b;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.7px;
      }

      .bill-meta-card strong {
        font-size: 12px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      thead {
        display: table-header-group;
      }

      tfoot {
        display: table-footer-group;
      }

      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      th {
        padding: 10px;
        background: #0b356d;
        color: #ffffff;
        font-size: 10px;
        text-align: left;
      }

      td {
        padding: 10px;
        border-bottom: 1px solid #e2e8f0;
        font-size: 11px;
      }

      .center {
        text-align: center;
      }

      .right {
        text-align: right;
      }

      .bill-total {
        width: 300px;
        max-width: 100%;
        margin: 22px 0 0 auto;
      }

      .bill-total-row {
        display: flex;
        justify-content: space-between;
        padding: 7px 0;
        font-size: 13px;
      }

      .bill-grand-total {
        margin-top: 6px;
        padding-top: 12px;
        border-top: 2px solid #0b356d;
        font-size: 18px;
        font-weight: 800;
      }

      .payment-complete {
        margin-top: 25px;
        padding: 11px;
        border: 1px solid #22c55e;
        border-radius: 7px;
        background: #f0fdf4;
        color: #15803d;
        font-size: 11px;
        font-weight: 800;
        text-align: center;
      }

      .bill-footer {
        margin-top: 28px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
        color: #64748b;
        font-size: 10px;
        text-align: center;
      }

      .report-page {
        width: 100%;
        max-width: 1100px;
        margin: 0 auto;
      }

      .report-summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin: 22px 0;
      }

      .report-summary div {
        padding: 13px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 7px;
      }

      .report-summary span {
        display: block;
        color: #64748b;
        font-size: 9px;
        font-weight: 700;
      }

      .report-summary strong {
        display: block;
        margin-top: 5px;
        font-size: 18px;
      }

      .report-bill {
        margin-top: 28px;
        page-break-inside: auto;
      }

      .report-bill-title {
        display: flex;
        justify-content: space-between;
        gap: 15px;
        padding: 9px 10px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        font-size: 11px;
        font-weight: 700;
      }

      .report-total {
        margin-top: 24px;
        padding-top: 14px;
        border-top: 2px solid #0b356d;
        font-size: 19px;
        font-weight: 800;
        text-align: right;
      }

      @media print {
        body {
          padding: 10px;
        }

        .bill-page,
        .report-page {
          max-width: none;
        }

        thead {
          display: table-header-group;
        }

        tr,
        td,
        th {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }
    `;
  };


const openPrintWindow =
  (
    title,
    html
  ) => {
    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1000,height=950"
      );

    if (!printWindow) {
      return false;
    }

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <meta charset="UTF-8" />

          <title>
            ${escapeHtml(title)}
          </title>

          <style>
            ${getPrintStyles()}
          </style>
        </head>

        <body>
          ${html}
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(
      () => {
        printWindow.print();
      },
      250
    );

    return true;
  };


/* ============================================================
   PRINT INDIVIDUAL BILL

   IMPORTANT:
   createItemRows() maps every item to the SAME HTML row.
   Therefore long bills automatically reuse the row template
   for every order item and continue onto additional pages.
   ============================================================ */

export const printAdminBill =
  (bill) => {
    if (!bill) {
      return false;
    }

    const items =
      getBillItems(
        bill
      );

    const rows =
      createItemRows(
        items
      );

    const total =
      Number(
        bill?.totalAmount || 0
      );

    const billDate =
      bill?.paidAt ||
      bill?.createdAt;

    const html = `
      <main class="bill-page">

        <header class="bill-header">

          <div>
            <h1 class="bill-brand">
              KitchenFlow
            </h1>

            <div class="bill-subtitle">
              Restaurant Management System
            </div>
          </div>

          <div class="bill-heading">
            PAID BILL

            <small>
              ${formatDate(
                billDate
              )}

              <br />

              ${formatTime(
                billDate
              )}
            </small>
          </div>

        </header>


        <section class="bill-meta">

          <div class="bill-meta-card">
            <span>TABLE</span>

            <strong>
              Table ${escapeHtml(
                getTableNumber(
                  bill
                )
              )}
            </strong>
          </div>


          <div class="bill-meta-card">
            <span>WAITER</span>

            <strong>
              ${escapeHtml(
                getWaiterName(
                  bill
                )
              )}
            </strong>
          </div>


          <div class="bill-meta-card">
            <span>PAYMENT METHOD</span>

            <strong>
              ${escapeHtml(
                bill?.paymentMethod ||
                  "—"
              )}
            </strong>
          </div>


          <div class="bill-meta-card">
            <span>BILL ID</span>

            <strong>
              ${escapeHtml(
                bill?.billNumber ||
                  bill?._id ||
                  "—"
              )}
            </strong>
          </div>

        </section>


        <table>

          <thead>
            <tr>
              <th>Item</th>
              <th class="center">Qty</th>
              <th class="right">
                Unit Price
              </th>
              <th class="right">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>

            ${
              rows ||
              `
                <tr>
                  <td colspan="4">
                    No order items available.
                  </td>
                </tr>
              `
            }

          </tbody>

        </table>


        <div class="bill-total">

          <div class="bill-total-row">
            <span>Subtotal</span>

            <strong>
              ${formatCurrency(
                total
              )}
            </strong>
          </div>


          <div
            class="
              bill-total-row
              bill-grand-total
            "
          >
            <span>Total</span>

            <strong>
              ${formatCurrency(
                total
              )}
            </strong>
          </div>

        </div>


        <div class="payment-complete">
          PAYMENT COMPLETED
        </div>


        <footer class="bill-footer">
          Thank you for dining with KitchenFlow.
        </footer>

      </main>
    `;

    return openPrintWindow(
      bill?.billNumber ||
        "KitchenFlow Bill",
      html
    );
  };


/* ============================================================
   PRINT ALL BILLS IN SELECTED RANGE

   Each bill reuses the same item-row HTML generation.
   Long order lists can flow over multiple printed pages.
   ============================================================ */

export const printAdminBillsReport =
  (
    bills = [],
    from = "",
    to = ""
  ) => {
    if (
      !Array.isArray(
        bills
      ) ||
      bills.length === 0
    ) {
      return false;
    }

    let totalRevenue = 0;
    let totalDishes = 0;

    const billSections =
      bills
        .map(
          (bill) => {
            const items =
              getBillItems(
                bill
              );

            const billTotal =
              Number(
                bill?.totalAmount ||
                  0
              );

            totalRevenue +=
              billTotal;

            totalDishes +=
              items.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  Number(
                    item?.quantity ||
                      0
                  ),
                0
              );

            return `
              <section class="report-bill">

                <div class="report-bill-title">

                  <span>
                    ${escapeHtml(
                      bill?.billNumber ||
                        "Bill"
                    )}
                  </span>

                  <span>
                    Table
                    ${escapeHtml(
                      getTableNumber(
                        bill
                      )
                    )}
                    ·
                    ${formatDate(
                      bill?.paidAt ||
                        bill?.createdAt
                    )}
                  </span>

                </div>


                <table>

                  <thead>
                    <tr>
                      <th>Item</th>
                      <th class="center">
                        Qty
                      </th>
                      <th class="right">
                        Unit Price
                      </th>
                      <th class="right">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    ${
                      createItemRows(
                        items
                      ) ||
                      `
                        <tr>
                          <td colspan="4">
                            No order items available.
                          </td>
                        </tr>
                      `
                    }
                  </tbody>

                </table>


                <div class="bill-total">

                  <div class="bill-total-row">
                    <span>
                      Waiter
                    </span>

                    <strong>
                      ${escapeHtml(
                        getWaiterName(
                          bill
                        )
                      )}
                    </strong>
                  </div>

                  <div
                    class="
                      bill-total-row
                      bill-grand-total
                    "
                  >
                    <span>
                      Bill Total
                    </span>

                    <strong>
                      ${formatCurrency(
                        billTotal
                      )}
                    </strong>
                  </div>

                </div>

              </section>
            `;
          }
        )
        .join("");

    const rangeText =
      from && to
        ? `${formatDate(
            `${from}T00:00:00`
          )} - ${formatDate(
            `${to}T00:00:00`
          )}`
        : from
          ? `From ${formatDate(
              `${from}T00:00:00`
            )}`
          : to
            ? `Until ${formatDate(
                `${to}T00:00:00`
              )}`
            : "All Bills";

    const html = `
      <main class="report-page">

        <header class="bill-header">

          <div>
            <h1 class="bill-brand">
              KitchenFlow
            </h1>

            <div class="bill-subtitle">
              Restaurant Management System
            </div>
          </div>


          <div class="bill-heading">
            BILLS REPORT

            <small>
              ${escapeHtml(
                rangeText
              )}
            </small>
          </div>

        </header>


        <section class="report-summary">

          <div>
            <span>TOTAL BILLS</span>

            <strong>
              ${bills.length}
            </strong>
          </div>


          <div>
            <span>DISHES SOLD</span>

            <strong>
              ${totalDishes}
            </strong>
          </div>


          <div>
            <span>TOTAL REVENUE</span>

            <strong>
              ${formatCurrency(
                totalRevenue
              )}
            </strong>
          </div>

        </section>


        ${billSections}


        <div class="report-total">
          Total Revenue:
          ${formatCurrency(
            totalRevenue
          )}
        </div>


        <footer class="bill-footer">
          KitchenFlow Historical Bills Report
        </footer>

      </main>
    `;

    return openPrintWindow(
      "KitchenFlow Bills Report",
      html
    );
  };
  // ============================================================
// ADMIN MENU ITEMS
// ============================================================

export const loadAdminMenuItems = async () => {
  return apiRequest("/admin/menu-items");
};

export const addAdminMenuItem = async (menuItem) => {
  return apiRequest("/admin/menu-items", {
    method: "POST",
    body: JSON.stringify(menuItem),
  });
};

export const editAdminMenuItem = async (
  menuItemId,
  menuItem
) => {
  return apiRequest(
    `/admin/menu-items/${menuItemId}`,
    {
      method: "PATCH",
      body: JSON.stringify(menuItem),
    }
  );
};

export const toggleAdminMenuAvailability = async (
  menuItemId,
  isAvailable
) => {
  return apiRequest(
    `/admin/menu-items/${menuItemId}/availability`,
    {
      method: "PATCH",
      body: JSON.stringify({
        isAvailable,
      }),
    }
  );
};

export const deleteAdminMenuItem = async (
  menuItemId
) => {
  return apiRequest(
    `/admin/menu-items/${menuItemId}`,
    {
      method: "DELETE",
    }
  );
};

export const uploadAdminMenuImage = async (
  file
) => {
  if (!file) {
    return "";
  }

  if (!file.type?.startsWith("image/")) {
    throw new Error(
      "Please select a valid image file."
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      "Image must be smaller than 5 MB."
    );
  }

  const CLOUDINARY_CLOUD_NAME =
    "g0silssv";

  const CLOUDINARY_UPLOAD_PRESET =
    "pizzaDemo";

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );

  formData.append(
    "folder",
    "kitchenflow/menu"
  );

  const response = await fetch(
    uploadUrl,
    {
      method: "POST",
      body: formData,
    }
  );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data?.secure_url
  ) {
    throw new Error(
      data?.error?.message ||
        "Cloudinary image upload failed."
    );
  }

  return data.secure_url;
};