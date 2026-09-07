import {
  emitToRole,
  emitToUser,
  emitGlobal,
} from "../socket.js";

/*
|--------------------------------------------------------------------------
| ORDER UPDATED
|--------------------------------------------------------------------------
*/

export const notifyOrderUpdated = ({
  order,
  action = "UPDATED",
}) => {
  if (!order) {
    return;
  }

  const payload = {
    type: "ORDER_UPDATED",
    action,
    order,
    orderId: order._id,
    tableId: order.tableId,
    status: order.status,
    updatedAt:
      order.updatedAt || new Date(),
  };

  /*
  | Manager needs every order update
  */
  emitToRole(
    "MANAGER",
    "orderUpdated",
    payload
  );

  /*
  | Kitchen needs order updates
  */
  emitToRole(
    "KITCHEN",
    "orderUpdated",
    payload
  );

  /*
  | Waiter needs order updates
  */
  emitToRole(
    "WAITER",
    "orderUpdated",
    payload
  );

  /*
  | Admin can also receive it
  */
  emitToRole(
    "ADMIN",
    "orderUpdated",
    payload
  );
};

/*
|--------------------------------------------------------------------------
| TABLE UPDATED
|--------------------------------------------------------------------------
*/

export const notifyTableUpdated = ({
  table,
  action = "UPDATED",
}) => {
  if (!table) {
    return;
  }

  const payload = {
    type: "TABLE_UPDATED",
    action,
    table,
    tableId: table._id,
    tableNumber: table.tableNumber,
    status: table.status,
    waiterId: table.waiterId || null,
    updatedAt:
      table.updatedAt || new Date(),
  };

  emitToRole(
    "MANAGER",
    "tableUpdated",
    payload
  );

  emitToRole(
    "WAITER",
    "tableUpdated",
    payload
  );

  emitToRole(
    "ADMIN",
    "tableUpdated",
    payload
  );
};

/*
|--------------------------------------------------------------------------
| BILL UPDATED
|--------------------------------------------------------------------------
*/

export const notifyBillUpdated = ({
  bill,
  action = "UPDATED",
}) => {
  if (!bill) {
    return;
  }

  const payload = {
    type: "BILL_UPDATED",
    action,
    bill,
    billId: bill._id,
    tableId: bill.tableId,
    paymentStatus:
      bill.paymentStatus,
    status: bill.status,
    updatedAt:
      bill.updatedAt || new Date(),
  };

  emitToRole(
    "MANAGER",
    "billUpdated",
    payload
  );

  emitToRole(
    "WAITER",
    "billUpdated",
    payload
  );

  emitToRole(
    "ADMIN",
    "billUpdated",
    payload
  );
};

/*
|--------------------------------------------------------------------------
| MENU UPDATED
|--------------------------------------------------------------------------
*/

export const notifyMenuUpdated = ({
  menuItem,
  action = "UPDATED",
}) => {
  if (!menuItem) {
    return;
  }

  const payload = {
    type: "MENU_UPDATED",
    action,
    menuItem,
    menuItemId: menuItem._id,
    updatedAt:
      menuItem.updatedAt || new Date(),
  };

  emitToRole(
    "MANAGER",
    "menuUpdated",
    payload
  );

  emitToRole(
    "WAITER",
    "menuUpdated",
    payload
  );

  emitToRole(
    "KITCHEN",
    "menuUpdated",
    payload
  );

  emitToRole(
    "ADMIN",
    "menuUpdated",
    payload
  );
};

/*
|--------------------------------------------------------------------------
| USER STATUS UPDATED
|--------------------------------------------------------------------------
*/

export const notifyUserStatusUpdated = ({
  user,
  action = "UPDATED",
}) => {
  if (!user) {
    return;
  }

  const payload = {
    type: "USER_STATUS_UPDATED",
    action,
    user,
    userId: user._id,
    isActive: user.isActive,
    updatedAt:
      user.updatedAt || new Date(),
  };

  emitToRole(
    "MANAGER",
    "userStatusUpdated",
    payload
  );

  emitToRole(
    "ADMIN",
    "userStatusUpdated",
    payload
  );
};

/*
|--------------------------------------------------------------------------
| USER-SPECIFIC NOTIFICATION
|--------------------------------------------------------------------------
*/

export const notifyUser = ({
  userId,
  type,
  message,
  data = {},
}) => {
  if (!userId) {
    return;
  }

  emitToUser(
    userId,
    "notification",
    {
      type,
      message,
      data,
      createdAt: new Date(),
    }
  );
};

/*
|--------------------------------------------------------------------------
| GLOBAL NOTIFICATION
|--------------------------------------------------------------------------
*/

export const notifyEveryone = ({
  type,
  message,
  data = {},
}) => {
  emitGlobal(
    "notification",
    {
      type,
      message,
      data,
      createdAt: new Date(),
    }
  );
};