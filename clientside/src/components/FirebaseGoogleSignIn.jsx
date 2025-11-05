import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { AppContext } from "../context/AppContext";
import { signInWithGooglePopup } from "../services/firebase";

const FirebaseGoogleSignIn = ({ userType = "user" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, backendUrl } = useContext(AppContext);

  // Only show for user type (patients)
  if (userType !== "user") {
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log("🔐 Starting Firebase Google Sign-In...");

      // Sign in with Firebase Google popup
      const result = await signInWithGooglePopup();
      const user = result.user;

      console.log("✅ Firebase authentication successful:", {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
      });

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Prepare user data for backend
      const userData = {
        firebaseUid: user.uid,
        name: user.displayName || "Firebase User",
        email: user.email,
        imageUrl: user.photoURL,
        idToken: idToken, // Firebase ID token for verification
      };

      console.log("🚀 Sending Firebase user data to backend...");

      // Send to your backend for verification and user creation/login
      const response = await fetch(`${backendUrl}/api/user/firebase-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        // Store your app's JWT token
        localStorage.setItem("token", data.token);
        setToken(data.token);

        toast.success(`Welcome ${data.user.name}! 🎉`);
        navigate("/");
      } else {
        throw new Error(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("❌ Firebase Google Sign-In error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        toast.info("Sign-in cancelled");
      } else if (error.code === "auth/popup-blocked") {
        toast.error("Pop-up blocked. Please allow pop-ups and try again.");
      } else {
        toast.error("Google Sign-In failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span className="font-medium">
          {isLoading ? "Signing in..." : "Continue with Google"}
        </span>
      </button>

      <div className="mt-2 text-xs text-center text-green-600">
        ✓ Firebase Google Sign-In Ready
      </div>
    </div>
  );
};

FirebaseGoogleSignIn.propTypes = {
  userType: PropTypes.string,
};

export default FirebaseGoogleSignIn;
