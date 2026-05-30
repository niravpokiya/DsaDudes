// security/ProtectedRoute.jsx

import { Navigate, useLocation, } from "react-router-dom";
import { getUserRole } from "../Helpers/getUserRole";
 

const ProtectedRoute = ({  children,  allowedRoles = [],}) => {
  const location = useLocation();

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const role = getUserRole();

  if (!role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role) ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;