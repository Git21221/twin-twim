import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

// Define a PrivateRoute component that wraps child components to ensure user authentication
const PrivateRoute = () => {
  const isLoggedIn = useSelector((state: { auth: { isAuthenticated: boolean } }) => state.auth.isAuthenticated);
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  } else return <Outlet />;
};

export default PrivateRoute;
