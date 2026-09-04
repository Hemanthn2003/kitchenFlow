import React from "react";
import Icon from "./Icon.jsx";

const formatTime = (date) => {
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

const ManagerList = ({ manager }) => {
  const image =
    manager?.imageUrl ||
    manager?.profileImage ||
    manager?.profileImageUrl ||
    manager?.avatar ||
    "";

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <div>
          <span>MANAGEMENT</span>

          <h2>
            Active <strong>Manager</strong>
          </h2>
        </div>

        <p>CURRENTLY ONLINE</p>
      </div>

      {manager ? (
        <div className="manager-card">
          <div className="manager-card-avatar">
            {image ? (
              <img
                src={image}
                alt={manager.name || "Manager"}
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <Icon name="user" size={36} />
            )}
          </div>

          <div className="manager-card-info">
            <div className="manager-name-line">
              <h3>{manager.name}</h3>

              <span className="online-pill">
                <i />
                ONLINE
              </span>
            </div>

            <span className="gold-role">
              MANAGER
            </span>

            <p>{manager.email}</p>
          </div>

          <div className="manager-activity">
            <Icon name="clock" size={15} />

            <div>
              <span>LAST ACTIVE</span>

              <strong>
                {formatTime(
                  manager.lastActiveAt
                )}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          No active manager
        </div>
      )}
    </section>
  );
};

export default ManagerList;