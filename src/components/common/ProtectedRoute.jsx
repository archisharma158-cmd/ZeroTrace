import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, setReturnUrl } from "../../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    const checkAuth = () => setAuthed(isAuthenticated());

    window.addEventListener("storage", checkAuth);
    window.addEventListener("zerotrace-auth-changed", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("zerotrace-auth-changed", checkAuth);
    };
  }, []);

  if (!authed) {
    setReturnUrl(location.pathname + location.search);
    return <Navigate to="/auth" replace />;
  }

  return children;
}
