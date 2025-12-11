import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Liability } from '../../types/models';

interface LiabilityState {
  liabilities: Liability[];
  selectedLiability: Liability | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: LiabilityState = {
  liabilities: [],
  selectedLiability: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const liabilitySlice = createSlice({
  name: 'liability',
  initialState,
  reducers: {
    setLiabilities: (state, action: PayloadAction<Liability[]>) => {
      state.liabilities = action.payload;
      state.lastUpdated = Date.now();
    },
    setSelectedLiability: (state, action: PayloadAction<Liability | null>) => {
      state.selectedLiability = action.payload;
    },
    clearSelectedLiability: (state) => {
      state.selectedLiability = null;
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
    clearLiabilities: (state) => {
      state.liabilities = [];
      state.selectedLiability = null;
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

export const {
  setLiabilities,
  setSelectedLiability,
  clearSelectedLiability,
  setLoading,
  setError,
  clearError,
  clearLiabilities,
} = liabilitySlice.actions;

export default liabilitySlice.reducer;
