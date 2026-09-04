import React from "react";
import Icon from "./Icon.jsx";

const formatTime = (date) => {
  if (!date) {
    return "--";
  }

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

const EmployeeCard = ({
  employee,
  type = "waiter",
}) => {
  if (!employee) {
    return null;
  }

  const isWaiter = type === "waiter";

  const employeeName =
    employee.name ||
    employee.fullName ||
    "Unknown Employee";

  const employeeEmail =
    employee.email ||
    "--";

  const image =
    employee.imageUrl ||
    employee.profileImage ||
    employee.profileImageUrl ||
    employee.avatar ||
    "";

  const currentTable =
    employee.currentTable !== null &&
    employee.currentTable !== undefined &&
    employee.currentTable !== ""
      ? employee.currentTable
      : null;

  const lastActive =
    employee.lastActiveAt ||
    employee.lastActive ||
    employee.updatedAt ||
    null;

  return (
    <article className="employee-card">
      <div className="employee-card-top">
        <div className="employee-avatar">
          {image ? (
            <img
              src={image}
              alt={employeeName}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Icon
              name={isWaiter ? "user" : "chef"}
              size={29}
            />
          )}
        </div>

        <div className="employee-main">
          <div className="employee-name-row">
            <h3>{employeeName}</h3>

            <span className="verified-icon">
              <Icon name="check" size={14} />
            </span>
          </div>

          <p className="employee-role">
            {isWaiter
              ? "WAITER"
              : "KITCHEN STAFF"}
          </p>

          <p className="employee-email">
            {employeeEmail}
          </p>
        </div>

        <div className="active-badge">
          <span className="active-dot" />
          ACTIVE
        </div>
      </div>

      <div className="employee-footer">
        <div className="status-information">
          <div className="status-label">
            <Icon
              name={
                isWaiter
                  ? "table"
                  : "activity"
              }
              size={14}
            />

            <span>
              {isWaiter
                ? "Serving Status"
                : "Work Status"}
            </span>
          </div>

          <p
            className={
              currentTable
                ? "table-status busy"
                : "table-status free"
            }
          >
            {isWaiter
              ? currentTable !== null
                ? `TABLE ${String(
                    currentTable
                  ).padStart(2, "0")}`
                : "FREE"
              : "ON DUTY"}
          </p>
        </div>

        <div className="last-active">
          <Icon name="clock" size={12} />

          <span>
            Last active{" "}
            {formatTime(lastActive)}
          </span>
        </div>
      </div>
    </article>
  );
};

export default EmployeeCard;