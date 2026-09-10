import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Header from "../components/Header.jsx";
import Icon from "../components/Icon.jsx";

import AdminSidebar from "../components/admin-components/AdminSidebar.jsx";
import AdminUserList from "../components/admin-components/AdminUserList.jsx";
import AdminAddUser from "../components/admin-components/AdminAddUser.jsx";
import AdminEditUserModal from "../components/admin-components/AdminEditUserModal.jsx";
import AdminBills from "../components/admin-components/AdminBills.jsx";
import AdminAnalytics from "../components/admin-components/AdminAnalytics.jsx";
import AdminTablePerformance from "../components/admin-components/AdminTablePerformance.jsx";
import AdminMenuItems from "../components/admin-components/AdminMenuItems.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import {
  loadAdminProfile,
  loadAdminUsers,
  addAdminUser,
  editAdminUser,
  changeAdminUserRole,
  fireAdminUser,
  adminLogout,
} from "../components/admin-components/AdminFunctions.js";

import "./Admin.css";


/* ============================================================
   ADMIN
   ============================================================ */

const Admin = () => {

  const navigate =
    useNavigate();


  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const [menuOpen, setMenuOpen] =
    useState(false);


  const [activePage, setActivePage] =
    useState("home");


  /* ==========================================================
     USER
     ========================================================== */

  const [admin, setAdmin] =
    useState(null);


  /* ==========================================================
     EMPLOYEES
     ========================================================== */

  const [users, setUsers] =
    useState([]);


  const [loadingUsers, setLoadingUsers] =
    useState(false);


  const [usersError, setUsersError] =
    useState("");


  /* ==========================================================
     REFRESH
     ========================================================== */

  const [refreshing, setRefreshing] =
    useState(false);


  const [lastUpdated, setLastUpdated] =
    useState(null);


  const initialLoadRef =
    useRef(false);


  /* ==========================================================
     ADD USER
     ========================================================== */

  const [showAddUser, setShowAddUser] =
    useState(false);


  const [addingUser, setAddingUser] =
    useState(false);


  /* ==========================================================
     EDIT USER
     ========================================================== */

  const [editingUser, setEditingUser] =
    useState(null);


  const [savingUser, setSavingUser] =
    useState(false);


  /* ==========================================================
     USER ACTION
     ========================================================== */

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const [confirmAction, setConfirmAction] =
    useState(null);


  /* ==========================================================
     TOAST
     ========================================================== */

  const [message, setMessage] =
    useState(null);


  /* ==========================================================
     PROFILE
     ========================================================== */

  const loadProfile =
    async () => {

      try {

        const response =
          await loadAdminProfile();


        setAdmin(
          response?.admin ||
            null
        );

      } catch (error) {

        console.error(
          "Admin profile error:",
          error
        );
      }
    };


  /* ==========================================================
     USERS
     ========================================================== */

  const loadUsers =
    async ({
      force = false,
    } = {}) => {

      if (
        loadingUsers &&
        !force
      ) {
        return;
      }


      try {

        setLoadingUsers(
          true
        );

        setUsersError("");


        const response =
          await loadAdminUsers();


        const loadedUsers =
          Array.isArray(
            response?.users
          )
            ? response.users
            : [];


        setUsers(
          loadedUsers
        );


        setLastUpdated(
          new Date()
        );

      } catch (error) {

        console.error(
          "Admin users error:",
          error
        );


        setUsersError(
          error.message ||
            "Unable to load employees"
        );

      } finally {

        setLoadingUsers(
          false
        );
      }
    };


  /* ==========================================================
     INITIAL LOAD
     ========================================================== */

  useEffect(() => {

    if (
      initialLoadRef.current
    ) {
      return;
    }


    initialLoadRef.current =
      true;


    loadProfile();

    loadUsers();

  }, []);


  /* ==========================================================
     AUTO HIDE MESSAGE
     ========================================================== */

  useEffect(() => {

    if (!message) {
      return;
    }


    const timer =
      setTimeout(() => {

        setMessage(
          null
        );

      }, 3500);


    return () =>
      clearTimeout(
        timer
      );

  }, [message]);


  /* ==========================================================
     REFRESH
     ========================================================== */

  const handleRefresh =
    async () => {

      try {

        setRefreshing(
          true
        );


        await Promise.all([
          loadProfile(),
          loadUsers({
            force: true,
          }),
        ]);

      } finally {

        setRefreshing(
          false
        );
      }
    };


  /* ==========================================================
     ADD USER
     ========================================================== */

  const handleAddUser = (form) => {
    setConfirmAction({
      type: "ADD_USER",
      title: "Create Employee",
      message:
        `Are you sure you want to create ${form.name || "this employee"}?`,
      confirmText: "Create Employee",
      data: form,
    });
  };


  const confirmAddUser = async () => {
    if (!confirmAction?.data) {
      return;
    }

    try {
      setAddingUser(true);

      const response =
        await addAdminUser(
          confirmAction.data
        );

      if (response?.user) {
        setUsers(
          (previous) => [
            ...previous,
            response.user,
          ]
        );
      } else {
        await loadUsers({
          force: true,
        });
      }

      setShowAddUser(false);

      setMessage({
        type: "success",
        text:
          "User created successfully",
      });

      setConfirmAction(null);

      return true;

    } catch (error) {

      console.error(
        "Add user error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to create user",
      });

      return false;

    } finally {

      setAddingUser(false);

    }
  };


  /* ==========================================================
     EDIT USER
     ========================================================== */

  const handleEditUser = (
    user,
    form
  ) => {

    setConfirmAction({
      type: "EDIT_USER",
      title: "Update Employee",
      message:
        `Are you sure you want to update ${user.name}'s details?`,
      confirmText: "Update Employee",
      data: {
        user,
        form,
      },
    });

  };


  const confirmEditUser = async () => {

    if (!confirmAction?.data) {
      return;
    }

    const {
      user,
      form,
    } = confirmAction.data;

    try {

      setSavingUser(true);

      const updateData = {
        name: form.name,
        email: form.email,
      };

      if (
        form.password &&
        form.password.trim()
      ) {
        updateData.password =
          form.password;
      }

      if (
        form.imageUrl !== undefined
      ) {
        updateData.imageUrl =
          form.imageUrl;
      }

      const response =
        await editAdminUser(
          user._id ||
            user.id,
          updateData
        );

      const updatedUser =
        response?.user;

      if (updatedUser) {

        setUsers(
          (previous) =>
            previous.map(
              (item) =>
                String(
                  item._id
                ) ===
                String(
                  updatedUser._id
                )
                  ? {
                      ...item,
                      ...updatedUser,
                    }
                  : item
            )
        );

      } else {

        await loadUsers({
          force: true,
        });

      }

      setEditingUser(
        null
      );

      setMessage({
        type: "success",
        text:
          "User updated successfully",
      });

      setConfirmAction(null);

    } catch (error) {

      console.error(
        "Edit user error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to update user",
      });

    } finally {

      setSavingUser(false);

    }
  };


  /* ==========================================================
     CHANGE ROLE
     ========================================================== */

  const handleChangeRole = (
    user,
    newRole
  ) => {

    const userId =
      user._id ||
      user.id;

    const roleName =
      String(
        newRole
      ).toUpperCase();

    const currentRole =
      String(
        user.role || ""
      ).toUpperCase();

    const isPromotion =
      roleName === "MANAGER" ||
      (
        roleName === "WAITER" &&
        currentRole === "KITCHEN"
      );

    setConfirmAction({
      type: "ROLE",
      title:
        isPromotion
          ? "Promote Employee"
          : "Demote Employee",
      message:
        `Are you sure you want to change ${user.name}'s role to ${roleName}?`,
      confirmText:
        isPromotion
          ? "Promote"
          : "Demote",
      data: {
        user,
        userId,
        roleName,
      },
    });

  };


  const confirmChangeRole =
    async () => {

      if (!confirmAction?.data) {
        return;
      }

      const {
        user,
        userId,
        roleName,
      } = confirmAction.data;

      try {

        setActionLoadingId(
          userId
        );

        const response =
          await changeAdminUserRole(
            userId,
            roleName
          );

        if (
          response?.user
        ) {

          await loadUsers({
            force: true,
          });

        } else {

          await loadUsers({
            force: true,
          });

        }

        setMessage({
          type: "success",
          text:
            `${user.name} is now ${roleName}`,
        });

        setConfirmAction(null);

      } catch (error) {

        console.error(
          "Role change error:",
          error
        );

        setMessage({
          type: "error",
          text:
            error.message ||
            "Unable to change role",
        });

      } finally {

        setActionLoadingId(
          null
        );

      }
    };


  /* ==========================================================
     FIRE USER
     ========================================================== */

  const handleFireUser = (
    user
  ) => {

    const userId =
      user._id ||
      user.id;

    setConfirmAction({
      type: "FIRE_USER",
      title: "Fire Employee",
      message:
        `Are you sure you want to fire ${user.name}? This will remove the employee account.`,
      confirmText: "Fire Employee",
      data: {
        user,
        userId,
      },
    });

  };


  const confirmFireUser =
    async () => {

      if (!confirmAction?.data) {
        return;
      }

      const {
        user,
        userId,
      } = confirmAction.data;

      try {

        setActionLoadingId(
          userId
        );

        await fireAdminUser(
          userId
        );

        setUsers(
          (previous) =>
            previous.filter(
              (item) =>
                String(
                  item._id
                ) !==
                String(
                  userId
                )
            )
        );

        setMessage({
          type: "success",
          text:
            `${user.name} was fired successfully`,
        });

        setConfirmAction(null);

      } catch (error) {

        console.error(
          "Fire user error:",
          error
        );

        setMessage({
          type: "error",
          text:
            error.message ||
            "Unable to fire user",
        });

      } finally {

        setActionLoadingId(
          null
        );

      }
    };


  /* ==========================================================
     LOGOUT
     ========================================================== */

  const handleLogout =
    async () => {

      try {

        await adminLogout();

      } catch (error) {

        console.error(
          "Admin logout error:",
          error
        );

      } finally {

        localStorage.removeItem(
          "kitchenFlowUser"
        );

        localStorage.removeItem(
          "user"
        );

        navigate(
          "/login",
          {
            replace: true,
          }
        );
      }
    };


  /* ==========================================================
     ROLE GROUPS
     ========================================================== */

  const managers =
    useMemo(
      () =>
        users.filter(
          (user) =>
            String(
              user.role || ""
            )
              .trim()
              .toUpperCase() ===
            "MANAGER"
        ),
      [users]
    );


  const waiters =
    useMemo(
      () =>
        users.filter(
          (user) =>
            String(
              user.role || ""
            )
              .trim()
              .toUpperCase() ===
            "WAITER"
        ),
      [users]
    );


  const kitchenStaff =
    useMemo(
      () =>
        users.filter(
          (user) =>
            String(
              user.role || ""
            )
              .trim()
              .toUpperCase() ===
            "KITCHEN"
        ),
      [users]
    );


  /* ==========================================================
     ACTIVE TEAM
     ========================================================== */

  const activeEmployees =
    users.filter(
      (user) =>
        Boolean(
          user.isActive
        )
    ).length;


  /* ==========================================================
     PROFILE FALLBACK
     ========================================================== */

  let storedUser =
    null;


  try {

    storedUser =
      JSON.parse(
        localStorage.getItem(
          "kitchenFlowUser"
        ) ||
        "null"
      );

  } catch {

    storedUser =
      null;
  }


  const headerUser =
    admin ||
    storedUser ||
    {
      name: "Admin",
      role: "ADMIN",
    };


  /* ==========================================================
     HOME
     ========================================================== */

  const renderHome =
    () => (

      <>

        <section className="admin-hero">

          <div className="admin-hero-content">

            <span>
              ADMINISTRATOR
            </span>

            <h2>
              Hello,{" "}
              <strong>
                {headerUser.name ||
                  "Admin"}
              </strong>
            </h2>

            <p>
              Control your restaurant,
              team and business
              intelligence from one
              workspace.
            </p>

          </div>


          <div className="admin-live-card">

            <span className="admin-live-dot" />

            <div>

              <strong>
                SYSTEM ONLINE
              </strong>

              <p>
                KitchenFlow is operational
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            OVERVIEW STATS
            ================================================= */}

        <section className="admin-overview-grid">

          <div className="admin-overview-card">

            <div>
              <Icon
                name="users"
                size={22}
              />
            </div>

            <span>
              TOTAL STAFF
            </span>

            <strong>
              {String(
                users.length
              ).padStart(
                2,
                "0"
              )}
            </strong>

            <small>
              All employees
            </small>

          </div>


          <div className="admin-overview-card">

            <div>
              <Icon
                name="user"
                size={22}
              />
            </div>

            <span>
              MANAGERS
            </span>

            <strong>
              {String(
                managers.length
              ).padStart(
                2,
                "0"
              )}
            </strong>

            <small>
              Management
            </small>

          </div>


          <div className="admin-overview-card">

            <div>
              <Icon
                name="users"
                size={22}
              />
            </div>

            <span>
              WAITERS
            </span>

            <strong>
              {String(
                waiters.length
              ).padStart(
                2,
                "0"
              )}
            </strong>

            <small>
              Front of house
            </small>

          </div>


          <div className="admin-overview-card">

            <div>
              <Icon
                name="chef"
                size={22}
              />
            </div>

            <span>
              KITCHEN
            </span>

            <strong>
              {String(
                kitchenStaff.length
              ).padStart(
                2,
                "0"
              )}
            </strong>

            <small>
              Back of house
            </small>

          </div>


          <div className="admin-overview-card">

            <div>
              <Icon
                name="activity"
                size={22}
              />
            </div>

            <span>
              ACTIVE NOW
            </span>

            <strong>
              {String(
                activeEmployees
              ).padStart(
                2,
                "0"
              )}
            </strong>

            <small>
              Currently online
            </small>

          </div>

        </section>


        {/* =================================================
            QUICK ACTIONS
            ================================================= */}

        <section className="admin-quick-actions">

          <div className="admin-page-heading">

            <div>

              <span>
                ADMIN CONTROL
              </span>

              <h2>
                Quick Actions
              </h2>

            </div>

          </div>


          <div className="admin-quick-grid">

            <button
              type="button"
              onClick={() =>
                setActivePage(
                  "users"
                )
              }
            >

              <Icon
                name="users"
                size={25}
              />

              <strong>
                Manage Employees
              </strong>

              <span>
                Add, edit, promote,
                demote or fire staff.
              </span>

            </button>


            <button
              type="button"
              onClick={() =>
                setActivePage(
                  "analytics"
                )
              }
            >

              <Icon
                name="activity"
                size={25}
              />

              <strong>
                View Analytics
              </strong>

              <span>
                Revenue and popular
                dish intelligence.
              </span>

            </button>


            <button
              type="button"
              onClick={() =>
                setActivePage(
                  "bills"
                )
              }
            >

              <Icon
                name="receipt"
                size={25}
              />

              <strong>
                View Bills
              </strong>

              <span>
                Search historical
                restaurant transactions.
              </span>

            </button>

          </div>

        </section>

      </>

    );


  /* ==========================================================
     USERS PAGE
     ========================================================== */

  const renderUsers =
    () => (

      <>

        <div className="admin-page-heading">

          <div>

            <span>
              EMPLOYEE CONTROL
            </span>

            <h2>
              Employees
            </h2>

            <p>
              Manage Managers, Waiters
              and Kitchen staff.
            </p>

          </div>


          <button
            type="button"
            className="admin-primary-button"
            onClick={() =>
              setShowAddUser(
                (value) =>
                  !value
              )
            }
          >

            <Icon
              name="plus"
              size={16}
            />

            {showAddUser
              ? "Close"
              : "Add User"}

          </button>

        </div>


        {showAddUser && (

          <AdminAddUser
            onAdd={
              handleAddUser
            }
            loading={
              addingUser
            }
            onCancel={() =>
              setShowAddUser(
                false
              )
            }
          />

        )}


        {usersError && (

          <div className="admin-error">

            <Icon
              name="alert"
              size={17}
            />

            {usersError}

          </div>

        )}


        {loadingUsers ? (

          <div className="admin-loading">
            Loading employees...
          </div>

        ) : (

          <>

            <AdminUserList
              title="Managers"
              label="MANAGEMENT"
              users={managers}
              onEdit={
                setEditingUser
              }
              onChangeRole={
                handleChangeRole
              }
              onFire={
                handleFireUser
              }
              actionLoadingId={
                actionLoadingId
              }
            />


            <AdminUserList
              title="Waiters"
              label="FRONT OF HOUSE"
              users={waiters}
              onEdit={
                setEditingUser
              }
              onChangeRole={
                handleChangeRole
              }
              onFire={
                handleFireUser
              }
              actionLoadingId={
                actionLoadingId
              }
            />


            <AdminUserList
              title="Kitchen Staff"
              label="BACK OF HOUSE"
              users={
                kitchenStaff
              }
              onEdit={
                setEditingUser
              }
              onChangeRole={
                handleChangeRole
              }
              onFire={
                handleFireUser
              }
              actionLoadingId={
                actionLoadingId
              }
            />

          </>

        )}

      </>

    );


  /* ==========================================================
     PAGE CONTENT
     ========================================================== */

  const renderPage =
    () => {

      if (
        activePage ===
        "users"
      ) {
        return renderUsers();
      }


      if (
        activePage ===
        "analytics"
      ) {
        return (
          <AdminAnalytics />
        );
      }
          
     if (
          activePage ===
          "menu"
        ) {
          return (
            <AdminMenuItems />
          );
        }

          if (
            activePage ===
            "table-performance"
          ) {
      return (
           <AdminTablePerformance />
        );
      }
  
      if (
        activePage ===
        "bills"
      ) {
        return (
          <AdminBills />
        );
      }
           
      return renderHome();
    };


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="admin-dashboard">

      <AdminSidebar
        open={
          menuOpen
        }
        activePage={
          activePage
        }
        onClose={() =>
          setMenuOpen(
            false
          )
        }
        onNavigate={
          setActivePage
        }
        onLogout={
          handleLogout
        }
      />


      <div className="admin-main">

        <Header
          activePage={
            activePage
          }
          onMenuToggle={() =>
            setMenuOpen(
              (value) =>
                !value
            )
          }
          onRefresh={
            handleRefresh
          }
          refreshing={
            refreshing
          }
          user={
            headerUser
          }
          role="ADMIN"
        />


        <main className="admin-content">

          {renderPage()}


          {lastUpdated && (
            <div className="admin-last-updated">

              Last updated{" "}
              {lastUpdated.toLocaleTimeString(
                "en-IN",
                {
                  hour:
                    "2-digit",
                  minute:
                    "2-digit",
                }
              )}

            </div>
          )}

        </main>

      </div>


      {/* =====================================================
          EDIT USER MODAL
          ===================================================== */}

      {editingUser && (

        <AdminEditUserModal
          user={
            editingUser
          }
          onClose={() =>
            setEditingUser(
              null
            )
          }
          onSave={
            handleEditUser
          }
          loading={
            savingUser
          }
        />

      )}


      <ConfirmModal
        open={
          Boolean(confirmAction)
        }
        title={
          confirmAction?.title ||
          "Confirm Action"
        }
        message={
          confirmAction?.message ||
          ""
        }
        confirmText={
          confirmAction?.confirmText ||
          "Confirm"
        }
        cancelText="Cancel"
        loading={
          Boolean(actionLoadingId) ||
          addingUser ||
          savingUser
        }
        onCancel={() =>
          setConfirmAction(null)
        }
        onConfirm={() => {

          if (
            confirmAction?.type ===
            "ADD_USER"
          ) {
            return confirmAddUser();
          }

          if (
            confirmAction?.type ===
            "EDIT_USER"
          ) {
            return confirmEditUser();
          }

          if (
            confirmAction?.type ===
            "ROLE"
          ) {
            return confirmChangeRole();
          }

          if (
            confirmAction?.type ===
            "FIRE_USER"
          ) {
            return confirmFireUser();
          }

        }}
      />


      {/* =====================================================
          TOAST
          ===================================================== */}

      {message && (

        <div
          className={`admin-toast ${
            message.type ===
            "error"
              ? "error"
              : "success"
          }`}
        >

          <Icon
            name={
              message.type ===
              "error"
                ? "alert"
                : "check"
            }
            size={17}
          />

          <span>
            {message.text}
          </span>

        </div>

      )}

    </div>
  );
};


export default Admin;