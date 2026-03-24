"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "@/services/userApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken) => {
    try {
      const res = await getProfile();
      if (res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const getDepartment = () => {
    if (user?.department) {
      if (typeof user.department === "object" && user.department.name) {
        return user.department.name;
      }
      return user.department;
    }
    return null;
  };

  const getRole = () => {
    if (user?.role) {
      if (typeof user.role === "object" && user.role.name) {
        return user.role.name;
      }
      return user.role;
    }
    return null;
  };

  const isAuthenticated = () => !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        getDepartment,
        getRole,
      }}
    >
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
