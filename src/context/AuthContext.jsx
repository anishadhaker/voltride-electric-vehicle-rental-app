import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const USER_KEY = "user";
const LEGACY_TOKEN_KEY = "voltride_token";
const LEGACY_USER_KEY = "voltride_user";

const readStoredToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || null;
const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};
const persistAuth = (nextToken, nextUser) => {
  if (nextToken) {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }

  if (nextUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    localStorage.removeItem(LEGACY_USER_KEY);
  } else {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken());
  const [user, setUser] = useState(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  // Sync token & user state with localStorage and validate on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = readStoredToken();

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
          persistAuth(storedToken, response.data);
        } else {
          throw new Error("The saved session is no longer valid.");
        }
      } catch (error) {
        console.warn("Session expired or token invalid:", error.message);
        persistAuth(null, null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for custom expiration event from api.js interceptor
    const handleAuthExpired = () => {
      persistAuth(null, null);
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
      persistAuth(response.token, response.user);
    }
    return response;
  };

  // Login function
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
      persistAuth(response.token, response.user);
    }
    return response;
  };

  // Logout function
  const logout = () => {
    persistAuth(null, null);
    setToken(null);
    setUser(null);
  };

  // Update user state helper
  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      persistAuth(token, merged);
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
