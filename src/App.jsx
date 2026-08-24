import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Pages/Login.jsx";
import Admin from "./Pages/Admin.jsx";
import Manager from "./Pages/Manager.jsx";
import Kitchen from "./Pages/Kitchen.jsx";
import Waiter from "./Pages/Waiter.jsx";

import "./App.css";


function ProtectedRoute({
  children,
  allowedRole,
}) {

  const storedUser =
    localStorage.getItem(
      "kitchenFlowUser"
    );


  /* Check login */

  if (!storedUser) {

    console.log(
      "No logged-in user"
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  let user;


  try {

    user = JSON.parse(
      storedUser
    );

  } catch (error) {

    console.error(
      "Invalid stored user:",
      error
    );

    localStorage.removeItem(
      "kitchenFlowUser"
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /* Normalize both roles */

  const userRole =
    String(
      user?.role || ""
    )
      .trim()
      .toUpperCase();


  const requiredRole =
    String(
      allowedRole || ""
    )
      .trim()
      .toUpperCase();


  console.log(
    "Protected Route"
  );

  console.log(
    "User:",
    user
  );

  console.log(
    "User role:",
    userRole
  );

  console.log(
    "Required role:",
    requiredRole
  );


  /* Check role */

  if (
    userRole !== requiredRole
  ) {

    console.log(
      "Role mismatch"
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  console.log(
    "Role authorized"
  );


  return children;
}


function App() {

  return (

    <Routes>


      {/* Login */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />


      {/* Admin */}

      <Route
        path="/admin"
        element={

          <ProtectedRoute
            allowedRole="ADMIN"
          >

            <Admin />

          </ProtectedRoute>

        }
      />


      {/* Manager */}

      <Route
        path="/manager"
        element={

          <ProtectedRoute
            allowedRole="MANAGER"
          >

            <Manager />

          </ProtectedRoute>

        }
      />


      {/* Kitchen */}

      <Route
        path="/kitchen"
        element={

          <ProtectedRoute
            allowedRole="KITCHEN"
          >

            <Kitchen />

          </ProtectedRoute>

        }
      />


      {/* Waiter */}

      <Route
        path="/waiter"
        element={

          <ProtectedRoute
            allowedRole="WAITER"
          >

            <Waiter />

          </ProtectedRoute>

        }
      />


      {/* Root */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* Unknown URL */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>

  );
}


export default App;