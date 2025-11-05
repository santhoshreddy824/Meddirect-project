import PropTypes from "prop-types";
import { useState } from "react";

const PaymentMethodSelector = ({
  appointmentId,
  amount,
  currency,
  country,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("instamojo");

  // Simulate payment gateway integration
  const handlePay = async () => {
    setIsProcessing(true);
    try {
      // Here you would integrate with Instamojo, Razorpay, etc.
      // For demo, simulate a successful payment after 1s
      setTimeout(() => {
        onPaymentSuccess({
          paymentMethod: selectedMethod, // Fixed to match backend expectations
          paid: selectedMethod !== "pay_later",
          paymentId: `${selectedMethod}-demo-${Date.now()}`,
          amount: amount,
          appointmentId: appointmentId,
        });
        setIsProcessing(false);
      }, 1000);
    } catch (err) {
      setIsProcessing(false);
      onPaymentError && onPaymentError(err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-2">Choose Payment Method:</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment-method"
              value="instamojo"
              checked={selectedMethod === "instamojo"}
              onChange={() => setSelectedMethod("instamojo")}
            />
            Instamojo (UPI, Cards, Netbanking)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment-method"
              value="razorpay"
              checked={selectedMethod === "razorpay"}
              onChange={() => setSelectedMethod("razorpay")}
            />
            Razorpay (UPI, Cards)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment-method"
              value="pay_later"
              checked={selectedMethod === "pay_later"}
              onChange={() => setSelectedMethod("pay_later")}
            />
            Book Now, Pay Later
          </label>
        </div>
      </div>
      <button
        className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        onClick={handlePay}
        disabled={isProcessing}
      >
        {isProcessing
          ? "Processing..."
          : selectedMethod === "pay_later"
          ? "Book Without Payment"
          : `Pay Now - ${currency} ${amount}`}
      </button>
    </div>
  );
};

PaymentMethodSelector.propTypes = {
  appointmentId: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  country: PropTypes.string,
  onPaymentSuccess: PropTypes.func.isRequired,
  onPaymentError: PropTypes.func,
};

export default PaymentMethodSelector;
