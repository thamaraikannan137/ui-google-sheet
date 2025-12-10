import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setUsers, setCurrentUser, setLoading, setError } from '../store/slices/userSlice';
import { userService } from '../services/userService';
import type { User } from '../types';

export const useUsers = () => {
  const dispatch = useAppDispatch();
  const { users, currentUser, loading, error } = useAppSelector((state) => state.user);

  const fetchUsers = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await userService.getUsers();
      dispatch(setUsers(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchUserById = async (userId: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await userService.getUserById(userId);
      dispatch(setCurrentUser(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    users,
    currentUser,
    loading,
    error,
    fetchUsers,
    fetchUserById,
  };
};
