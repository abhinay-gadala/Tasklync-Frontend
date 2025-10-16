import React, { ReactNode } from "react";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const jwtToken = Cookies.get("jwt_Token");
  if (jwtToken == undefined) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;