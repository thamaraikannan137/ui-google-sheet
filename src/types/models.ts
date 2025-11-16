// Domain models and entities

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  inStock: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// Expense model for Google Sheets integration
export interface Expense {
  row?: number; // Row number in Google Sheet (for updates/deletes)
  date?: string;
  description?: string;
  amount?: number | string;
  category?: string;
  notes?: string;
  // Allow dynamic fields from Google Sheet
  [key: string]: any;
}

// Expense form data for create/update operations
export interface ExpenseFormData {
  date: string;
  description: string;
  amount: number;
  category: string;
  notes?: string;
}

// Google Auth response
export interface GoogleAuthResponse {
  message: string;
  email?: string;
  sessionId: string;
  nextStep?: string;
  usage?: string;
}

// Auth status response
export interface AuthStatusResponse {
  authenticated: boolean;
  email?: string;
  spreadsheetConnected: boolean;
  spreadsheetId?: string | null;
  sessionId?: string;
  message?: string;
  authUrl?: string;
}

