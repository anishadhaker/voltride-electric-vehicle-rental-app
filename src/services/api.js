import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "").replace(/\/api\/api$/, "/api");

const TOKEN_KEY = "token";
const LEGACY_TOKEN_KEY = "voltride_token";
const USER_KEY = "user";
const LEGACY_USER_KEY = "voltride_user";

const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically attach Authorization Bearer token
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error messages & handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token has expired or is invalid, clear stale credentials
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes("/auth/");
      if (!isAuthEndpoint) {
        clearStoredAuth();
        window.dispatchEvent(new Event("voltride_auth_expired"));
      }
    }

    let message = error.response?.data?.message;
    if (!message) {
      if (error.code === "ECONNABORTED") {
        message = "Server connection timed out. Please try again.";
      } else if (error.message === "Network Error") {
        message = "Unable to connect to VoltRide backend (http://localhost:5001). Please ensure the backend server is running.";
      } else {
        message = error.message || "Unable to connect to the server. Please check your connection.";
      }
    }

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

/* =======================================================
   AUTHENTICATION APIs
   ======================================================= */
export const authAPI = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  verifyResetOtp: async (email, otp) => {
    const response = await api.post("/auth/verify-reset-otp", { email, otp });
    return response.data;
  },

  resetPassword: async (resetToken, newPassword, confirmPassword) => {
    const response = await api.post("/auth/reset-password", {
      resetToken,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put("/users/change-password", passwordData);
    return response.data;
  },
};

/* =======================================================
   VEHICLE APIs
   ======================================================= */
export const vehicleAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/vehicles", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  checkAvailability: async (id, payload) => {
    const response = await api.post(`/vehicles/${id}/check-availability`, payload);
    return response.data;
  },
};

/* =======================================================
   BOOKING APIs
   ======================================================= */
export const bookingAPI = {
  create: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  getMyBookings: async (params = {}) => {
    const response = await api.get("/bookings/my-bookings", { params });
    return response.data;
  },

  getMyStats: async () => {
    const response = await api.get("/bookings/my-stats");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },

  updatePaymentStatus: async (id, paymentStatus = "Paid") => {
    const response = await api.put(`/bookings/${id}/payment-status`, { paymentStatus });
    return response.data;
  },
};

export const adminAPI = {
  getDashboard: async () => (await api.get("/admin/dashboard")).data,
  getVehicles: async () => (await api.get("/admin/vehicles")).data,
  createVehicle: async (vehicle) => (await api.post("/admin/vehicles", vehicle)).data,
  updateVehicle: async (id, vehicle) => (await api.put(`/admin/vehicles/${id}`, vehicle)).data,
  deleteVehicle: async (id) => (await api.delete(`/admin/vehicles/${id}`)).data,
  getBookings: async () => (await api.get("/admin/bookings")).data,
  getUsers: async () => (await api.get("/admin/users")).data,
  getAnalytics: async () => (await api.get("/admin/analytics")).data,
};

export default api;
