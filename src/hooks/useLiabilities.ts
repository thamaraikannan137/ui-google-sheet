import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setLiabilities, setSelectedLiability, setLoading, setError } from '../store/slices/liabilitySlice';
import { liabilityService } from '../services/liabilityService';
import type { Liability, LiabilityFormData } from '../types/models';

export const useLiabilities = () => {
  const dispatch = useAppDispatch();
  const { liabilities, selectedLiability, loading, error, lastUpdated } = useAppSelector(
    (state) => state.liability
  );

  const fetchLiabilities = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await liabilityService.getLiabilities();
      dispatch(setLiabilities(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch liabilities';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createLiability = useCallback(async (liabilityData: LiabilityFormData | Record<string, unknown>) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await liabilityService.createLiability(liabilityData);
      // Refetch liabilities to get updated list with row numbers
      const updatedLiabilities = await liabilityService.getLiabilities();
      dispatch(setLiabilities(updatedLiabilities));
      dispatch(setSelectedLiability(null));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create liability';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateLiability = useCallback(async (row: number, liabilityData: LiabilityFormData | Record<string, unknown>) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await liabilityService.updateLiability(row, liabilityData);
      // Refetch liabilities to get updated data
      const updatedLiabilities = await liabilityService.getLiabilities();
      dispatch(setLiabilities(updatedLiabilities));
      dispatch(setSelectedLiability(null));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update liability';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const deleteLiability = useCallback(async (row: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await liabilityService.deleteLiability(row);
      // Refetch liabilities to get updated list
      const updatedLiabilities = await liabilityService.getLiabilities();
      dispatch(setLiabilities(updatedLiabilities));
      dispatch(setSelectedLiability(null));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete liability';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const setSelectedLiabilityCallback = useCallback((liability: Liability | null) => {
    dispatch(setSelectedLiability(liability));
  }, [dispatch]);

  return {
    liabilities,
    selectedLiability,
    loading,
    error,
    lastUpdated,
    fetchLiabilities,
    createLiability,
    updateLiability,
    deleteLiability,
    setSelectedLiability: setSelectedLiabilityCallback,
  };
};
