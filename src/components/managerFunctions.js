// ============================================================
// managerFunctions.js
// Manager dashboard functions
// ============================================================

import {
  fetchActiveUsers,
  fetchOrders,
  fetchMenuItems,
  addMenuItem,
  updateMenuAvailabilityLocal,
  updateOrder,
} from "../store/kitchenStore.js";


// ============================================================
// CONSTANTS
// ============================================================

const API_URL = "http://localhost:5000";

const CLOUDINARY_CLOUD_NAME = "g0silssv";

const CLOUDINARY_UPLOAD_PRESET = "pizzaDemo";

const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


// ============================================================
// FORMAT TIME
// ============================================================

export const formatTime = (date) => {
  if (!date) return "--";

  try {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "--";
    }

    return parsedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--";
  }
};


// ============================================================
// LOAD ACTIVE USERS
// ============================================================

export const loadActiveUsers = async ({
  dispatch,
  force = false,
  setRefreshing,
  setLocalError,
  setLastUpdated,
}) => {
  try {
    setRefreshing(true);
    setLocalError("");

    await dispatch(
      fetchActiveUsers({ force })
    ).unwrap();

    setLastUpdated(new Date());
  } catch (err) {
    if (err?.name !== "ConditionError") {
      console.error(
        "Manager dashboard error:",
        err
      );

      setLocalError(
        err?.message ||
          err ||
          "Unable to load dashboard"
      );
    }
  } finally {
    setRefreshing(false);
  }
};


// ============================================================
// LOAD ORDERS
// ============================================================

export const loadOrders = async ({
  dispatch,
  force = false,
  setOrdersError,
}) => {
  try {
    setOrdersError("");

    await dispatch(
      fetchOrders({ force })
    ).unwrap();
  } catch (err) {
    console.error(
      "Orders page error:",
      err
    );

    setOrdersError(
      err?.message ||
        err ||
        "Unable to load orders"
    );
  }
};


// ============================================================
// LOAD MENU ITEMS
// ============================================================

export const loadMenuItems = async ({
  dispatch,
  force = false,
  setMenuError,
}) => {
  try {
    setMenuError("");

    await dispatch(
      fetchMenuItems({ force })
    ).unwrap();
  } catch (err) {
    console.error(
      "Menu page error:",
      err
    );

    setMenuError(
      err?.message ||
        err ||
        "Unable to load menu items"
    );
  }
};


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

export const updateOrderStatus = async ({
  dispatch,
  orderId,
  status,
  setUpdatingOrderId,
  setOrdersError,
}) => {
  try {
    setUpdatingOrderId(orderId);
    setOrdersError("");

    const response = await fetch(
      `${API_URL}/api/manager/orders/${orderId}/status`,
      {
        method: "PATCH",

        credentials: "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          status,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to update order status"
      );
    }

    // Backend returned updated order
    if (data?.order) {
      dispatch(
        updateOrder(data.order)
      );
    } else {
      // Fallback: reload orders
      await dispatch(
        fetchOrders({
          force: true,
        })
      ).unwrap();
    }

  } catch (err) {
    console.error(
      "Order status update error:",
      err
    );

    setOrdersError(
      err?.message ||
        "Unable to update order status"
    );
  } finally {
    setUpdatingOrderId(null);
  }
};


// ============================================================
// UPDATE MENU AVAILABILITY
// ============================================================

export const updateMenuAvailability = async ({
  dispatch,
  itemId,
  isAvailable,
  setUpdatingMenuId,
  setMenuError,
}) => {
  try {
    setUpdatingMenuId(itemId);
    setMenuError("");

    const response = await fetch(
      `${API_URL}/api/manager/menu-items/${itemId}/availability`,
      {
        method: "PATCH",

        credentials: "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          isAvailable,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to update availability"
      );
    }

    dispatch(
      updateMenuAvailabilityLocal({
        itemId,

        isAvailable:
          data?.menuItem?.isAvailable ??
          isAvailable,
      })
    );

  } catch (err) {
    console.error(
      "Menu availability error:",
      err
    );

    setMenuError(
      err?.message ||
        "Unable to update availability"
    );
  } finally {
    setUpdatingMenuId(null);
  }
};


// ============================================================
// CLOUDINARY IMAGE UPLOAD
// ============================================================

