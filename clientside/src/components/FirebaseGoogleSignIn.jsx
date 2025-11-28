import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { AppContext } from "../context/AppContext";
import {
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  getGoogleRedirectResult,
} from "../services/firebase";

const FirebaseGoogleSignIn = ({ userType = "user" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const processingRedirectRef = useRef(false);
  const navigate = useNavigate();
  const { setToken, backendUrl } = useContext(AppContext);

  // Flag for rendering controls (avoid early return before hooks)
  const isUserType = userType === "user";

  // Centralized backend exchange after Firebase user acquisition
  const finalizeAuth = useCallback(
    async (user) => {
      // Validate required user data
      if (!user.email) {
        throw new Error(
          "Email not provided by Google. Please try a different sign-in method."
        );
      }

      // Get Firebase ID token
      const idToken = await user.getIdToken();
      console.log("🔑 Firebase ID token obtained");

      // Prepare user data for backend
      const userData = {
        firebaseUid: user.uid,
        name: user.displayName || "Google User",
        email: user.email,
        imageUrl: user.photoURL || null,
        idToken: idToken, // Firebase ID token for verification
      };

      console.log(
        "🚀 Sending Firebase user data to backend (popup/redirect)...",
        {
          ...userData,
          idToken: "[HIDDEN]",
          flow: redirectAttempted ? "redirect" : "popup",
        }
      );

      const response = await fetch(`${backendUrl}/api/user/firebase-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend response error:", errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Backend authentication response:", {
        ...data,
        token: data.token ? "[RECEIVED]" : "[MISSING]",
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success(`Welcome ${data.user?.name || userData.name}! 🎉`);
        console.log(
          "🎉 Google Sign-In completed successfully via",
          redirectAttempted ? "redirect" : "popup"
        );
        navigate("/");
      } else {
        throw new Error(data.message || "Authentication failed");
      }
    },
    [redirectAttempted, backendUrl, setToken, navigate]
  );

  // Decide strategy: prefer redirect on mobile/iOS Safari for reliability
  const shouldUseRedirectFirst = () => {
    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium/i.test(ua);
    // iOS Safari + some Android WebViews are very picky with popups
    return isMobile || isSafari;
  };

  // Process redirect result if we have returned from a redirect flow
  useEffect(() => {
    const processRedirect = async () => {
      if (processingRedirectRef.current) return;
      processingRedirectRef.current = true;
      try {
        setIsLoading(true);
        const redirectResult = await getGoogleRedirectResult();
        if (redirectResult && redirectResult.user) {
          console.group("🔄 Firebase redirect result");
          console.log("UID", redirectResult.user.uid);
          console.log("Email", redirectResult.user.email);
          console.groupEnd();
          setRedirectAttempted(true);
          await finalizeAuth(redirectResult.user);
        }
      } catch (err) {
        if (err?.code === "auth/no-auth-event") {
          // Normal when no redirect happened
        } else {
          console.error("Redirect processing error", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    processRedirect();
  }, [finalizeAuth]);

  const handleGoogleSignIn = async (isRetry = false) => {
    try {
      setIsLoading(true);

      if (!isRetry) {
        console.log("🔐 Starting Firebase Google Sign-In...");
      } else {
        console.log("🔄 Retrying Firebase Google Sign-In...");
      }

      // Show user-friendly message about popup
      if (!isRetry && retryCount === 0) {
        toast.info("Opening Google Sign-In popup...", { autoClose: 2000 });
      }

      // Check if popup blockers might be active
      const userAgent = navigator.userAgent;
      if (userAgent.includes("Chrome") && !window.chrome) {
        toast.warn(
          "Please disable popup blockers for Google Sign-In to work properly."
        );
      }

      // Decide initial strategy
      if (!isRetry && shouldUseRedirectFirst()) {
        console.log("📱 Using redirect flow due to mobile/Safari environment");
        setRedirectAttempted(true);
        toast.info("Redirecting to Google...", { autoClose: 1500 });
        await signInWithGoogleRedirect();
        return; // Flow continues after redirect
      }

      // Sign in with Firebase Google popup (primary attempt on desktop)
      const result = await signInWithGooglePopup();

      if (!result || !result.user) {
        throw new Error("No user data received from Google");
      }

      const user = result.user;

      console.log("✅ Firebase authentication successful:", {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        verified: user.emailVerified,
      });

      // Reset retry count on success
      setRetryCount(0);
      await finalizeAuth(user);
    } catch (error) {
      console.error("❌ Firebase Google Sign-In error:", error);

      let errorMessage = "Google Sign-In failed";
      let showRetryOption = false;

      // Handle specific Firebase Auth errors
      if (error.code === "auth/popup-closed-by-user") {
        setRetryCount((prev) => prev + 1);

        if (retryCount < 2) {
          errorMessage = "Sign-in popup was closed. Click below to try again.";
          showRetryOption = true;
          toast.warn(errorMessage, { autoClose: 4000 });
        } else {
          errorMessage =
            "Sign-in was cancelled multiple times. Please complete the Google authentication process.";
          toast.error(errorMessage);
        }
        return; // Don't show error toast for cancellation
      } else if (error.code === "auth/popup-blocked") {
        errorMessage =
          "Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.";
        showRetryOption = true;
        toast.warn(errorMessage, { autoClose: 6000 });
        // Attempt redirect fallback if not yet tried
        if (!redirectAttempted) {
          console.log("⚠️ Popup blocked, attempting redirect fallback...");
          setRedirectAttempted(true);
          toast.info("Switching to redirect sign-in...");
          try {
            await signInWithGoogleRedirect();
            return;
          } catch (redirErr) {
            console.error("Redirect fallback failed", redirErr);
          }
        }
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
        showRetryOption = true;
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Too many failed attempts. Please try again in a few minutes.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This Google account has been disabled.";
      } else if (error.message.includes("Backend error")) {
        errorMessage =
          "Server connection failed. Please ensure the backend is running.";
        showRetryOption = true;
      } else if (error.message) {
        errorMessage = error.message;
        showRetryOption = true;
      }

      // If multiple popup closures -> redirect fallback
      if (retryCount >= 2 && !redirectAttempted) {
        console.log(
          "🔁 Multiple popup closures, auto-switching to redirect flow"
        );
        setRedirectAttempted(true);
        try {
          toast.info("Redirecting to Google sign-in...");
          await signInWithGoogleRedirect();
          return;
        } catch (redirErr) {
          console.error("Redirect attempt failed", redirErr);
        }
      }

      if (!showRetryOption || retryCount >= 2) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return isUserType ? (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={() => handleGoogleSignIn(false)}
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

      {/* Retry button for cancelled attempts */}
      {retryCount > 0 && retryCount < 3 && !isLoading && !redirectAttempted && (
        <button
          type="button"
          onClick={() => handleGoogleSignIn(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Google Sign-In Again (Popup)
        </button>
      )}

      {redirectAttempted && !isLoading && (
        <p className="text-xs text-gray-500 text-center">
          Redirect flow activated. If nothing happens, ensure this domain is
          authorized in your Firebase console.
        </p>
      )}

      {/* Status helper text removed per request */}
    </div>
  ) : null;
};

FirebaseGoogleSignIn.propTypes = {
  userType: PropTypes.string,
};

export default FirebaseGoogleSignIn;
