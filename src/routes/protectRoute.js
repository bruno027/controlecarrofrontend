import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { parseCookies } from "nookies";


function ProtectedRoute() {

  let cookies = parseCookies();
  const token = cookies["@megalink.token"];
  console.log("token")
  const isAuthenticated = !!token;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;