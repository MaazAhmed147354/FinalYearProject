import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/AuthService"; // Import the AuthService

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      // Use AuthService instead of direct axios call
      const response = await AuthService.loginUser(email, password);

      // Store basic user info in localStorage
      const userData = { email };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true, redirectUrl: response.data.redirectUrl };
    } catch (error) {
      console.error("Login error:", error);
      throw error.response?.data?.message || "Login failed";
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);

      // Use AuthService instead of direct axios call
      const response = await AuthService.registerUser(
        userData.name,
        userData.email,
        userData.password,
        userData.role,
        userData.department
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration error:", error);
      throw error.response?.data?.message || "Registration failed";
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Use AuthService instead of direct axios call
      await AuthService.logoutUser();

      setUser(null);
      localStorage.removeItem("user");

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
