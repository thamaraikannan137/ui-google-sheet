import { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  // Default options for all toasts
  const defaultOptions = {
    position: 'top-right' as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light' as const,
  };

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const options = {
      ...defaultOptions,
      autoClose: type === 'error' || type === 'warning' ? 7000 : 5000,
    };

    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      case 'info':
        toast.info(message, options);
        break;
      default:
        toast(message, options);
    }
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.success(message, defaultOptions);
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message, { ...defaultOptions, autoClose: 7000 });
  }, []);

  const showWarning = useCallback((message: string) => {
    toast.warning(message, { ...defaultOptions, autoClose: 7000 });
  }, []);

  const showInfo = useCallback((message: string) => {
    toast.info(message, defaultOptions);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={5}
      />
    </ToastContext.Provider>
  );
};
