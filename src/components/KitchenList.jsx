import React from "react";
import EmployeeCard from "./EmployeeCard.jsx";

const KitchenList = ({
  kitchenStaff = [],
}) => {
  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <div>
          <span>BACK OF HOUSE</span>

          <h2>
            Active{" "}
            <strong>Kitchen Staff</strong>
          </h2>
        </div>

        <div className="section-count">
          <i />
          {kitchenStaff.length} ONLINE
        </div>
      </div>

      {kitchenStaff.length > 0 ? (
        <div className="employee-grid">
          {kitchenStaff.map((cook) => (
            <EmployeeCard
              key={cook._id}
              employee={cook}
              type="kitchen"
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No active kitchen staff
        </div>
      )}
    </section>
  );
};

export default KitchenList;