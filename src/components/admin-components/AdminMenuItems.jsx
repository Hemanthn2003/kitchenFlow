import React, { useEffect, useMemo, useState } from "react";
import Icon from "../Icon.jsx";
import ConfirmModal from "../ConfirmModal.jsx";

import {
  loadAdminMenuItems,
  addAdminMenuItem,
  editAdminMenuItem,
  toggleAdminMenuAvailability,
  deleteAdminMenuItem,
  uploadAdminMenuImage,
} from "./AdminFunctions.js";

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  imageUrl: "",
  isAvailable: true,
};

const AdminMenuItems = () => {
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [updatingMenuId, setUpdatingMenuId] = useState(null);

  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [confirmSave, setConfirmSave] = useState(false);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await loadAdminMenuItems();

      const items = Array.isArray(response?.menuItems)
        ? response.menuItems
        : Array.isArray(response?.items)
        ? response.items
        : [];

      setMenuItems(items);
    } catch (requestError) {
      console.error("Admin menu items error:", requestError);

      setError(
        requestError?.message ||
          "Unable to load menu items"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const groupedItems = useMemo(() => {
    return menuItems.reduce((groups, item) => {
      const category =
        String(item?.category || "Uncategorized").trim() ||
        "Uncategorized";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);

      return groups;
    }, {});
  }, [menuItems]);

  const openAddModal = () => {
    setError("");
    setImageError("");
    setForm(EMPTY_FORM);
    setEditingItem(null);
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setError("");
    setImageError("");

    setEditingItem(item);

    setForm({
      name: item?.name || "",
      category: item?.category || "",
      price: String(item?.price ?? ""),
      imageUrl: item?.imageUrl || "",
      isAvailable: Boolean(item?.isAvailable),
    });
  };

  const closeModal = () => {
    if (saving || uploadingImage) {
      return;
    }

    setShowAddModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setImageError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageError("");

    try {
      setUploadingImage(true);

      const imageUrl = await uploadAdminMenuImage(file);

      setForm((current) => ({
        ...current,
        imageUrl,
      }));
    } catch (uploadError) {
      console.error(
        "Admin menu image upload error:",
        uploadError
      );

      setImageError(
        uploadError?.message ||
          "Unable to upload image."
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const validateForm = () => {
    const name = String(form.name || "").trim();
    const category = String(form.category || "").trim();
    const price = Number(form.price);

    if (!name) {
      setError("Please enter a dish name.");
      return false;
    }

    if (!category) {
      setError("Please enter a category.");
      return false;
    }

    if (
      form.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Please enter a valid price.");
      return false;
    }

    if (uploadingImage) {
      setError(
        "Please wait until the image upload is completed."
      );
      return false;
    }

    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    setConfirmSave(true);
  };

  const confirmSaveMenuItem = async () => {
    if (!validateForm()) {
      setConfirmSave(false);
      return;
    }

    const payload = {
      name: String(form.name).trim(),
      category: String(form.category).trim(),
      price: Number(form.price),
      imageUrl: String(form.imageUrl || "").trim(),
      isAvailable: Boolean(form.isAvailable),
    };

    try {
      setSaving(true);
      setError("");

      if (editingItem?._id) {
        const response = await editAdminMenuItem(
          editingItem._id,
          payload
        );

        const updatedItem =
          response?.menuItem ||
          response?.item;

        if (updatedItem?._id) {
          setMenuItems((current) =>
            current.map((item) =>
              String(item._id) ===
              String(updatedItem._id)
                ? updatedItem
                : item
            )
          );
        } else {
          await loadMenu();
        }
      } else {
        const response =
          await addAdminMenuItem(payload);

        const newItem =
          response?.menuItem ||
          response?.item;

        if (newItem?._id) {
          setMenuItems((current) => [
            ...current,
            newItem,
          ]);
        } else {
          await loadMenu();
        }
      }

      setConfirmSave(false);
      setShowAddModal(false);
      setEditingItem(null);
      setForm(EMPTY_FORM);
      setImageError("");
    } catch (saveError) {
      console.error(
        "Admin menu save error:",
        saveError
      );

      setError(
        saveError?.message ||
          "Unable to save menu item"
      );
      setConfirmSave(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (
    itemId,
    isAvailable
  ) => {
    try {
      setUpdatingMenuId(itemId);
      setError("");

      const response =
        await toggleAdminMenuAvailability(
          itemId,
          isAvailable
        );

      const updatedItem =
        response?.menuItem ||
        response?.item;

      setMenuItems((current) =>
        current.map((item) =>
          String(item._id) === String(itemId)
            ? {
                ...item,
                ...(updatedItem || {}),
                isAvailable:
                  updatedItem?.isAvailable ??
                  isAvailable,
              }
            : item
        )
      );
    } catch (toggleError) {
      console.error(
        "Admin menu availability error:",
        toggleError
      );

      setError(
        toggleError?.message ||
          "Unable to update availability"
      );
    } finally {
      setUpdatingMenuId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteItem?._id) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteAdminMenuItem(
        confirmDeleteItem._id
      );

      setMenuItems((current) =>
        current.filter(
          (item) =>
            String(item._id) !==
            String(confirmDeleteItem._id)
        )
      );

      setConfirmDeleteItem(null);
    } catch (deleteError) {
      console.error(
        "Admin delete menu item error:",
        deleteError
      );

      setError(
        deleteError?.message ||
          "Unable to delete menu item"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <section className="manager-page-section admin-menu-items-page">
        <div className="page-toolbar">
          <div>
            <span className="admin-section-kicker">
              MENU MANAGEMENT
            </span>

            <h2>Menu Items</h2>

            <p>
              Create, edit and manage every dish
              available in KitchenFlow.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={openAddModal}
          >
            <Icon
              name="plus"
              size={17}
            />
            Add New Dish
          </button>
        </div>

        <div className="menu-toolbar-row">
          <div>
            <strong>
              {menuItems.length}
            </strong>{" "}
            menu item
            {menuItems.length === 1
              ? ""
              : "s"}
          </div>

          <button
            type="button"
            className="page-refresh-button"
            onClick={loadMenu}
            disabled={loading}
          >
            <Icon
              name="refresh"
              size={16}
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="admin-error">
            <Icon
              name="alert"
              size={17}
            />
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-loading">
            Loading menu items...
          </div>
        ) : menuItems.length === 0 ? (
          <div className="admin-empty-state">
            <Icon
              name="menuItems"
              size={30}
            />

            <strong>
              No menu items found
            </strong>

            <span>
              Add your first dish to start
              building the menu.
            </span>

            <button
              type="button"
              className="admin-primary-button"
              onClick={openAddModal}
            >
              <Icon
                name="plus"
                size={16}
              />
              Add New Dish
            </button>
          </div>
        ) : (
          <div className="menu-category-list">
            {Object.entries(groupedItems)
              .sort(([a], [b]) =>
                a.localeCompare(b)
              )
              .map(
                ([category, items]) => (
                  <section
                    className="menu-category-section"
                    key={category}
                  >
                    <div className="menu-category-heading">
                      <div>
                        <span>
                          CATEGORY
                        </span>

                        <strong>
                          {category}
                        </strong>
                      </div>

                      <small>
                        {items.length} item
                        {items.length === 1
                          ? ""
                          : "s"}
                      </small>
                    </div>

                    <div className="menu-items-grid">
                      {items.map((item) => {
                        const itemId =
                          item._id;

                        const isUpdating =
                          String(
                            updatingMenuId
                          ) ===
                          String(itemId);

                        return (
                          <article
                            className={`menu-item-card ${
                              item.isAvailable
                                ? ""
                                : "unavailable"
                            }`}
                            key={itemId}
                          >
                            <div className="menu-item-image">
                              {item.imageUrl ? (
                                <img
                                  src={
                                    item.imageUrl
                                  }
                                  alt={
                                    item.name ||
                                    "Menu item"
                                  }
                                />
                              ) : (
                                <Icon
                                  name="menuItems"
                                  size={30}
                                />
                              )}
                            </div>

                            <div className="menu-item-content">
                              <div className="menu-item-title-row">
                                <div>
                                  <h3>
                                    {item.name ||
                                      "Unnamed Dish"}
                                  </h3>

                                  <span>
                                    {item.category ||
                                      "Uncategorized"}
                                  </span>
                                </div>

                                <strong>
                                  ₹
                                  {Number(
                                    item.price || 0
                                  ).toFixed(2)}
                                </strong>
                              </div>

                              <div className="admin-menu-item-actions">
                                <button
                                  type="button"
                                  className="page-refresh-button"
                                  onClick={() =>
                                    openEditModal(
                                      item
                                    )
                                  }
                                >
                                  <Icon
                                    name="edit"
                                    size={16}
                                  />
                                  Edit Item
                                </button>

                                <button
                                  type="button"
                                  className="admin-menu-delete-button"
                                  onClick={() =>
                                    setConfirmDeleteItem(
                                      item
                                    )
                                  }
                                  disabled={
                                    isUpdating
                                  }
                                >
                                  <Icon
                                    name="trash"
                                    size={16}
                                  />
                                  Delete
                                </button>
                              </div>

                              <label className="availability-toggle">
                                <input
                                  type="checkbox"
                                  checked={Boolean(
                                    item.isAvailable
                                  )}
                                  disabled={
                                    isUpdating
                                  }
                                  onChange={(event) =>
                                    handleToggleAvailability(
                                      itemId,
                                      event.target.checked
                                    )
                                  }
                                />

                                <span className="availability-switch" />

                                <span>
                                  {isUpdating
                                    ? "Updating..."
                                    : item.isAvailable
                                    ? "Available"
                                    : "Unavailable"}
                                </span>
                              </label>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                )
              )}
          </div>
        )}
      </section>

      {(showAddModal || editingItem) && (
        <div
          className="admin-menu-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !saving &&
              !uploadingImage
            ) {
              closeModal();
            }
          }}
        >
          <div className="admin-menu-modal-card">
            <button
              type="button"
              className="admin-menu-modal-close"
              onClick={closeModal}
              disabled={
                saving || uploadingImage
              }
              aria-label="Close"
            >
              ×
            </button>

            <div className="admin-menu-modal-header">
              <span>
                {editingItem
                  ? "MENU ITEM EDITOR"
                  : "MENU ITEM CREATOR"}
              </span>

              <h2>
                {editingItem
                  ? "Edit Menu Item"
                  : "Add New Dish"}
              </h2>

              <p>
                {editingItem
                  ? "Update the dish details below."
                  : "Add a new dish to the restaurant menu."}
              </p>
            </div>

            <form
              className="admin-menu-form"
              onSubmit={handleSave}
            >
              <div className="admin-menu-image-field">
                <div className="admin-menu-image-preview">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Dish preview"
                    />
                  ) : (
                    <Icon
                      name="menuItems"
                      size={34}
                    />
                  )}
                </div>

                <div>
                  <strong>
                    Dish Image
                  </strong>

                  <p>
                    JPG, PNG or WEBP · Max 5 MB
                  </p>

                  <label className="admin-image-upload-button">
                    <Icon
                      name="image"
                      size={16}
                    />

                    {uploadingImage
                      ? "Uploading..."
                      : form.imageUrl
                      ? "Change Image"
                      : "Upload Image"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageUpload
                      }
                      disabled={
                        uploadingImage ||
                        saving
                      }
                    />
                  </label>

                  {form.imageUrl && (
                    <button
                      type="button"
                      className="admin-remove-image-button"
                      onClick={() =>
                        setForm(
                          (current) => ({
                            ...current,
                            imageUrl: "",
                          })
                        )
                      }
                      disabled={
                        uploadingImage ||
                        saving
                      }
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>

              {imageError && (
                <div className="admin-form-error">
                  {imageError}
                </div>
              )}

              {error && (
                <div className="admin-form-error">
                  {error}
                </div>
              )}

              <div className="admin-menu-form-grid">
                <label>
                  <span>
                    DISH NAME
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter dish name"
                    disabled={saving}
                  />
                </label>

                <label>
                  <span>
                    CATEGORY
                  </span>

                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Main Course"
                    disabled={saving}
                  />
                </label>

                <label>
                  <span>
                    PRICE
                  </span>

                  <div className="admin-price-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      disabled={saving}
                    />
                  </div>
                </label>

                <label className="admin-menu-availability-field">
                  <span>
                    AVAILABILITY
                  </span>

                  <label className="availability-toggle">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={Boolean(
                        form.isAvailable
                      )}
                      onChange={handleChange}
                      disabled={saving}
                    />

                    <span className="availability-switch" />

                    <span>
                      {form.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </label>
                </label>
              </div>

              <div className="admin-menu-modal-actions">
                <button
                  type="button"
                  className="admin-modal-cancel"
                  onClick={closeModal}
                  disabled={
                    saving || uploadingImage
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={
                    saving ||
                    uploadingImage
                  }
                >
                  <Icon
                    name={
                      saving
                        ? "loader"
                        : "check"
                    }
                    size={16}
                  />

                  {saving
                    ? "Saving..."
                    : editingItem
                    ? "Save Changes"
                    : "Add Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmSave}
        title={
          editingItem
            ? "Update Menu Item?"
            : "Create Menu Item?"
        }
        message={
          editingItem
            ? `Are you sure you want to update "${form.name}"?`
            : `Are you sure you want to create "${form.name}"?`
        }
        confirmText={
          editingItem
            ? "Update Item"
            : "Create Item"
        }
        cancelText="Cancel"
        loading={saving}
        onCancel={() => {
          if (!saving) {
            setConfirmSave(false);
          }
        }}
        onConfirm={confirmSaveMenuItem}
      />

      <ConfirmModal
        open={Boolean(confirmDeleteItem)}
        title="Delete Menu Item?"
        message={
          confirmDeleteItem
            ? `Are you sure you want to permanently delete "${confirmDeleteItem.name}"? This action cannot be undone.`
            : ""
        }
        confirmText={
          deleting
            ? "Deleting..."
            : "Delete Item"
        }
        cancelText="Cancel"
        loading={deleting}
        onCancel={() => {
          if (!deleting) {
            setConfirmDeleteItem(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default AdminMenuItems;