export const uploadImageToCloudinary = async (
  file
) => {
  if (!file) {
    return "";
  }

  // Validate image
  if (!file.type?.startsWith("image/")) {
    throw new Error(
      "Please select a valid image file."
    );
  }

  // 5 MB maximum
  if (file.size > 5 * 1024 * 1024) {
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
    "kitchenflow/menu"
  );

  const response = await fetch(
    CLOUDINARY_UPLOAD_URL,
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


// ============================================================
// UPLOAD DISH IMAGE
// ============================================================

export const uploadDishImage = async ({
  event,
  mode = "add",

  setDishForm,
  setEditDishForm,

  setUploadingImage,
  setUploadingEditImage,

  setImageUploadError,
}) => {
  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  setImageUploadError("");

  try {
    if (mode === "edit") {
      setUploadingEditImage(true);
    } else {
      setUploadingImage(true);
    }

    const imageUrl =
      await uploadImageToCloudinary(
        file
      );

    if (mode === "edit") {
      setEditDishForm(
        (current) => ({
          ...current,
          imageUrl,
        })
      );
    } else {
      setDishForm(
        (current) => ({
          ...current,
          imageUrl,
        })
      );
    }

  } catch (err) {
    console.error(
      "Image upload error:",
      err
    );

    setImageUploadError(
      err?.message ||
        "Unable to upload image."
    );

  } finally {
    if (mode === "edit") {
      setUploadingEditImage(false);
    } else {
      setUploadingImage(false);
    }

    // Allows selecting the same file again
    event.target.value = "";
  }
};


// ============================================================
// ADD DISH
// ============================================================

export const addDish = async ({
  event,

  dispatch,

  dishForm,

  uploadingImage,

  setAddingDish,
  setMenuError,
  setDishForm,
  setShowAddDish,
}) => {
  event.preventDefault();

  // Name validation
  if (
    !String(
      dishForm?.name || ""
    ).trim()
  ) {
    setMenuError(
      "Enter dish name"
    );

    return;
  }

  // Category validation
  if (
    !String(
      dishForm?.category || ""
    ).trim()
  ) {
    setMenuError(
      "Enter dish category"
    );

    return;
  }

  // Price validation
  if (
    dishForm.price === "" ||
    Number.isNaN(
      Number(dishForm.price)
    ) ||
    Number(dishForm.price) < 0
  ) {
    setMenuError(
      "Enter a valid price"
    );

    return;
  }

  // Image upload still running
  if (uploadingImage) {
    setMenuError(
      "Please wait until the image upload finishes."
    );

    return;
  }

  try {
    setAddingDish(true);
    setMenuError("");

    const response =
      await fetch(
        `${API_URL}/api/manager/menu-items`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name:
              dishForm.name.trim(),

            category:
              dishForm.category.trim(),

            price:
              Number(
                dishForm.price
              ),

            imageUrl:
              String(
                dishForm.imageUrl || ""
              ).trim(),

            isAvailable:
              Boolean(
                dishForm.isAvailable
              ),
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to add menu item"
      );
    }

    if (data?.menuItem) {
      dispatch(
        addMenuItem(
          data.menuItem
        )
      );
    }

    // Reset form
    setDishForm({
      name: "",
      category: "",
      price: "",
      imageUrl: "",
      isAvailable: true,
    });

    setShowAddDish(false);

  } catch (err) {
    console.error(
      "Add dish error:",
      err
    );

    setMenuError(
      err?.message ||
        "Unable to add menu item"
    );

  } finally {
    setAddingDish(false);
  }
};


// ============================================================
// SAVE EDITED DISH
// ============================================================

export const saveDishEdit = async ({
  event,

  dispatch,

  editingDish,
  editDishForm,

  uploadingEditImage,

  setSavingDish,
  setMenuError,
  setEditingDish,
  setImageUploadError,
}) => {
  event.preventDefault();

  if (!editingDish?._id) {
    setMenuError(
      "No menu item selected for editing."
    );

    return;
  }

  const name =
    String(
      editDishForm?.name || ""
    ).trim();

  const category =
    String(
      editDishForm?.category || ""
    ).trim();

  const imageUrl =
    String(
      editDishForm?.imageUrl || ""
    ).trim();

  const price =
    Number(
      editDishForm?.price
    );

  // Name
  if (!name) {
    setMenuError(
      "Please enter a dish name."
    );

    return;
  }

  // Category
  if (!category) {
    setMenuError(
      "Please select a category."
    );

    return;
  }

  // Price
  if (
    editDishForm.price === "" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    setMenuError(
      "Please enter a valid price."
    );

    return;
  }

  // Image uploading
  if (uploadingEditImage) {
    setMenuError(
      "Please wait until the image upload is completed."
    );

    return;
  }

  try {
    setSavingDish(true);
    setMenuError("");

    const updatePayload = {
      name,

      category,

      price,

      imageUrl,

      isAvailable:
        Boolean(
          editDishForm.isAvailable
        ),
    };

    const response =
      await fetch(
        `${API_URL}/api/manager/menu-items/${editingDish._id}`,
        {
          method: "PATCH",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            updatePayload
          ),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to update menu item"
      );
    }

    const updatedMenuItem =
      data?.menuItem ||
      data?.item;

    if (!updatedMenuItem?._id) {
      throw new Error(
        "Menu item was updated, but the server did not return the updated item."
      );
    }

    // Reload menu from backend
    await dispatch(
      fetchMenuItems({
        force: true,
      })
    ).unwrap();

    setEditingDish(null);
    setImageUploadError("");

  } catch (err) {
    console.error(
      "Menu item update error:",
      err
    );

    setMenuError(
      err?.message ||
        "Unable to update menu item"
    );

  } finally {
    setSavingDish(false);
  }
};


// ============================================================
// LOGOUT
// ============================================================

export const handleLogout = async () => {
  try {
    await fetch(
      `${API_URL}/api/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );
  } catch (logoutError) {
    console.error(
      "Logout error:",
      logoutError
    );
  } finally {
    window.location.href = "/";
  }
};


// ============================================================
// REFRESH CURRENT PAGE
// ============================================================

export const refreshCurrentPage = async ({
  dispatch,

  activePage,

  setRefreshing,
  setLocalError,
  setLastUpdated,

  setOrdersError,
  setMenuError,
}) => {
  await loadActiveUsers({
    dispatch,

    force: true,

    setRefreshing,
    setLocalError,
    setLastUpdated,
  });

  if (
    activePage === "orders"
  ) {
    await loadOrders({
      dispatch,

      force: true,

      setOrdersError,
    });
  }

  if (
    activePage === "menu"
  ) {
    await loadMenuItems({
      dispatch,

      force: true,

      setMenuError,
    });
  }
};