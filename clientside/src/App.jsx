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
import MedicationGuide from "./pages/MedicationGuide";
import MedicineDemo from "./pages/MedicineDemo";
import MedicineDemoNew from "./pages/MedicineDemoNew";
import HealthAssessment from "./pages/HealthAssessment";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Payment from "./pages/Payment";
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

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AppContext);
  return token ? children : <Navigate to="/login" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const App = () => {
  const { token } = useContext(AppContext);
  console.log("[App.jsx] Rendering. Token:", token);

  return (
    <ErrorBoundary>
      <div className="mx-4 sm:mx-[10%]">
        <ToastContainer />
        {token && <Navbar />}
        <Routes>
          <Route
            path="/login"
            element={!token ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <ProtectedRoute>
                <Doctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors/:speciality"
            element={
              <ProtectedRoute>
                <Doctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointment/:docId"
            element={
              <ProtectedRoute>
                <Appointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals"
            element={
              <ProtectedRoute>
                <HospitalSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medications"
            element={
              <ProtectedRoute>
                <MedicationGuide />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medicine-demo"
            element={
              <ProtectedRoute>
                <MedicineDemo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medicine-database"
            element={
              <ProtectedRoute>
                <MedicineDemoNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-assessment"
            element={
              <ProtectedRoute>
                <HealthAssessment />
              </ProtectedRoute>
            }
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route
            path="*"
            element={<Navigate to={token ? "/" : "/login"} replace />}
          />
        </Routes>
        {token && <Footer />}
      </div>
    </ErrorBoundary>
  );
};

App.propTypes = {
  children: PropTypes.node,
};

export default App;
