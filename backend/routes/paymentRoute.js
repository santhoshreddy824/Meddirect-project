import express from 'express';
import authUser from '../middlewares/authUser.js';
import {
  getPaymentMethods,
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  handleWebhook,
  confirmMockPayment
} from '../controllers/paymentController.js';

const paymentRouter = express.Router();

// Get available payment methods for a country/region
paymentRouter.get('/methods', getPaymentMethods);

// Create payment intent for various gateways
paymentRouter.post('/create-intent', authUser, createPaymentIntent);

// Confirm payment after successful transaction
paymentRouter.post('/confirm', authUser, confirmPayment);

// Mock payment confirmation for development
paymentRouter.post('/confirm-mock', authUser, confirmMockPayment);

// Get payment status for an appointment
paymentRouter.get('/status/:appointmentId', authUser, getPaymentStatus);

// Webhook endpoints for different payment providers
paymentRouter.post('/webhook/:provider', handleWebhook);

// Legacy endpoints for backward compatibility
// Stripe payment intent
paymentRouter.post('/stripe', authUser, async (req, res) => {
    try {
        const { amount } = req.body;
        
        // Basic validation
        if (!amount || amount <= 0) {
            return res.json({ success: false, message: 'Invalid amount' });
        }

        // For now, return a mock response
        // In production, integrate with actual Stripe API
        res.json({
            success: true,
            message: 'Payment intent created successfully',
            client_secret: 'mock_payment_intent_client_secret',
            amount: amount
        });

    } catch (error) {
        console.log('Stripe payment error:', error);
        res.json({ success: false, message: error.message });
    }
});

// Razorpay payment verification
paymentRouter.post('/razorpay', authUser, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        // Basic validation
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.json({ success: false, message: 'Missing payment verification data' });
        }

        // For now, return a mock response
        // In production, verify with actual Razorpay API
        res.json({
            success: true,
            message: 'Payment verified successfully',
            payment_id: razorpay_payment_id
        });

    } catch (error) {
        console.log('Razorpay verification error:', error);
        res.json({ success: false, message: error.message });
    }
});

// Create Razorpay order
paymentRouter.post('/razorpay/order', authUser, async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;
        
        // Basic validation
        if (!amount || amount <= 0) {
            return res.json({ success: false, message: 'Invalid amount' });
        }

        // For now, return a mock response
        // In production, create actual Razorpay order
        res.json({
            success: true,
            order: {
                id: 'mock_order_' + Date.now(),
                amount: amount * 100, // Convert to smallest currency unit
                currency: currency,
                receipt: 'receipt_' + Date.now()
            }
        });

    } catch (error) {
        console.log('Razorpay order creation error:', error);
        res.json({ success: false, message: error.message });
    }
});

// Instamojo payment (for Indian market)
paymentRouter.post('/instamojo', authUser, async (req, res) => {
    try {
        const { amount, purpose, buyer_name, email, phone } = req.body;
        
        // Basic validation
        if (!amount || !purpose || !buyer_name || !email) {
            return res.json({ success: false, message: 'Missing required payment information' });
        }

        // For now, return a mock response
        // In production, integrate with actual Instamojo API
        res.json({
            success: true,
            message: 'Payment request created successfully',
            payment_request: {
                id: 'mock_payment_request_' + Date.now(),
                longurl: 'https://mock-instamojo-url.com/pay',
                amount: amount,
                purpose: purpose,
                status: 'Pending'
            }
        });

    } catch (error) {
        console.log('Instamojo payment error:', error);
        res.json({ success: false, message: error.message });
    }
});

// Verify Instamojo payment
paymentRouter.post('/instamojo/verify', authUser, async (req, res) => {
    try {
        const { payment_id, payment_request_id } = req.body;
        
        // Basic validation
        if (!payment_id || !payment_request_id) {
            return res.json({ success: false, message: 'Missing payment verification data' });
        }

        // For now, return a mock response
        // In production, verify with actual Instamojo API
        res.json({
            success: true,
            message: 'Payment verified successfully',
            payment: {
                payment_id: payment_id,
                payment_request_id: payment_request_id,
                status: 'Credit',
                amount: '500.00',
                currency: 'INR'
            }
        });

    } catch (error) {
        console.log('Instamojo verification error:', error);
        res.json({ success: false, message: error.message });
    }
});

// Get payment history for user
paymentRouter.get('/history', authUser, async (req, res) => {
    try {
        const userId = req.body.userId;
        
        // For now, return mock payment history
        // In production, fetch from database
        res.json({
            success: true,
            payments: [
                {
                    id: 'payment_1',
                    amount: 500,
                    currency: 'INR',
                    status: 'completed',
                    method: 'razorpay',
                    created_at: new Date().toISOString(),
                    description: 'Doctor consultation fee'
                }
            ]
        });

    } catch (error) {
        console.log('Payment history error:', error);
        res.json({ success: false, message: error.message });
    }
});

export default paymentRouter;