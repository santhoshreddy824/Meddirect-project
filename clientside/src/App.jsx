import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { AppContext } from "./context/AppContext";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import HospitalSearch from "./pages/HospitalSearch";
import HospitalDetails from "./pages/HospitalDetails";
import MedicationGuide from "./pages/MedicationGuide";
import MedicineDemo from "./pages/MedicineDemo";
import MedicineDemoNew from "./pages/MedicineDemoNew";
import HealthAssessment from "./pages/HealthAssessment";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Payment from "./pages/Payment";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Error Boundary to catch fatal errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 40,
            color: "red",
            background: "#fff0f0",
            fontFamily: "monospace",
          }}
        >
          <h1>🚨 Something went wrong in the UI</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <p>Check the browser console for more details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AppContext);
  return token ? children : <Navigate to="/login" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const App = () => {
  const { token } = useContext(AppContext);

  // If no token, always show login page with basic navbar
  if (!token) {
    return (
      <ErrorBoundary>
        <div className="mx-4 sm:mx-[10%]">
          <ToastContainer />
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />
            {/* Redirect all other routes to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </ErrorBoundary>
    );
  }

  // If token exists, show full app with protected routes
  return (
    <ErrorBoundary>
      <div className="mx-4 sm:mx-[10%]">
        <ToastContainer />
        <Navbar />
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/hospitals" element={<HospitalSearch />} />
          <Route path="/hospital/:hospitalId" element={<HospitalDetails />} />
          <Route path="/medications" element={<MedicationGuide />} />
          <Route path="/medicine-demo" element={<MedicineDemo />} />
          <Route path="/medicine-database" element={<MedicineDemoNew />} />
          <Route path="/health-assessment" element={<HealthAssessment />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

App.propTypes = {
  children: PropTypes.node,
};

export default App;
