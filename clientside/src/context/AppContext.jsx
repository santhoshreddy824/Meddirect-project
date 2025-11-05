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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [userData, setUserData] = useState(false);

  // Function to trigger refresh of doctors data
  const refreshDoctorsData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Function to clear invalid tokens
  const clearInvalidToken = useCallback(() => {
    localStorage.removeItem("token");
    setToken(false);
    setUserData(false);
  }, []);

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
  }, [backendUrl, refreshTrigger]);

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
          data.message.includes("invalid")
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
        error.response.data.message === "invalid signature"
      ) {
        clearInvalidToken();
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.message);
      }
    }
  }, [backendUrl, token, clearInvalidToken]);

  const value = {
    doctors,
    getDoctorsData,
    refreshDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    clearInvalidToken,
  };

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
