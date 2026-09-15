import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser, fetchCurrentUser, clearAuthError } from '../store/slices/authSlice';

/**
 * Custom hook providing access to authentication state and dispatch actions
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login: (credentials) => dispatch(loginUser(credentials)),
    register: (userData) => dispatch(registerUser(userData)),
    logout: () => dispatch(logoutUser()),
    fetchMe: () => dispatch(fetchCurrentUser()),
    clearError: () => dispatch(clearAuthError()),
  };
}

