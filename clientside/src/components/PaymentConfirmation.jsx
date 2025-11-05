import { useState } from "react";
import PropTypes from "prop-types";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { assets } from "../assets/assets";

const PaymentConfirmation = ({
  appointmentData,
  onPaymentSuccess,
  onCancel,
  isVisible,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  if (!isVisible) return null;

  const handlePaymentSuccess = async (paymentResult) => {
    setIsProcessing(true);
    try {
      // Call the parent's success handler with payment details
      await onPaymentSuccess(paymentResult);
    } catch (error) {
      console.error("Payment confirmation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayLater = () => {
    // Book appointment without payment
    onPaymentSuccess({ paymentMethod: "pay_later", paid: false });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Confirm Appointment
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        {/* Appointment Details */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">
              Appointment Details
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">
                  {appointmentData.doctorName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Speciality:</span>
                <span>{appointmentData.speciality}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{appointmentData.date}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span>{appointmentData.time}</span>
              </div>

              <div className="flex justify-between border-t pt-2 font-semibold">
                <span className="text-gray-600">Consultation Fee:</span>
                <span className="text-green-600">
                  ₹{appointmentData.fee || 650}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          {!showPaymentMethods ? (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">Payment Options</h3>

              <button
                onClick={() => setShowPaymentMethods(true)}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                disabled={isProcessing}
              >
                <img src={assets.tick_icon} alt="" className="w-4 h-4" />
                Pay Now - ₹{appointmentData.fee || 650}
              </button>

              <button
                onClick={handlePayLater}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isProcessing}
              >
                Book Now, Pay Later
              </button>

              <p className="text-xs text-gray-500 text-center">
                You can pay online after booking from &quot;My
                Appointments&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">
                  Select Payment Method
                </h3>
                <button
                  onClick={() => setShowPaymentMethods(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back
                </button>
              </div>

              <PaymentMethodSelector
                appointmentId={appointmentData?._id}
                amount={appointmentData?.fee}
                currency={"INR"}
                country={"IN"}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={() => setShowPaymentMethods(false)}
              />
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

PaymentConfirmation.propTypes = {
  appointmentData: PropTypes.shape({
    doctorName: PropTypes.string.isRequired,
    speciality: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    fee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    appointmentId: PropTypes.string,
  }).isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

export default PaymentConfirmation;
