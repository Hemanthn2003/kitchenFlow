import React from "react";
import Icon from "./Icon.jsx";

const CurrentUser = ({
  user,
  role = "Manager",
  variant = "header",
}) => {
  const normalizedRole = String(role || user?.role || "Manager")
    .trim()
    .toUpperCase();

  const userName = user?.name || normalizedRole;

  const displayRole = normalizedRole;

  const userImage =
    typeof user?.imageUrl === "string" && user.imageUrl.trim()
      ? user.imageUrl.trim()
      : typeof user?.profileImage === "string" &&
          user.profileImage.trim()
        ? user.profileImage.trim()
        : "";

  /* =========================================================
     HEADER
     ========================================================= */

  if (variant === "header") {
    return (
      <div className="header-user">
        <div className="header-user-text">
          <strong>{userName}</strong>

          <span>{displayRole}</span>
        </div>

        <div className="header-user-avatar">
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
            />
          ) : (
            <Icon
              name="user"
              size={18}
            />
          )}
        </div>
      </div>
    );
  }

  /* =========================================================
     SIDEBAR
     ========================================================= */

  return (
    <div className="sidebar-user">
      <div className="sidebar-user-avatar">
        {userImage ? (
          <img
            src={userImage}
            alt={userName}
          />
        ) : (
          <Icon
            name="user"
            size={18}
          />
        )}
      </div>

      <div className="sidebar-user-text">
        <strong>{userName}</strong>

        <span>{displayRole}</span>
      </div>
    </div>
  );
};

export default CurrentUser;