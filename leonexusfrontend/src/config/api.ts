// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://alx-project-nexus-3ow0.onrender.com/api',
  TIMEOUT: 10000, // 10 seconds
};

// For development, you can override the base URL here
// export const API_CONFIG = {
//   BASE_URL: 'http://localhost:8000/api',
//   TIMEOUT: 10000,
// };
