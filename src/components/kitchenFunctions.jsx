const API_URL =
  "http://localhost:5000";


/* =========================================================
   LOAD KITCHEN ORDERS
   ========================================================= */

export const loadKitchenOrders =
  async ({
    setOrders,
    setLoading,
    setError,
  }) => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/kitchen/orders`,
          {
            method: "GET",
            credentials:
              "include",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Unable to load kitchen orders (${response.status})`
        );
      }


      const incomingOrders =
        Array.isArray(
          data?.orders
        )
          ? data.orders
          : [];


      /*
       * Only active kitchen orders.
       */

      const kitchenOrders =
        incomingOrders.filter(
          (order) => {
            const status =
              String(
                order?.status ||
                  order?.displayStatus ||
                  ""
              ).toUpperCase();

            return (
              status ===
                "ORDERED" ||
              status ===
                "PROCESSING"
            );
          }
        );


      setOrders(
        kitchenOrders
      );
    } catch (error) {
      console.error(
        "Kitchen orders error:",
        error
      );

      setError(
        error?.message ||
          "Unable to load kitchen orders"
      );
    } finally {
      setLoading(false);
    }
  };


/* =========================================================
   UPDATE KITCHEN ORDER

   ORDERED → PROCESSING
   PROCESSING → COOKED
   ========================================================= */

export const updateKitchenOrderStatus =
  async ({
    orderId,
    nextStatus,
    setOrders,
    setUpdatingOrderId,
    setError,
  }) => {
    if (!orderId) {
      setError(
        "Order ID is missing"
      );

      return;
    }


    const status =
      String(
        nextStatus || ""
      )
        .trim()
        .toUpperCase();


    if (
      status !==
        "PROCESSING" &&
      status !==
        "COOKED"
    ) {
      setError(
        "Invalid kitchen status"
      );

      return;
    }


    try {
      setUpdatingOrderId(
        orderId
      );

      setError("");


      const response =
        await fetch(
          `${API_URL}/api/kitchen/orders/${orderId}/status`,
          {
            method: "PATCH",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to update order"
        );
      }


      /*
       * -----------------------------------------------------
       * PROCESSING
       * -----------------------------------------------------
       *
       * Change only this order.
       */

      if (
        status ===
        "PROCESSING"
      ) {
        setOrders(
          (previousOrders) =>
            previousOrders.map(
              (order) => {
                if (
                  String(
                    order._id
                  ) !==
                  String(
                    orderId
                  )
                ) {
                  return order;
                }


                return {
                  ...order,

                  ...(data?.order ||
                    {}),

                  status:
                    "PROCESSING",

                  displayStatus:
                    "PROCESSING",
                };
              }
            )
        );

        return;
      }


      /*
       * -----------------------------------------------------
       * COOKED
       * -----------------------------------------------------
       *
       * Change database status first.
       *
       * Then remove ONLY this order from the Kitchen
       * queue.
       */

      if (
        status ===
        "COOKED"
      ) {
        setOrders(
          (previousOrders) =>
            previousOrders.filter(
              (order) =>
                String(
                  order._id
                ) !==
                String(
                  orderId
                )
            )
        );
      }
    } catch (error) {
      console.error(
        "Kitchen status update error:",
        error
      );

      setError(
        error?.message ||
          "Unable to update order"
      );
    } finally {
      setUpdatingOrderId(
        null
      );
    }
  };