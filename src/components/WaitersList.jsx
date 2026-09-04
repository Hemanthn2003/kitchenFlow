import React from "react";
import EmployeeCard from "./EmployeeCard.jsx";

const WaitersList = ({
  waiters = [],
}) => {
  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <div>
          <span>FRONT OF HOUSE</span>

          <h2>
            Active{" "}
            <strong>Waiters</strong>
          </h2>
        </div>

        <div className="section-count">
          <i />
          {waiters.length} ONLINE
        </div>
      </div>

      {waiters.length > 0 ? (
        <div className="employee-grid">
          {waiters.map((waiter) => (
            <EmployeeCard
              key={waiter._id}
              employee={waiter}
              type="waiter"
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No active waiters
        </div>
      )}
    </section>
  );
};

export default WaitersList;