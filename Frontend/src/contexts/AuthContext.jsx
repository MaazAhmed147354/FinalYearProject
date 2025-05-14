import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/AuthService"; // Import the AuthService

// Helper function to decode JWT token
const decodeJwtToken = (token) => {
  try {
    // JWT tokens are divided into three parts separated by dots
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

// Helper function to extract user ID from JWT token in cookies
const getUserFromCookies = () => {
  try {
    // Get all cookies
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    
    // Find token cookie
    const tokenCookie = cookies.find(cookie => 
      cookie.startsWith('authToken=') || 
      cookie.startsWith('jwt=') || 
      cookie.startsWith('token=')
    );
    
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      const decodedToken = decodeJwtToken(token);
      
      if (decodedToken) {
        return {
          id: decodedToken.id || decodedToken.userId || decodedToken.sub || decodedToken.user_id,
          email: decodedToken.email || "",
          role: decodedToken.role || "",
          name: decodedToken.name || "",
          // Add other relevant user info from token
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user from cookies:", error);
    return null;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on initial load
  useEffect(() => {
    // First try to get user from JWT token in cookies
    const userFromToken = getUserFromCookies();
    
    if (userFromToken) {
      console.log("User retrieved from JWT token:", userFromToken);
      setUser(userFromToken);
      // Update localStorage with more complete user info
      localStorage.setItem("user", JSON.stringify(userFromToken));
    } else {
      // Fallback to localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        console.log("User retrieved from localStorage");
        setUser(JSON.parse(storedUser));
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      // Use AuthService instead of direct axios call
      const response = await AuthService.loginUser(email, password);
      
      // After login, get user info from JWT token
      const userFromToken = getUserFromCookies();
      
      // If we can get user info from token, use that
      if (userFromToken) {
        console.log("User from token after login:", userFromToken);
        setUser(userFromToken);
        localStorage.setItem("user", JSON.stringify(userFromToken));
      } else {
        // Fallback to basic user info
        const userData = { email, id: 3 }; // Default ID if we can't get it from token
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }

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

  // Add a function to get the current user ID
  const getUserId = () => {
    if (user && user.id) {
      return user.id;
    }
    
    // Fallback to decoding the token directly
    const userFromToken = getUserFromCookies();
    if (userFromToken && userFromToken.id) {
      return userFromToken.id;
    }
    
    return 3; // Default to user ID 3 as fallback
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getUserId, // Expose the function to get user ID
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
