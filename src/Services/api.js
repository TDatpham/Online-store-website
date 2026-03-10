import axios from 'axios';
import { store } from 'src/App/store';
import { updateAccessToken, signOut } from 'src/Features/userSlice';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  const token = store.getState().user.loginInfo?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = store.getState().user.loginInfo?.refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data;

          // Update store with new access token only
          store.dispatch(updateAccessToken(accessToken));

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired or invalid, logout user
          store.dispatch(signOut());
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
  getStats: () => api.get('/products/stats'),
  getReviews: (id) => api.get(`/products/${id}/reviews`),
  addReview: (id, review) => api.post(`/products/${id}/reviews`, review),
  updateReview: (id, review) => api.put(`/products/reviews/${id}`, review),
  deleteReview: (id) => api.delete(`/products/reviews/${id}`),
};

export const categoryApi = {
  getAll: () => api.get('/products/categories'),
  create: (category) => api.post('/products/categories', category),
  update: (id, category) => api.put(`/products/categories/${id}`, category),
  delete: (id) => api.delete(`/products/categories/${id}`),
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  getAllUsers: () => api.get('/users'),
  deleteUser: (id) => api.delete(`/users/${id}`),
  sendOtp: (email) => api.post(`/auth/send-otp?email=${email}`),
  verifyOtp: (email, code) => api.post(`/auth/verify-otp?email=${email}&code=${code}`),
  googleLogin: (idToken) => api.post('/auth/google', { idToken }),
  resetPassword: (email, otp, newPassword) =>
    api.post(`/auth/reset-password?email=${email}&otp=${otp}&newPassword=${encodeURIComponent(newPassword)}`),
};

export const orderApi = {
  create: (orderData) => api.post('/orders', orderData),
  getByUser: (userId) => api.get(`/orders/user/${userId}`),
  getAll: () => api.get('/orders'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status?status=${encodeURIComponent(status)}`),
};

export default api;
