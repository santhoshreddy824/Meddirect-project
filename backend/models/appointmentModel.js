import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  date: { type: Number, required: true },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  paymentId: { type: String }, // Payment ID from different providers
  paymentMethod: { 
    type: String, 
    enum: ['stripe', 'razorpay', 'paypal', 'instamojo', 'bank_transfer', 'pay_later'],
    default: "pay_later" 
  },
  paymentData: {
    orderId: { type: String }, // For Razorpay/PayPal
    captureId: { type: String }, // For PayPal
    signature: { type: String }, // For Razorpay
    paymentRequestId: { type: String }, // For Instamojo
    currency: { type: String, default: "USD" },
    method: { type: String } // Specific payment method used
  },
  country: { type: String, default: "US" }, // Country for payment method selection
  isCompleted: { type: Boolean, default: false },
});

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
