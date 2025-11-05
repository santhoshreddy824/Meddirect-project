import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment details from URL params (Instamojo callback)
        const paymentId = searchParams.get("payment_id");
        const paymentRequestId = searchParams.get("payment_request_id");
        const appointmentId = searchParams.get("appointmentId");

        // Get stored payment info from localStorage
        const storedPayment = localStorage.getItem("instamojo_payment");
        let paymentInfo = null;

        if (storedPayment) {
          paymentInfo = JSON.parse(storedPayment);
          localStorage.removeItem("instamojo_payment"); // Clean up
        }

        if (paymentId && paymentRequestId) {
          // Instamojo payment verification
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/payment/confirm`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
              },
              body: JSON.stringify({
                paymentId,
                orderId: paymentRequestId,
                appointmentId: appointmentId || paymentInfo?.appointmentId,
                paymentMethod: "instamojo",
              }),
            }
          );

          const data = await response.json();

          if (data.success) {
            setStatus("success");
            setPaymentDetails({
              paymentMethod: "Instamojo",
              paymentId,
              amount: paymentInfo?.amount,
              appointmentId: appointmentId || paymentInfo?.appointmentId,
            });
            toast.success("Payment completed successfully!");
          } else {
            setStatus("failed");
            toast.error(data.message || "Payment verification failed");
          }
        } else {
          // Check for other payment method callbacks
          const sessionId = searchParams.get("session_id"); // Stripe
          const paypalPaymentId = searchParams.get("paymentId"); // PayPal

          if (sessionId || paypalPaymentId) {
            setStatus("success");
            setPaymentDetails({
              paymentMethod: sessionId ? "Stripe" : "PayPal",
              paymentId: sessionId || paypalPaymentId,
            });
            toast.success("Payment completed successfully!");
          } else {
            setStatus("failed");
            toast.error(
              "Payment verification failed - no payment information found"
            );
          }
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        toast.error("Payment verification failed");
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    if (paymentDetails?.appointmentId) {
      navigate(`/my-appointments`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Verifying Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Payment Successful!
            </h2>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-green-700 font-semibold mb-2">
                Your appointment has been confirmed
              </p>
              {paymentDetails && (
                <div className="text-sm text-green-600 space-y-1">
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {paymentDetails.paymentMethod}
                  </p>
                  <p>
                    <strong>Payment ID:</strong> {paymentDetails.paymentId}
                  </p>
                  {paymentDetails.amount && (
                    <p>
                      <strong>Amount:</strong> ₹{paymentDetails.amount}
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              View My Appointments
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              Payment Failed
            </h2>
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-red-700">
                There was an issue processing your payment. Please try again or
                contact support.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/payment")}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Go Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
