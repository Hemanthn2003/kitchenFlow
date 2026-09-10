import React from "react";
import Icon from "../Icon.jsx";


const formatTime = (value) => {

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


const AdminUserCard = ({
  user,
  onEdit,
  onChangeRole,
  onFire,
  actionLoading = false,
}) => {

  if (!user) {
    return null;
  }


  const role =
    String(
      user.role || ""
    )
      .trim()
      .toUpperCase();


  const isActive =
    Boolean(
      user.isActive
    );


  const isWaiter =
    role === "WAITER";


  const image =
    user.imageUrl ||
    user.profileImage ||
    user.profileImageUrl ||
    user.avatar ||
    "";


  const tableNumbers =
    Array.isArray(
      user.servingTableNumbers
    )
      ? user.servingTableNumbers
      : [];


  const getRoleIcon = () => {

    if (role === "MANAGER") {
      return "user";
    }

    if (role === "KITCHEN") {
      return "chef";
    }

    return "user";
  };


  const promoteRole =
    role === "WAITER"
      ? "MANAGER"
      : role === "KITCHEN"
        ? "WAITER"
        : null;


  const demoteRole =
    role === "MANAGER"
      ? "WAITER"
      : role === "WAITER"
        ? "KITCHEN"
        : null;


  return (
    <article className="admin-user-card">

      {/* =================================================
          TOP
          ================================================= */}

      <div className="admin-user-card-top">

        <div className="admin-user-avatar">

          {image ? (

            <img
              src={image}
              alt={
                user.name ||
                "Employee"
              }
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />

          ) : (

            <Icon
              name={getRoleIcon()}
              size={28}
            />

          )}

        </div>


        <div className="admin-user-main">

          <div className="admin-user-name-row">

            <h3>
              {user.name ||
                "Unknown Employee"}
            </h3>

            {isActive && (
              <span className="admin-verified">
                <Icon
                  name="check"
                  size={12}
                />
              </span>
            )}

          </div>


          <span
            className={`admin-role-badge admin-role-${role.toLowerCase()}`}
          >
            {role}
          </span>


          <p>
            {user.email ||
              "No email"}
          </p>

        </div>


        <span
          className={
            isActive
              ? "admin-status active"
              : "admin-status offline"
          }
        >
          <i />

          {isActive
            ? "ACTIVE"
            : "OFFLINE"}
        </span>

      </div>


      {/* =================================================
          INFORMATION
          ================================================= */}

      <div className="admin-user-info">

        {isWaiter ? (

          <div className="admin-info-item">

            <Icon
              name="table"
              size={14}
            />

            <div>
              <span>
                SERVING
              </span>

              <strong>
                {tableNumbers.length > 0
                  ? tableNumbers
                      .map(
                        (number) =>
                          `TABLE ${String(
                            number
                          ).padStart(
                            2,
                            "0"
                          )}`
                      )
                      .join(", ")
                  : "FREE"}
              </strong>
            </div>

          </div>

        ) : (

          <div className="admin-info-item">

            <Icon
              name="activity"
              size={14}
            />

            <div>
              <span>
                WORK STATUS
              </span>

              <strong>
                {isActive
                  ? "ON DUTY"
                  : "OFFLINE"}
              </strong>
            </div>

          </div>

        )}


        <div className="admin-info-item">

          <Icon
            name="clock"
            size={14}
          />

          <div>
            <span>
              LAST ACTIVE
            </span>

            <strong>
              {formatTime(
                user.lastActiveAt
              )}
            </strong>
          </div>

        </div>

      </div>


      {/* =================================================
          ACTIONS
          ================================================= */}

      <div className="admin-user-actions">

        {promoteRole && (

          <button
            type="button"
            className="admin-action-button promote"
            disabled={actionLoading}
            onClick={() =>
              onChangeRole(
                user,
                promoteRole
              )
            }
          >
            <Icon
              name="arrow-up"
              size={14}
            />

            Promote
          </button>

        )}


        {demoteRole && (

          <button
            type="button"
            className="admin-action-button demote"
            disabled={actionLoading}
            onClick={() =>
              onChangeRole(
                user,
                demoteRole
              )
            }
          >
            <Icon
              name="arrow-down"
              size={14}
            />

            Demote
          </button>

        )}


        <button
          type="button"
          className="admin-action-button edit"
          disabled={actionLoading}
          onClick={() =>
            onEdit(user)
          }
        >
          <Icon
            name="edit"
            size={14}
          />

          Edit
        </button>


        <button
          type="button"
          className="admin-action-button fire"
          disabled={actionLoading}
          onClick={() =>
            onFire(user)
          }
        >
          <Icon
            name="trash"
            size={14}
          />

          Fire
        </button>

      </div>

    </article>
  );
};


export default AdminUserCard;