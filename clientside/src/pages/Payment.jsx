import { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import DoctorImage from "../components/DoctorImage";
import { detectUserCountry } from "../utils/paymentUtils";
import { getLocalizedPricing } from "../utils/currencyUtils";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, backendUrl } = useContext(AppContext);

  const [appointmentData, setAppointmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("IN"); // Force to India - primary market

  const appointmentId = searchParams.get("appointmentId");
  const debugMode = searchParams.get("debug") === "true";

  useEffect(() => {
    // Check if user is logged in (bypass in debug mode)
    if (!token && !debugMode) {
      console.log("No token found, redirecting to login");
      toast.error("Please log in to make payment");
      navigate("/login");
      return;
    }

    if (debugMode && !token) {
      console.log("🔧 Debug mode: Bypassing authentication");
      toast.info("Debug Mode: Using mock data for testing", {
        autoClose: 2000,
      });
    }

    if (!appointmentId && !debugMode) {
      console.log("No appointment ID provided");
      toast.error("No appointment selected");
      navigate("/my-appointments");
      return;
    }

    if (!appointmentId && debugMode) {
      console.log("🔧 Debug mode: Creating mock appointment");

      // Get proper pricing for standard consultation
      const standardPricing = getLocalizedPricing("standard", "IN");
      console.log("🏷️ Using standard pricing:", standardPricing);

      // In debug mode, create a mock appointment
      setAppointmentData({
        _id: "debug-appointment",
        docData: {
          name: "Dr. Rajesh Kumar",
          speciality: "General Physician",
          degree: "MBBS, MD",
          experience: "8 Years",
          image: "/api/placeholder/150/150",
        },
        userData: {
          name: "Test User",
        },
        slotDate: "15_11_2024",
        slotTime: "10:00 AM",
        amount: standardPricing.inrEquivalent, // Use INR amount (₹650)
        currency: "INR",
        payment: "Not paid",
        pricing: standardPricing,
      });
      setLoading(false);

      // Detect user country
      const detectedCountry = detectUserCountry();
      console.log("Detected country:", detectedCountry);
      setCountry(detectedCountry);
      return;
    }

    // Detect user country
    const detectedCountry = detectUserCountry();
    console.log("Detected country:", detectedCountry);
    setCountry(detectedCountry);

    // Fetch appointment details (only if not in debug mode)
    if (appointmentId && token && !debugMode) {
      const fetchAppointmentDetails = async () => {
        try {
          setLoading(true);
          console.log(
            "Fetching appointments for appointmentId:",
            appointmentId
          );
          const response = await fetch(`${backendUrl}/api/user/appointments`, {
            headers: {
              token: token,
            },
          });

          const data = await response.json();
          console.log("Appointments response:", data);

          if (data.success) {
            console.log("Looking for appointment ID:", appointmentId);
            console.log(
              "Available appointments:",
              data.appointments.map((app) => ({
                id: app._id,
                userId: app.userId,
              }))
            );

            const appointment = data.appointments.find(
              (app) => app._id === appointmentId
            );

            if (!appointment) {
              console.log("Appointment not found in list");
              toast.error("Appointment not found");
              navigate("/my-appointments");
              return;
            }

            if (appointment.payment) {
              toast.info("Payment already completed for this appointment");
              navigate("/my-appointments");
              return;
            }

            setAppointmentData(appointment);
          } else {
            toast.error("Failed to fetch appointment details");
            navigate("/my-appointments");
          }
        } catch (error) {
          console.error("Error fetching appointment:", error);
          toast.error("Failed to fetch appointment details");
          navigate("/my-appointments");
        } finally {
          setLoading(false);
        }
      };

      fetchAppointmentDetails();
    }
  }, [appointmentId, navigate, backendUrl, token, debugMode]);

  // Separate useEffect for listening to debug country changes
  useEffect(() => {
    // Listen for localStorage changes (for debug country changes)
    const handleStorageChange = () => {
      console.log("🔄 Storage changed, re-detecting country...");
      const detectedCountry = detectUserCountry();
      console.log("Re-detected country:", detectedCountry);
      setCountry(detectedCountry);
    };

    // Listen for custom events from debug tools
    const handleDebugCountryChange = () => {
      console.log("🔄 Debug country change event, re-detecting...");
      const detectedCountry = detectUserCountry();
      console.log("Re-detected country:", detectedCountry);
      setCountry(detectedCountry);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("debugCountryChanged", handleDebugCountryChange);

    // Cleanup listeners
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "debugCountryChanged",
        handleDebugCountryChange
      );
    };
  }, []);

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Call our backend payment success endpoint
      const response = await fetch(`${backendUrl}/api/user/payment-success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          appointmentId: appointmentId,
          paymentMethod: paymentData.paymentMethod || "Online", // Fixed to use paymentMethod
          amount: appointmentData.amount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Payment completed successfully!");
        console.log("Payment success:", paymentData);
        navigate("/my-appointments");
      } else {
        toast.error(result.message || "Payment update failed");
      }
    } catch (error) {
      console.error("Payment success handler error:", error);
      toast.error("Failed to update payment status");
    }
  };

  const handlePaymentError = (error) => {
    toast.error("Payment failed. Please try again.");
    console.error("Payment error:", error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!appointmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Appointment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Complete Payment
          </h1>

          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Appointment Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <DoctorImage
                  doctor={appointmentData.docData}
                  className="w-16 h-16 rounded-full object-cover"
                  alt={appointmentData.docData.name}
                />
                <div>
                  <h3 className="font-semibold text-lg">
                    Dr. {appointmentData.docData.name}
                  </h3>
                  <p className="text-gray-600">
                    {appointmentData.docData.speciality}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appointmentData.docData.degree} |{" "}
                    {appointmentData.docData.experience}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {appointmentData.slotDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {appointmentData.slotTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-medium">
                    {appointmentData.userData.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultation Fee:</span>
                  <span className="text-right">
                    <span className="text-lg font-bold text-primary">
                      ₹{appointmentData.amount}
                    </span>
                    <div className="text-xs text-green-600">
                      Indian Rupees (INR)
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <PaymentMethodSelector
            appointmentId={appointmentId}
            amount={appointmentData?.amount}
            currency={appointmentData?.currency || "INR"}
            country={country}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>

        {/* Security & Trust Indicators */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🔒 Secure Payment
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h4 className="font-medium">SSL Encrypted</h4>
              <p className="text-sm text-gray-600">Your data is protected</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h4 className="font-medium">PCI Compliant</h4>
              <p className="text-sm text-gray-600">
                Industry standard security
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h4 className="font-medium">Trusted Providers</h4>
              <p className="text-sm text-gray-600">Stripe, Razorpay, PayPal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
