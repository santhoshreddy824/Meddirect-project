import { useContext, useState, useEffect } from "react";
import { AdminContext } from "../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../context/DoctorContext";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("admin@meddirect.com"); // Default admin email
  const [password, setPassword] = useState("admin123"); // Default admin password
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [isLoading, setIsLoading] = useState(false);

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      console.log("🔍 Testing backend connection to:", backendUrl);

      try {
        setConnectionStatus("checking");

        // Test with root endpoint first
        const rootResponse = await axios.get(backendUrl, { timeout: 5000 });
        console.log("✅ Root endpoint response:", rootResponse.data);

        // Then test admin login endpoint with test credentials
        await axios.post(
          backendUrl + "/api/admin/login",
          { email: "test", password: "test" },
          { timeout: 5000 }
        );

        setConnectionStatus("connected");
        console.log("✅ Backend connection successful");
      } catch (error) {
        console.log("🔍 Connection test error:", error.message);

        if (error.response) {
          // Server responded (even with error) - server is reachable
          setConnectionStatus("connected");
          console.log("✅ Backend is reachable (responded with error)");
        } else if (error.code === "ECONNREFUSED") {
          setConnectionStatus("failed");
          console.error("❌ Connection refused - backend not running");
          toast.error("❌ Cannot connect to backend server on port 4001");
        } else if (
          error.code === "ECONNABORTED" ||
          error.code === "ETIMEDOUT"
        ) {
          setConnectionStatus("failed");
          console.error("❌ Connection timeout");
          toast.error("⏱️ Backend connection timeout");
        } else {
          setConnectionStatus("failed");
          console.error("❌ Unknown connection error:", error);
          toast.error(`❌ Connection error: ${error.message}`);
        }
      }
    };

    if (backendUrl) {
      console.log("🚀 Admin panel initializing with backend:", backendUrl);
      testConnection();
    } else {
      console.error("❌ Backend URL not configured");
      setConnectionStatus("failed");
      toast.error("❌ Backend URL not configured in environment");
    }
  }, [backendUrl]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    console.log("🔐 Login attempt:", {
      state,
      email,
      backendUrl,
      connectionStatus,
    });

    if (connectionStatus === "failed") {
      toast.error("Cannot connect to server. Please check your connection.");
      return;
    }

    if (!backendUrl) {
      toast.error("Backend URL not configured");
      console.error("Backend URL missing:", backendUrl);
      return;
    }

    setIsLoading(true);

    try {
      if (state === "Admin") {
        console.log("🔄 Attempting admin login...");
        const response = await axios.post(
          backendUrl + "/api/admin/login",
          {
            email,
            password,
          },
          {
            timeout: 10000, // 10 second timeout
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("📡 Admin login response:", response.data);

        if (response.data.success) {
          localStorage.setItem("aToken", response.data.token);
          setAToken(response.data.token);
          toast.success("Admin login successful!");
          console.log(
            "✅ Admin login successful, token:",
            response.data.token.substring(0, 20) + "..."
          );

          // Wait a moment for context to update, then test API access
          setTimeout(async () => {
            console.log("🔍 Testing post-login API access...");
            try {
              const testResponse = await axios.get(
                `${backendUrl}/api/admin/dashboard`,
                {
                  headers: { aToken: response.data.token },
                  timeout: 5000,
                }
              );
              console.log(
                "✅ Post-login API test successful:",
                testResponse.data.success
              );
            } catch (testError) {
              console.error(
                "❌ Post-login API test failed:",
                testError.message
              );
              toast.error(
                "⚠️ Login successful but dashboard access failed: " +
                  testError.message
              );
            }
          }, 1000);
        } else {
          toast.error(response.data.message || "Login failed");
          console.error("❌ Admin login failed:", response.data.message);
        }
      } else {
        console.log("🔄 Attempting doctor login...");
        const response = await axios.post(
          backendUrl + "/api/doctor/login",
          {
            email,
            password,
          },
          {
            timeout: 10000, // 10 second timeout
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("📡 Doctor login response:", response.data);

        if (response.data.success) {
          localStorage.setItem("dToken", response.data.token);
          setDToken(response.data.token);
          toast.success("Doctor login successful!");
          console.log(
            "✅ Doctor login successful, token:",
            response.data.token.substring(0, 20) + "..."
          );

          // Wait a moment for context to update, then test API access
          setTimeout(async () => {
            console.log("🔍 Testing post-login doctor API access...");
            try {
              const testResponse = await axios.get(
                `${backendUrl}/api/doctor/dashboard`,
                {
                  headers: { dToken: response.data.token },
                  timeout: 5000,
                }
              );
              console.log(
                "✅ Post-login doctor API test successful:",
                testResponse.data.success
              );
            } catch (testError) {
              console.error(
                "❌ Post-login doctor API test failed:",
                testError.message
              );
              toast.error(
                "⚠️ Doctor login successful but dashboard access failed: " +
                  testError.message
              );
            }
          }, 1000);
        } else {
          toast.error(response.data.message || "Doctor login failed");
          console.error("❌ Doctor login failed:", response.data.message);
        }
      }
    } catch (error) {
      console.error("❌ Login error details:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });

      // Enhanced error handling
      if (error.code === "ECONNREFUSED") {
        toast.error(
          "❌ Server connection refused. Backend may not be running on port 4001."
        );
        setConnectionStatus("failed");
      } else if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        toast.error("⏱️ Request timeout. Server may be slow or down.");
      } else if (error.response?.status === 404) {
        toast.error("🔍 Login endpoint not found. Check server configuration.");
      } else if (error.response?.status === 401) {
        toast.error("🔐 Invalid credentials. Please check email and password.");
      } else if (error.response?.status >= 500) {
        toast.error("🚨 Server error. Please try again later.");
      } else if (error.response?.data?.message) {
        toast.error(`❌ ${error.response.data.message}`);
      } else {
        toast.error(`❌ Login failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary"> {state} </span> Login
        </p>

        {/* Connection Status Indicator
        <div className="w-full text-center mb-2">
          {connectionStatus === "checking" && (
            <div className="flex items-center justify-center gap-2 text-yellow-600">
              <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Checking server connection...</span>
            </div>
          )}
          {connectionStatus === "connected" && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span className="text-xs">
                ✅ Backend Server Connected (Port 4001)
              </span>
            </div>
          )}
          {connectionStatus === "failed" && (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span className="text-xs">❌ Backend Server Disconnected</span>
            </div>
          )}
        </div> */}

        {/* Debug Info */}
        {/* <div className="w-full text-xs text-gray-400 text-center space-y-1">
          <p>Backend: {backendUrl || "Not configured"}</p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-blue-500 underline"
            >
              🔄 Refresh
            </button>
            <button
              type="button"
              onClick={async () => {
                console.log("🧪 Manual backend test");
                try {
                  const response = await axios.get(backendUrl);
                  console.log("✅ Backend test result:", response.data);
                  toast.success(`Backend responding: ${response.data}`);
                } catch (error) {
                  console.error("❌ Backend test failed:", error);
                  toast.error(`Backend test failed: ${error.message}`);
                }
              }}
              className="text-green-500 underline"
            >
              🧪 Test API
            </button>
          </div>
        </div> */}
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="password"
            required
          />
        </div>
        <button
          className="bg-primary text-white w-full px-4 py-2 rounded-md text-base disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || connectionStatus === "failed"}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Logging in...</span>
            </div>
          ) : (
            "Login"
          )}
        </button>
        {state === "Admin" ? (
          <p>
            Doctor Login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => {
                setState("Doctor");
                setEmail("doctor@meddirect.com");
                setPassword("doctor123");
              }}
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => {
                setState("Admin");
                setEmail("admin@meddirect.com");
                setPassword("admin123");
              }}
            >
              Click here
            </span>
          </p>
        )}

        {/* Direct API Test Button */}
        {/* <div className="w-full mt-4">
          <button
            type="button"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm transition-colors"
            onClick={async () => {
              console.log("🧪 Direct API test started");
              try {
                const response = await fetch(`${backendUrl}/api/admin/login`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: "admin@meddirect.com",
                    password: "admin123",
                  }),
                });

                const data = await response.json();
                console.log("🧪 Direct API test result:", data);

                if (data.success) {
                  localStorage.setItem("aToken", data.token);
                  setAToken(data.token);
                  console.log(
                    "🧪 Direct API test - token set:",
                    data.token.substring(0, 20) + "..."
                  );
                  toast.success(
                    "✅ Direct API test successful! Admin logged in."
                  );

                  // Test dashboard access immediately
                  setTimeout(async () => {
                    try {
                      const dashResponse = await fetch(
                        `${backendUrl}/api/admin/dashboard`,
                        {
                          headers: { aToken: data.token },
                        }
                      );
                      const dashData = await dashResponse.json();
                      console.log(
                        "🧪 Direct dashboard test:",
                        dashData.success ? "✅ Success" : "❌ Failed"
                      );
                      if (!dashData.success) {
                        toast.error(
                          "⚠️ Login OK but dashboard failed: " +
                            dashData.message
                        );
                      }
                    } catch (err) {
                      console.error("🧪 Direct dashboard test error:", err);
                      toast.error(
                        "⚠️ Login OK but dashboard error: " + err.message
                      );
                    }
                  }, 500);
                } else {
                  toast.error(
                    "❌ Direct API test failed: " +
                      (data.message || "Unknown error")
                  );
                }
              } catch (error) {
                console.error("🧪 Direct API test error:", error);
                toast.error("❌ Direct API test failed: " + error.message);
              }
            }}
          >
            🧪 Test Direct API Call
          </button>
        </div> */}

        {/* Test Credentials Info */}
        <div className="w-full text-xs text-gray-500 text-center mt-4">
          {state === "Admin" ? (
            <div>
              <p>
                <strong>Test Admin:</strong>
              </p>
              <p>Email: admin@meddirect.com</p>
              <p>Password: admin123</p>
            </div>
          ) : (
            <div>
              <p>
                <strong>Test Doctor:</strong>
              </p>
              <p>Email: richard@meddirect.com</p>
              <p>Password: doctor123</p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default Login;
