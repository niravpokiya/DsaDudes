import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  console.log("token : " + token);
  if (!token) {
    return <Navigate to="/" replace state={{ authRequired: true }} />;
  }

  return children;
};

export default ProtectedRoute;
