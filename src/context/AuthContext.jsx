import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "voltride_token";
const USER_KEY = "voltride_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync token & user state with localStorage and validate on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        } else {
          throw new Error("The saved session is no longer valid.");
        }
      } catch (error) {
        console.warn("Session expired or token invalid:", error.message);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for custom expiration event from api.js interceptor
    const handleAuthExpired = () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    };

    window.addEventListener("voltride_auth_expired", handleAuthExpired);
    return () => {
      window.removeEventListener("voltride_auth_expired", handleAuthExpired);
    };
  }, []);

  // Register function
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
    return response;
  };

  // Login function
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
    return response;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  // Update user state helper
  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
