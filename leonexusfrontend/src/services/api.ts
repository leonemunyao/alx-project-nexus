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

export interface Car {
  id: number;
  dealer: number | {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
  };
  category: number | {
    id: number;
    name: string;
    slug: string;
  } | null;
  title: string;
  make: string;
  model: string;
  location: string;
  year: number;
  price: string; // Decimal field comes as string from API
  mileage: number | null;
  transmission: string;
  fuel_type: string;
  condition: string;
  description: string;
  published: boolean;
  created_at: string;
  images?: CarImage[]; // Optional, might be included in some responses
  reviews?: Review[]; // Optional, might be included in some responses
  average_rating?: number;
  review_count?: number;
  is_favorited?: boolean;
}

export interface CarImage {
  id: number;
  car: number;
  image: string;
  image_url: string;
  order: number;
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
  // Register user
  register: async (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    role: 'BUYER' | 'DEALER';
  }): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return handleApiResponse(response);
  },

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

// Dealer Cars API Functions
export const dealerCarsApi = {
  // Get dealer's cars
  getCars: async (): Promise<Car[]> => {
    const response = await fetch(`${API_BASE_URL}/dealers/cars/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleApiResponse(response);

    // Handle both paginated and direct array responses
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.results)) {
      return data.results;
    } else {
      console.error('Unexpected cars response format:', data);
      return [];
    }
  },

  // Create a new car
  createCar: async (carData: {
    title: string;
    make: string;
    model: string;
    year: number;
    price: string;
    mileage?: number | null;
    location: string;
    condition: string;
    description: string;
    transmission: string;
    fuel_type: string;
    category?: number | null;
  }, images?: File[]): Promise<Car> => {
    const token = localStorage.getItem('authToken');
    
    // If there are images, use FormData, otherwise use JSON
    if (images && images.length > 0) {
      const formData = new FormData();
      
      // Add car data fields
      Object.entries(carData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Add images
      images.forEach((image, index) => {
        formData.append('uploaded_images', image);
      });

      const response = await fetch(`${API_BASE_URL}/dealers/cars/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token || ''}`,
        },
        body: formData,
      });

      return handleApiResponse(response);
    } else {
      // No images, use JSON
      const response = await fetch(`${API_BASE_URL}/dealers/cars/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token || ''}`,
        },
        body: JSON.stringify(carData),
      });

      return handleApiResponse(response);
    }
  },

  // Update a car
  updateCar: async (carId: number, carData: Partial<Car>, images?: File[]): Promise<Car> => {
    const token = localStorage.getItem('authToken');
    
    // If there are images, use FormData, otherwise use JSON
    if (images && images.length > 0) {
      const formData = new FormData();
      
      // Add car data fields
      Object.entries(carData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Add images
      images.forEach((image, index) => {
        formData.append('uploaded_images', image);
      });

      const response = await fetch(`${API_BASE_URL}/dealers/cars/${carId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token || ''}`,
        },
        body: formData,
      });

      return handleApiResponse(response);
    } else {
      // No images, use JSON
      const response = await fetch(`${API_BASE_URL}/dealers/cars/${carId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token || ''}`,
        },
        body: JSON.stringify(carData),
      });

      return handleApiResponse(response);
    }
  },

  // Delete a car
  deleteCar: async (carId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/dealers/cars/${carId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }
  },
};

// Public Cars API Functions
export const carsApi = {
  // Get all cars with filters
  getCars: async (filters?: {
    make?: string;
    model?: string;
    year?: number;
    min_price?: number;
    max_price?: number;
    location?: string;
    fuel_type?: string;
    transmission?: string;
    category?: number;
    search?: string;
    ordering?: string;
  }): Promise<{ cars: Car[]; count: number; next: string | null; previous: string | null }> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/cars/?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleApiResponse(response);
    return {
      cars: data.results || data,
      count: data.count || (Array.isArray(data) ? data.length : 0),
      next: data.next || null,
      previous: data.previous || null,
    };
  },

  // Get car details
  getCarDetails: async (carId: number): Promise<Car> => {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleApiResponse(response);
  },
};

// Reviews API Functions
export interface Review {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

export const reviewsApi = {
  // Get reviews for a car
  getCarReviews: async (carId: number): Promise<Review[]> => {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}/reviews/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleApiResponse(response);
    return Array.isArray(data) ? data : data.results || [];
  },

  // Create a review
  createReview: async (carId: number, reviewData: {
    rating: number;
    comment: string;
  }): Promise<Review> => {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}/reviews/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(reviewData),
    });

    return handleApiResponse(response);
  },

  // Update a review
  updateReview: async (reviewId: number, reviewData: {
    rating: number;
    comment: string;
  }): Promise<Review> => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(reviewData),
    });

    return handleApiResponse(response);
  },

  // Delete a review
  deleteReview: async (reviewId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }
  },
};

// Favorites API Functions
export interface Favorite {
  id: number;
  car: Car;
  created_at: string;
}

export const favoritesApi = {
  // Get user's favorites
  getFavorites: async (): Promise<Favorite[]> => {
    const response = await fetch(`${API_BASE_URL}/favorites/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleApiResponse(response);
    return Array.isArray(data) ? data : data.results || [];
  },

  // Add to favorites
  addFavorite: async (carId: number): Promise<Favorite> => {
    const response = await fetch(`${API_BASE_URL}/favorites/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ car: carId }),
    });

    return handleApiResponse(response);
  },

  // Remove from favorites
  removeFavorite: async (favoriteId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }
  },

  // Toggle favorite (convenience method)
  toggleFavorite: async (carId: number): Promise<{ isFavorited: boolean; favoriteId?: number }> => {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}/toggle-favorite/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await handleApiResponse(response);
    return data;
  },
};

// Profile API Functions
export const profilesApi = {
  // Get dealer profile
  getDealerProfile: async (): Promise<DealerProfile> => {
    const response = await fetch(`${API_BASE_URL}/dealers/profile/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleApiResponse(response);
  },

  // Update dealer profile
  updateDealerProfile: async (profileData: Partial<DealerProfile>): Promise<DealerProfile> => {
    const response = await fetch(`${API_BASE_URL}/dealers/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profileData),
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

  // Update buyer profile
  updateBuyerProfile: async (profileData: Partial<BuyerProfile>): Promise<BuyerProfile> => {
    const response = await fetch(`${API_BASE_URL}/buyers/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profileData),
    });

    return handleApiResponse(response);
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
