import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { doctors as localDoctors } from "../assets/assets";

export const AppContext = createContext();

console.log("[AppContext] Initializing AppContextProvider");

const AppContextProvider = (props) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  console.log("[AppContext] backendUrl:", backendUrl);

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(false); // Don't initialize from localStorage directly
  const [userData, setUserData] = useState(false);

  // Function to clear invalid tokens
  const clearInvalidToken = useCallback(() => {
    console.log("🧹 Clearing invalid token from storage");
    localStorage.removeItem("token");
    setToken(false);
    setUserData(false);
  }, []);

  // Function to validate token format
  const isValidTokenFormat = useCallback((token) => {
    if (!token || typeof token !== "string") return false;
    // JWT tokens have 3 parts separated by dots
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Check if each part is valid base64
    try {
      parts.forEach((part) => {
        if (part.length === 0) throw new Error("Empty part");
        // Add padding if needed
        const paddedPart = part + "=".repeat((4 - (part.length % 4)) % 4);
        atob(paddedPart.replace(/-/g, "+").replace(/_/g, "/"));
      });
      return true;
    } catch (e) {
      console.log("🚨 Invalid token structure:", e.message);
      return false;
    }
  }, []);

  // Initialize and validate token on load
  const initializeAuth = useCallback(() => {
    const storedToken = localStorage.getItem("token");
    console.log(
      "🔍 Initializing auth, stored token:",
      storedToken ? "Found" : "None"
    );

    if (storedToken) {
      if (isValidTokenFormat(storedToken)) {
        console.log("✅ Token format valid, setting token");
        setToken(storedToken);
      } else {
        console.log("🚨 Invalid token format detected, clearing...");
        localStorage.removeItem("token");
        setToken(false);
        setUserData(false);
      }
    } else {
      console.log("📝 No stored token found");
      setToken(false);
    }
  }, [isValidTokenFormat]);

  const getDoctorsData = useCallback(async () => {
    // Always start with local doctors as fallback for immediate image display
    setDoctors(localDoctors);

    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        // Use backend doctors data directly - they already have correct image references
        setDoctors(data.doctors);
        console.log(
          "Successfully loaded doctors from backend",
          data.doctors.length,
          "doctors"
        );
      } else {
        console.log("Backend API failed, using local doctors:", data.message);
      }
    } catch (error) {
      console.log("API error, using local fallback doctor data:", error);
    }
  }, [backendUrl]);

  const loadUserProfileData = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.user);
      } else {
        // If token is invalid, clear it and log out user
        if (
          data.message === "invalid signature" ||
          data.message.includes("invalid") ||
          data.message.includes("Session expired due to security update") ||
          data.code === "INVALID_SIGNATURE"
        ) {
          clearInvalidToken();
          toast.error("Session expired. Please login again.");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.log(error);
      // Handle network errors or token issues
      if (
        error.response &&
        error.response.data &&
        (error.response.data.message === "invalid signature" ||
          error.response.data.message.includes(
            "Session expired due to security update"
          ) ||
          error.response.data.code === "INVALID_SIGNATURE")
      ) {
        clearInvalidToken();
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.message);
      }
    }
  }, [backendUrl, token, clearInvalidToken]);

  // Enhanced token setter with validation
  const setTokenWithValidation = useCallback(
    (newToken) => {
      if (newToken) {
        if (isValidTokenFormat(newToken)) {
          console.log("✅ Setting valid token");
          localStorage.setItem("token", newToken);
          setToken(newToken);
        } else {
          console.log("🚨 Attempted to set invalid token, rejecting");
          localStorage.removeItem("token");
          setToken(false);
          setUserData(false);
        }
      } else {
        console.log("🧹 Clearing token");
        localStorage.removeItem("token");
        setToken(false);
        setUserData(false);
      }
    },
    [isValidTokenFormat]
  );

  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken: setTokenWithValidation, // Use enhanced version
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    clearInvalidToken,
  };

  useEffect(() => {
    // Initialize authentication on app load
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    getDoctorsData();
  }, [getDoctorsData]);

  // Auto-refresh doctors data every 10 seconds to catch profile updates quickly
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing doctors data...");
      getDoctorsData();
    }, 10000); // 10 seconds for faster updates

    return () => clearInterval(interval);
  }, [getDoctorsData]);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token, loadUserProfileData]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppContextProvider;
