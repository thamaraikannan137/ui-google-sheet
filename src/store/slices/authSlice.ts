import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { STORAGE_KEYS } from '../../config/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Check if we have stored auth data
const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
const storedEmail = localStorage.getItem('user_email');

const initialState: AuthState = {
  user: storedEmail ? {
    id: storedToken || '',
    email: storedEmail,
    name: storedEmail.split('@')[0],
  } as any : null,
  token: storedToken,
  isAuthenticated: !!storedToken && !!storedEmail,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCredentials, clearAuth, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;

