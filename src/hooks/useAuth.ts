import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setCredentials, clearAuth, setLoading, setError } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../config/constants';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );

  const checkAuthStatus = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const status = await authService.checkAuthStatus();
      
      if (status.authenticated && status.email) {
        // User is authenticated
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          dispatch(
            setCredentials({
              user: {
                id: status.sessionId || '',
                email: status.email,
                name: status.email.split('@')[0],
              } as any,
              token,
            })
          );
        }
      } else {
        dispatch(clearAuth());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check auth status';
      dispatch(setError(errorMessage));
      dispatch(clearAuth());
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      await authService.logout();
      dispatch(clearAuth());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const initiateGoogleAuth = useCallback(() => {
    authService.initiateGoogleAuth();
  }, []);

  const connectSpreadsheet = useCallback(async (spreadsheetId: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await authService.connectSpreadsheet(spreadsheetId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect spreadsheet';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    checkAuthStatus,
    logout,
    initiateGoogleAuth,
    connectSpreadsheet,
  };
};
