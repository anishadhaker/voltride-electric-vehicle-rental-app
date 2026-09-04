import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
    const token = localStorage.getItem("voltride_token");
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
        localStorage.removeItem("voltride_token");
        localStorage.removeItem("voltride_user");
        window.dispatchEvent(new Event("voltride_auth_expired"));
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to connect to the server. Please check your connection.";

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

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
};

export default api;
