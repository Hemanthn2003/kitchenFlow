import React from "react";
import Icon from "./Icon.jsx";

const MenuItems = ({
  menuItems = [],
  loading = false,
  onRefresh,
  onAdd,
  onEdit,
  onToggleAvailability,
  updatingMenuId = null,
}) => {
  const groupedItems = menuItems.reduce(
    (groups, item) => {
      const category =
        item.category || "Other";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);

      return groups;
    },
    {}
  );

  return (
    <section className="manager-page-section">
      <div className="page-toolbar">
        <div>
          <span className="page-kicker">
            RESTAURANT MENU
          </span>

          <h2 className="page-title">
            Menu Items
          </h2>

          <p className="page-description">
            Manage dishes, categories,
            prices, images and availability.
          </p>
        </div>

        <button
          type="button"
          className="add-dish-button"
          onClick={onAdd}
        >
          + Add New Dish
        </button>
      </div>

      <div className="menu-toolbar-row">
        <span>
          {menuItems.length} menu items
        </span>

        <button
          type="button"
          className="page-refresh-button"
          onClick={onRefresh}
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

      {loading && menuItems.length === 0 ? (
        <div className="page-loading-state">
          <Icon
            name="refresh"
            size={28}
          />

          <p>Loading menu...</p>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="empty-state">
          No menu items found.
        </div>
      ) : (
        <div className="menu-category-list">
          {Object.entries(groupedItems)
            .sort(([a], [b]) =>
              a.localeCompare(b)
            )
            .map(([category, items]) => (
              <section
                key={category}
                className="menu-category-section"
              >
                <div className="menu-category-heading">
                  <div>
                    <span>CATEGORY</span>

                    <h3>{category}</h3>
                  </div>

                  <strong>
                    {items.length}
                  </strong>
                </div>

                <div className="menu-items-grid">
                  {items.map((item) => (
                    <article
                      key={item._id}
                      className={
                        item.isAvailable
                          ? "menu-item-card"
                          : "menu-item-card unavailable"
                      }
                    >
                      <div className="menu-item-image">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
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
                            <h4>{item.name}</h4>

                            <span>
                              {item.category}
                            </span>
                          </div>

                          <strong>
                            ₹
                            {Number(
                              item.price || 0
                            ).toFixed(0)}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="page-refresh-button"
                          onClick={() =>
                            onEdit?.(item)
                          }
                        >
                          <Icon
                            name="edit"
                            size={16}
                          />
                          Edit Item
                        </button>

                        <label className="availability-toggle">
                          <input
                            type="checkbox"
                            checked={Boolean(
                              item.isAvailable
                            )}
                            disabled={
                              updatingMenuId ===
                              item._id
                            }
                            onChange={(event) =>
                              onToggleAvailability?.(
                                item._id,
                                event.target.checked
                              )
                            }
                          />

                          <span className="availability-switch" />

                          <span>
                            {item.isAvailable
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </section>
  );
};

export default MenuItems;