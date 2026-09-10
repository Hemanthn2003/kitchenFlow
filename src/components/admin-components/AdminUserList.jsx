import React from "react";
import AdminUserCard from "./AdminUserCard.jsx";


const AdminUserList = ({
  title,
  label,
  users = [],
  onEdit,
  onChangeRole,
  onFire,
  actionLoadingId = null,
}) => {

  const safeUsers =
    Array.isArray(users)
      ? users
      : [];


  return (
    <section className="admin-user-section">

      <div className="admin-section-heading">

        <div>

          <span>
            {label}
          </span>

          <h2>
            {title}
          </h2>

        </div>


        <strong>
          {String(
            safeUsers.length
          ).padStart(
            2,
            "0"
          )}
        </strong>

      </div>


      {safeUsers.length === 0 ? (

        <div className="admin-empty-state">

          <div className="admin-empty-icon">
            —
          </div>

          <h3>
            No employees
          </h3>

          <p>
            There are currently no
            employees in this role.
          </p>

        </div>

      ) : (

        <div className="admin-users-grid">

          {safeUsers.map(
            (user) => (

              <AdminUserCard
                key={
                  user._id ||
                  user.id
                }
                user={user}
                onEdit={onEdit}
                onChangeRole={
                  onChangeRole
                }
                onFire={onFire}
                actionLoading={
                  actionLoadingId ===
                  (
                    user._id ||
                    user.id
                  )
                }
              />

            )
          )}

        </div>

      )}

    </section>
  );
};


export default AdminUserList;
