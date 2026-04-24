"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { getProfile } from "@/services/userApi";

const AuthContext = createContext();

// Helper to get storage key with tab identifier
const getTabId = () => {
  // Check if we already have a tab ID in sessionStorage
  let tabId = sessionStorage.getItem("tabId");
  if (!tabId) {
    // Generate a unique tab ID for this tab
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("tabId", tabId);
  }
  return tabId;
};

// Storage wrapper that uses sessionStorage for tab-specific data
const storage = {
  getItem: (key) => {
    // Try sessionStorage first (tab-specific)
    const sessionValue = sessionStorage.getItem(key);
    if (sessionValue) return sessionValue;
    
    // Fallback to localStorage for backward compatibility
    return localStorage.getItem(key);
  },
  
  setItem: (key, value) => {
    // Store in sessionStorage (tab-specific)
    sessionStorage.setItem(key, value);
    // Also store in localStorage for persistence across refreshes
    localStorage.setItem(key, value);
  },
  
  removeItem: (key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getProfile();
      if (res.data) {
        setUser(res.data);
        storage.setItem("user", JSON.stringify(res.data));
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // If profile fetch fails (e.g., invalid token), clear auth state
      storage.removeItem("token");
      storage.removeItem("user");
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = storage.getItem("token");
    const storedUser = storage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setLoading(false); // Set loading false immediately with cached data
        
        // Fetch fresh data in background without blocking UI
        fetchProfile();
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    // Listen for storage changes from other tabs (localStorage only)
    const handleStorageChange = (e) => {
      // Only handle changes to our auth keys from localStorage
      if (e.key === "token" || e.key === "user") {
        // Check if current tab still has its own session data
        const sessionToken = sessionStorage.getItem("token");
        const sessionUser = sessionStorage.getItem("user");
        
        // If this tab has its own session data, don't sync from other tabs
        if (sessionToken && sessionUser) {
          return; // Keep this tab's own user data
        }

        // Otherwise, sync from localStorage (for tabs without session data)
        const newToken = localStorage.getItem("token");
        const newUser = localStorage.getItem("user");

        if (!newToken || !newUser) {
          setToken(null);
          setUser(null);
          return;
        }

        try {
          const parsedUser = JSON.parse(newUser);
          setToken(newToken);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user from storage event:", error);
        }
      }
    };

    // Add event listener for cross-tab communication
    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchProfile]);

  const login = useCallback((data) => {
    storage.setItem("token", data.token);
    storage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    storage.removeItem("token");
    storage.removeItem("user");

    setToken(null);
    setUser(null);
  }, []);

  const getDepartment = useCallback(() => {
    if (user?.department) {
      if (typeof user.department === "object" && user.department.name) {
        return user.department.name;
      }
      return user.department;
    }
    return null;
  }, [user]);

  const getRole = useCallback(() => {
    if (user?.role) {
      if (typeof user.role === "object" && user.role.name) {
        return user.role.name;
      }
      return user.role;
    }
    return null;
  }, [user]);

  const isAuthenticated = useCallback(() => !!token && !!user, [token, user]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    getDepartment,
    getRole,
  }), [user, token, loading, login, logout, isAuthenticated, getDepartment, getRole]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );  
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
