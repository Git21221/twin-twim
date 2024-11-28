import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

// Define a PrivateRoute component that wraps child components to ensure user authentication
const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const token = Cookies.get("accessToken");
  if ( !token) {
    return <Navigate to="/login" replace />;
  }

  // If profile is available, render the children components
  return children;
};

export default PrivateRoute;
