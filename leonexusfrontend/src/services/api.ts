// API Configuration
import { API_CONFIG } from '../config/api';
const API_BASE_URL = API_CONFIG.BASE_URL;

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'BUYER' | 'DEALER';
}

export interface DealerProfile {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface BuyerProfile {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'BUYER' | 'DEALER';
  dealer_profile?: DealerProfile;
  buyer_profile?: BuyerProfile;
}

export interface LoginCredentials {
  username: string; // Can be username or email
  password: string;
}

// API Helper Functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` }),
  };
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Authentication API Functions
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    return handleApiResponse(response);
  },

  // Logout user
  logout: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } else {
      throw new Error('Logout failed');
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/profile/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleApiResponse(response);
  },

  // Create dealer profile
  createDealerProfile: async (profileData: {
    first_name: string;
    last_name: string;
    phone: string;
    address?: string;
  }): Promise<DealerProfile> => {
    const response = await fetch(`${API_BASE_URL}/dealers/create/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    return handleApiResponse(response);
  },

  // Create buyer profile
  createBuyerProfile: async (profileData: {
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<BuyerProfile> => {
    const response = await fetch(`${API_BASE_URL}/buyers/create/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    return handleApiResponse(response);
  },

  // Get dealer profile
  getDealerProfile: async (): Promise<DealerProfile> => {
    const response = await fetch(`${API_BASE_URL}/dealers/profile/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleApiResponse(response);
  },

  // Get buyer profile
  getBuyerProfile: async (): Promise<BuyerProfile> => {
    const response = await fetch(`${API_BASE_URL}/buyers/profile/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleApiResponse(response);
  },
};

// Categories API Functions
export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/categories/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleApiResponse(response);
    
    // Handle both paginated and direct array responses
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.results)) {
      return data.results;
    } else {
      console.error('Unexpected categories response format:', data);
      return [];
    }
  },
};

// Utility functions for authentication state
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  // Store user data
  storeUser: (user: User, token: string): void => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  },

  // Clear stored user data
  clearUser: (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  },

  // Check if user is dealer
  isDealer: (): boolean => {
    const user = authUtils.getStoredUser();
    return user?.role === 'DEALER';
  },

  // Check if user is buyer
  isBuyer: (): boolean => {
    const user = authUtils.getStoredUser();
    return user?.role === 'BUYER';
  },
};
