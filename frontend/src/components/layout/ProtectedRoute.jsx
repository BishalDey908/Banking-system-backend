import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import { fetchAccounts } from '../../store/slices/accountSlice';

/**
 * Route protection wrapper requiring authenticated JWT session
 */
export function ProtectedRoute() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token or session, fetch fresh user data and accounts
    if (token) {
      if (!user) {
        dispatch(fetchCurrentUser());
      }
      dispatch(fetchAccounts());
    }
  }, [token, user, dispatch]);

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

