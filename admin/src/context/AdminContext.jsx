import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currencySymbol = "₹"; // Indian Rupees

  // Function to clear invalid admin tokens
  const clearInvalidAdminToken = () => {
    localStorage.removeItem("aToken");
    setAToken("");
    toast.error("Session expired. Please login again.");
  };

  const getAllDoctors = async () => {
    try {
      console.log(
        "🏥 Fetching all doctors with token:",
        aToken ? "Present" : "Missing"
      );
      console.log("🌐 Backend URL:", backendUrl);

      if (!aToken) {
        toast.error("No authentication token available");
        return;
      }

      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        {
          headers: { aToken },
          timeout: 10000,
        }
      );

      console.log("🏥 All doctors response:", data);

      if (data.success) {
        setDoctors(data.doctors);
        console.log("✅ Doctors loaded successfully:", data.doctors.length);
      } else {
        console.error("❌ Failed to load doctors:", data.message);
        // Handle invalid token errors
        if (
          data.message === "invalid signature" ||
          data.message.includes("invalid")
        ) {
          clearInvalidAdminToken();
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("❌ Get doctors error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });

      // Handle authentication errors
      if (
        error.response &&
        error.response.data &&
        error.response.data.message === "invalid signature"
      ) {
        clearInvalidAdminToken();
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { aToken },
      });

      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);
      } else {
        // Handle invalid token errors
        if (
          data.message === "invalid signature" ||
          data.message.includes("invalid")
        ) {
          clearInvalidAdminToken();
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      // Handle authentication errors
      if (
        error.response &&
        error.response.data &&
        error.response.data.message === "invalid signature"
      ) {
        clearInvalidAdminToken();
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      console.log(
        "📊 Fetching dashboard data with token:",
        aToken ? "Present" : "Missing"
      );
      console.log("🌐 Backend URL:", backendUrl);

      if (!aToken) {
        toast.error("No authentication token available");
        return;
      }

      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { aToken },
        timeout: 10000,
      });

      console.log("📊 Dashboard response:", data);

      if (data.success) {
        setDashData(data.dashData);
        console.log("✅ Dashboard data loaded successfully:", data.dashData);
      } else {
        console.error("❌ Failed to load dashboard data:", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("❌ Get dashboard data error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });

      if (error.response?.status === 401) {
        clearInvalidAdminToken();
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    currencySymbol,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,
    clearInvalidAdminToken,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

AdminContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminContextProvider;
