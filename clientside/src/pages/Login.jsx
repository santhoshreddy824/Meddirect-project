import { useContext, useEffect, useState, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import FirebaseGoogleSignIn from "../components/FirebaseGoogleSignIn";
import CaptchaComponent from "../components/CaptchaComponent";
import { assets } from "../assets/assets";

// Configure axios defaults for better error handling (Render cold-starts can take >10s)
axios.defaults.timeout = 25000; // 25 seconds default timeout
axios.defaults.headers.common["Content-Type"] = "application/json";

const Login = () => {
  const { backendUrl, token, setToken, clearInvalidToken } =
    useContext(AppContext);
  const navigate = useNavigate();

  const [state, setState] = useState("Sign Up");
  const [connectionStatus, setConnectionStatus] = useState("checking");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Terms and Privacy Policy states
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  // CAPTCHA state
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Forgot Password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Clear any invalid tokens on login page load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      // Check if token is valid format
      const parts = storedToken.split(".");
      if (parts.length !== 3) {
        console.log("🧹 Clearing invalid token from login page");
        clearInvalidToken();
        toast.info("Previous session was invalid. Please login again.");
      }
    }
  }, [clearInvalidToken]);

  // Test backend connection on component mount
  const testConnection = useCallback(async () => {
    if (!backendUrl) {
      setConnectionStatus("failed");
      return;
    }

    console.log("🔌 Testing backend connection...");
    setConnectionStatus("testing");

    const healthUrl = backendUrl.endsWith("/")
      ? backendUrl + "api/health"
      : backendUrl + "/api/health";

    const tryOnce = async () => {
      return axios.get(healthUrl, { timeout: 20000 }); // allow up to 20s for cold start
    };

    try {
      await tryOnce();
      console.log("✅ Backend health OK");
      setConnectionStatus("connected");
    } catch (e1) {
      console.warn(
        "⚠️ First health check failed, retrying shortly...",
        e1?.message
      );
      // brief backoff then one more try (handles Render cold start)
      await new Promise((r) => setTimeout(r, 1500));
      try {
        await tryOnce();
        console.log("✅ Backend health OK on retry");
        setConnectionStatus("connected");
      } catch (e2) {
        console.error("❌ Backend connection failed after retry:", e2);
        setConnectionStatus("failed");
        toast.error(
          "Cannot connect to server right now. Please try again in a few seconds."
        );
      }
    }
  }, [backendUrl]);

  // CAPTCHA handlers
  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
    setCaptchaVerified(true);
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
    setCaptchaVerified(false);
    toast.error("CAPTCHA expired. Please verify again.");
  };

  const handleCaptchaError = () => {
    setCaptchaToken(null);
    setCaptchaVerified(false);
    toast.error("CAPTCHA verification failed. Please try again.");
  };

  // Forgot Password handler
  const handleForgotPassword = async (event) => {
    event.preventDefault();

    if (!forgotEmail || !forgotEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setForgotLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/user/forgot-password`,
        { email: forgotEmail },
        { timeout: 15000 }
      );

      if (data.success) {
        toast.success(data.message || "Password reset link sent to your email");
        setShowForgotPassword(false);
        setForgotEmail("");
      } else {
        toast.error(data.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Clear any previous error states
    setConnectionStatus("connected");

    // Validation for sign up
    if (state === "Sign Up") {
      // Validate name
      if (!name || name.trim().length < 2) {
        toast.error("Please enter a valid name (at least 2 characters)");
        return;
      }

      // Validate email
      if (!email || !email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Validate password
      if (!password || password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }

      // Check terms and privacy acceptance
      if (!acceptedTerms || !acceptedPrivacy) {
        toast.error(
          "Please accept the Terms and Conditions and Privacy Policy to continue."
        );
        return;
      }

      // Check CAPTCHA (only for sign up)
      if (!captchaVerified) {
        toast.error("Please complete the CAPTCHA verification.");
        return;
      }
    } else {
      // Login validation
      if (!email || !email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (!password || password.length < 1) {
        toast.error("Please enter your password");
        return;
      }
    }

    try {
      console.log("🔐 Authentication attempt starting...");
      console.log("Backend URL:", backendUrl);
      console.log("State:", state);
      console.log("Email:", email);

      if (!backendUrl) {
        toast.error(
          "Backend URL is not configured. Please check your environment variables."
        );
        return;
      }

      if (state === "Sign Up") {
        console.log("📝 Attempting user registration...");

        const registrationData = {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          captchaToken,
        };

        console.log("Registration data:", {
          ...registrationData,
          password: "[HIDDEN]",
        });

        const { data } = await axios.post(
          backendUrl + "/api/user/register",
          registrationData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 15000, // 15 seconds timeout
          }
        );

        console.log("Registration response:", data);

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Account created successfully! Welcome to MedDirect!");

          // Clear form
          setName("");
          setEmail("");
          setPassword("");
          setCaptchaToken(null);
          setCaptchaVerified(false);
          setAcceptedTerms(false);
          setAcceptedPrivacy(false);
        } else {
          toast.error(data.message || "Registration failed. Please try again.");
        }
      } else {
        console.log("🔑 Attempting user login...");

        const loginData = {
          email: email.toLowerCase().trim(),
          password,
        };

        console.log("Login data:", { ...loginData, password: "[HIDDEN]" });

        const { data } = await axios.post(
          backendUrl + "/api/user/login",
          loginData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 15000, // 15 seconds timeout
          }
        );

        console.log("Login response:", data);

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Login successful! Welcome back!");

          // Clear form
          setEmail("");
          setPassword("");
        } else {
          toast.error(
            data.message || "Login failed. Please check your credentials."
          );
        }
      }
    } catch (error) {
      console.error("❌ Authentication error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error message:", error.message);

      let errorMessage = "An error occurred during authentication";

      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timeout. Please check your internet connection and try again.";
      } else if (
        error.code === "ERR_NETWORK" ||
        error.code === "NETWORK_ERROR"
      ) {
        errorMessage =
          "Network error: Cannot connect to server. Please check if the server is running on http://localhost:4001";
        setConnectionStatus("failed");
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data?.message ||
          "Invalid request. Please check your input.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      // Reset CAPTCHA on error for sign up
      if (state === "Sign Up") {
        setCaptchaVerified(false);
        setCaptchaToken(null);
      }
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Test backend connection on mount
  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-primary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img
            src={assets.logo}
            alt="MedDirect Logo"
            className="mx-auto h-16 w-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {state === "Sign Up" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-gray-600">
            {state === "Sign Up"
              ? "Join MedDirect for seamless healthcare"
              : "Sign in to your account"}
          </p>

          {/* Connection Status */}
          {connectionStatus === "testing" && (
            <div className="flex items-center justify-center mt-4 p-2 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-600 text-sm">
                Connecting to server...
              </span>
            </div>
          )}
          {connectionStatus === "failed" && (
            <div className="flex items-center justify-center mt-4 p-2 bg-red-50 rounded-lg">
              <span className="text-red-600 text-sm">
                ❌ Server connection failed
              </span>
            </div>
          )}
          {connectionStatus === "connected" && (
            <div className="flex items-center justify-center mt-4 p-2 bg-green-50 rounded-lg">
              <span className="text-green-600 text-sm">
                ✅ Server connected
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="mt-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="space-y-5">
              {state === "Sign Up" && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                </div>
                {state === "Sign Up" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>

              {/* CAPTCHA for Sign Up */}
              {state === "Sign Up" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Verification
                  </label>
                  <CaptchaComponent
                    onVerify={handleCaptchaVerify}
                    onExpired={handleCaptchaExpired}
                    onError={handleCaptchaError}
                  />
                </div>
              )}

              {/* Terms and Privacy Policy Checkboxes */}
              {state === "Sign Up" && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-gray-700">
                        I agree to the{" "}
                        <Link
                          to="/terms-and-conditions"
                          className="text-primary hover:text-primary/80 underline"
                          target="_blank"
                        >
                          Terms and Conditions
                        </Link>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="privacy"
                        type="checkbox"
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="privacy" className="text-gray-700">
                        I agree to the{" "}
                        <Link
                          to="/privacy-policy"
                          className="text-primary hover:text-primary/80 underline"
                          target="_blank"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-primary to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary/90 hover:to-blue-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-200 transform hover:scale-[1.02]"
            >
              {state === "Sign Up" ? "Create Account" : "Sign In"}
            </button>

            {/* Forgot Password Link */}
            {state === "Login" && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition duration-200"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Google Sign In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <FirebaseGoogleSignIn userType="user" />
              </div>
            </div>

            {/* Toggle State */}
            <div className="mt-6 text-center">
              {state === "Sign Up" ? (
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setState("Login")}
                    className="font-medium text-primary hover:text-primary/80 transition duration-200"
                  >
                    Sign in here
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setState("Sign Up")}
                    className="font-medium text-primary hover:text-primary/80 transition duration-200"
                  >
                    Create one now
                  </button>
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
              {/* Close button */}
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail("");
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Modal content */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h3>
                <p className="text-sm text-gray-600">
                  Enter your email address and we&apos;ll send you a link to
                  reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail("");
                  }}
                  className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <Link
              to="/terms-and-conditions"
              className="text-primary hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
