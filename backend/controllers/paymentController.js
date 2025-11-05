import Stripe from "stripe";
import Razorpay from "razorpay";
import paypal from "paypal-rest-sdk";
import axios from "axios";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";

// Initialize payment gateways with error handling
let stripe, razorpay, paypalClient, instamojo;

// Initialize Stripe
// try {
//   if (process.env.STRIPE_SECRET_KEY) {
//     stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//     console.log("✅ Stripe initialized successfully");
//   } else {
//     console.warn("⚠️ STRIPE_SECRET_KEY not found in environment variables.");
//   }
// } catch (error) {
//   console.error("❌ Failed to initialize Stripe:", error.message);
// }

// Initialize Razorpay
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized successfully");
  } else {
    console.warn("⚠️ Razorpay credentials not found in environment variables.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Razorpay:", error.message);
}

// Initialize Instamojo
try {
  if (process.env.INSTAMOJO_CLIENT_ID && process.env.INSTAMOJO_CLIENT_SECRET) {
    instamojo = {
      clientId: process.env.INSTAMOJO_CLIENT_ID,
      clientSecret: process.env.INSTAMOJO_CLIENT_SECRET,
      apiEndpoint: process.env.INSTAMOJO_API_ENDPOINT || 'https://test.instamojo.com/api/1.1/',
      authEndpoint: process.env.INSTAMOJO_AUTH_ENDPOINT || 'https://test.instamojo.com/oauth2/token/',
      accessToken: null,
      tokenExpiry: null
    };
    console.log("✅ Instamojo initialized successfully");
  } else {
    console.warn("⚠️ Instamojo credentials not found in environment variables.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Instamojo:", error.message);
}

// Initialize PayPal
// try {
//   if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
//     paypal.configure({
//       mode: process.env.PAYPAL_MODE || 'sandbox',
//       client_id: process.env.PAYPAL_CLIENT_ID,
//       client_secret: process.env.PAYPAL_CLIENT_SECRET
//     });
//     paypalClient = paypal;
//     console.log("✅ PayPal initialized successfully");
//   } else {
//     console.warn("⚠️ PayPal credentials not found in environment variables.");
//   }
// } catch (error) {
//   console.error("❌ Failed to initialize PayPal:", error.message);
// }

// Currency configuration for different countries
const currencyConfig = {
  'US': { code: 'USD', symbol: '$', methods: ['instamojo', 'razorpay', 'stripe', 'paypal'] },
  'IN': { code: 'INR', symbol: '₹', methods: ['instamojo', 'razorpay', 'stripe'] },
  'GB': { code: 'GBP', symbol: '£', methods: ['stripe', 'paypal'] },
  'CA': { code: 'CAD', symbol: 'C$', methods: ['stripe', 'paypal'] },
  'AU': { code: 'AUD', symbol: 'A$', methods: ['stripe', 'paypal'] },
  'EU': { code: 'EUR', symbol: '€', methods: ['stripe', 'paypal'] },
  'SG': { code: 'SGD', symbol: 'S$', methods: ['stripe', 'paypal'] },
  'AE': { code: 'AED', symbol: 'د.إ', methods: ['stripe', 'paypal'] },
  'default': { code: 'USD', symbol: '$', methods: ['stripe', 'paypal'] }
};

// Get available payment methods for country
const getPaymentMethods = async (req, res) => {
  try {
    const { country = 'default' } = req.query;
    const config = currencyConfig[country] || currencyConfig.default;
    
    const availableMethods = [];
    
    // Check which payment methods are configured and available
    if (config.methods.includes('instamojo') && instamojo) {
      availableMethods.push({
        id: 'instamojo',
        name: 'Instamojo - UPI, Cards & Wallets',
        description: 'Pay with UPI, Credit/Debit Cards, Net Banking, and Wallets (Fastest & Most Secure)',
        icon: 'payment',
        currencies: ['INR', 'USD'],
        featured: true,
        subMethods: ['upi', 'card', 'netbanking', 'wallet'],
        benefits: ['Instant refunds', 'Zero hidden charges', 'Bank-level security']
      });
    }
    
    if (config.methods.includes('stripe') && stripe) {
      availableMethods.push({
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Pay securely with your credit or debit card',
        icon: 'credit-card',
        currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'AED', 'INR']
      });
    }
    
    if (config.methods.includes('razorpay') && razorpay) {
      availableMethods.push({
        id: 'razorpay',
        name: 'UPI, Cards & More',
        description: 'Pay with UPI (GPay, PhonePe, Paytm), NetBanking, Cards, and Wallets',
        icon: 'smartphone',
        currencies: ['INR'],
        subMethods: ['upi', 'googlepay', 'phonepe', 'paytm', 'amazonpay', 'bhim', 'netbanking', 'card', 'wallet'],
        upiOptions: [
          { id: 'googlepay', name: 'Google Pay', popular: true },
          { id: 'phonepe', name: 'PhonePe', popular: true },
          { id: 'paytm', name: 'Paytm', popular: true },
          { id: 'amazonpay', name: 'Amazon Pay', popular: false },
          { id: 'bhim', name: 'BHIM UPI', popular: false },
          { id: 'upi', name: 'Other UPI Apps', popular: false }
        ]
      });
    }
    
    if (config.methods.includes('paypal') && paypalClient) {
      availableMethods.push({
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        icon: 'paypal',
        currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'AED']
      });
    }

    res.json({
      success: true,
      country,
      currency: config,
      paymentMethods: availableMethods
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.json({ success: false, message: "Failed to get payment methods" });
  }
};

// Create payment intent based on selected method
const createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId, paymentMethod, country = 'default', upiOption } = req.body;
    const { userId } = req.body;

    console.log("Payment intent creation request:", { appointmentId, paymentMethod, userId });

    // Validate ObjectId format for appointmentId
    if (!appointmentId || !appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Invalid appointmentId format:", appointmentId);
      return res.json({ success: false, message: "Invalid appointment ID format" });
    }

    // Get appointment details
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      console.log("Appointment not found:", appointmentId);
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Verify appointment belongs to user
    if (appointment.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    // Check if payment already processed
    if (appointment.payment) {
      return res.json({ success: false, message: "Payment already completed" });
    }

    // Get doctor details separately
    const doctor = await doctorModel.findById(appointment.docId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    // Store UPI option if provided
    if (upiOption && paymentMethod === 'razorpay') {
      appointment.paymentData = { 
        ...appointment.paymentData, 
        upiOption,
        preferredMethod: upiOption 
      };
      await appointment.save();
    }

    const config = currencyConfig[country] || currencyConfig.default;
    const amount = doctor.fees;

    let paymentData;

    // Check if we're in development mode with placeholder keys
    const isDevMode = process.env.STRIPE_SECRET_KEY?.includes('your_stripe_secret_key_here') || 
                      process.env.RAZORPAY_KEY_ID?.includes('rzp_test_1234567890abcdef');

    if (isDevMode) {
      console.log("🧪 Using mock payment mode for development");
      paymentData = await createMockPayment(appointmentId, userId, doctor, amount, paymentMethod, config.code);
    } else {
      switch (paymentMethod) {
        case 'stripe':
          paymentData = await createStripePayment(appointmentId, userId, doctor, amount, config.code);
          break;
        case 'razorpay':
          paymentData = await createRazorpayPayment(appointmentId, userId, doctor, amount);
          break;
        case 'paypal':
          paymentData = await createPayPalPayment(appointmentId, userId, doctor, amount, config.code);
          break;
        case 'instamojo':
          paymentData = await createInstamojoPayment(appointmentId, userId, doctor, amount);
          break;
        default:
          return res.json({ success: false, message: "Invalid payment method" });
      }
    }

    res.json({
      success: true,
      paymentMethod,
      currency: config,
      mockMode: isDevMode,
      ...paymentData
    });

  } catch (error) {
    console.error("Payment intent creation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      appointmentId: req.body.appointmentId,
      paymentMethod: req.body.paymentMethod,
      userId: req.body.userId
    });
    res.json({ success: false, message: "Payment processing failed", error: error.message });
  }
};

// Stripe payment creation
const createStripePayment = async (appointmentId, userId, doctor, amount, currency) => {
  if (!stripe) {
    throw new Error("Stripe not configured. Please check STRIPE_SECRET_KEY in environment variables.");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        appointmentId: appointmentId,
        userId: userId,
        doctorId: doctor._id.toString(),
        doctorName: doctor.name,
        paymentMethod: 'stripe'
      },
      description: `Appointment with Dr. ${doctor.name}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      doctorName: doctor.name,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error("Stripe payment creation error:", error);
    throw new Error(`Stripe payment failed: ${error.message}`);
  }
};

// Razorpay payment creation
const createRazorpayPayment = async (appointmentId, userId, doctor, amount) => {
  if (!razorpay) {
    throw new Error("Razorpay not configured. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.");
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `appointment_${appointmentId}`,
      notes: {
        appointmentId: appointmentId,
        userId: userId,
        doctorId: doctor._id.toString(),
        doctorName: doctor.name,
        paymentMethod: 'razorpay'
      }
    };

    const order = await razorpay.orders.create(options);

    return {
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      doctorName: doctor.name,
      key: process.env.RAZORPAY_KEY_ID
    };
  } catch (error) {
    console.error("Razorpay payment creation error:", error);
    throw new Error(`Razorpay payment failed: ${error.message}`);
  }
};

// PayPal payment creation
const createPayPalPayment = async (appointmentId, userId, doctor, amount, currency) => {
  if (!paypalClient) {
    throw new Error("PayPal not configured");
  }

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`
    },
    transactions: [{
      item_list: {
        items: [{
          name: `Appointment with Dr. ${doctor.name}`,
          sku: appointmentId,
          price: amount.toFixed(2),
          currency: currency,
          quantity: 1
        }]
      },
      amount: {
        currency: currency,
        total: amount.toFixed(2)
      },
      description: `Medical appointment with Dr. ${doctor.name}`,
      custom: `${appointmentId}_${userId}`
    }]
  };

  return new Promise((resolve, reject) => {
    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        reject(new Error(error.message));
      } else {
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
        resolve({
          paymentId: payment.id,
          amount: amount,
          doctorName: doctor.name,
          approvalUrl: approvalUrl
        });
      }
    });
  });
};

// Instamojo payment creation
const createInstamojoPayment = async (appointmentId, userId, doctor, amount) => {
  if (!instamojo) {
    throw new Error("Instamojo not configured. Please check INSTAMOJO_CLIENT_ID and INSTAMOJO_CLIENT_SECRET in environment variables.");
  }

  try {
    // Get user data
    const user = await userModel.findById(userId).select("name email phone");
    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = await getInstamojoAccessToken();
    
    const paymentData = {
      purpose: `MedDirect: Appointment with Dr. ${doctor.name}`,
      amount: amount,
      phone: user.phone || '9876543210',
      buyer_name: user.name,
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5175'}/payment-success?appointmentId=${appointmentId}`,
      send_email: true,
      webhook: `${process.env.BACKEND_URL || 'http://localhost:4001'}/api/payment/webhook/instamojo`,
      send_sms: false,
      email: user.email,
      allow_repeated_payments: false
    };

    const response = await axios.post(
      `${instamojo.apiEndpoint}payment-requests/`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log("Instamojo payment request response:", response.data);

    if (response.data.success) {
      return {
        success: true,
        paymentRequestId: response.data.payment_request.id,
        paymentUrl: response.data.payment_request.longurl,
        amount: amount,
        doctorName: doctor.name,
        currency: 'INR'
      };
    } else {
      throw new Error(`Failed to create Instamojo payment request: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("❌ Failed to create Instamojo payment request:", error.message);
    throw error;
  }
};

// Mock payment creation for development
const createMockPayment = async (appointmentId, userId, doctor, amount, paymentMethod, currency) => {
  console.log(`🧪 Creating mock ${paymentMethod} payment for development`);
  
  // Simulate different responses based on payment method
  const mockPaymentId = `mock_${paymentMethod}_${Date.now()}`;
  
  switch (paymentMethod) {
    case 'stripe':
      return {
        clientSecret: `mock_client_secret_${mockPaymentId}`,
        amount: amount,
        doctorName: doctor.name,
        paymentIntentId: mockPaymentId,
        mockMode: true
      };
    case 'razorpay':
      return {
        orderId: mockPaymentId,
        amount: amount,
        currency: 'INR',
        doctorName: doctor.name,
        key: 'mock_razorpay_key',
        mockMode: true
      };
    case 'paypal':
      return {
        paymentId: mockPaymentId,
        approvalUrl: `https://mock-paypal.com/checkout?payment=${mockPaymentId}`,
        amount: amount,
        currency: currency,
        doctorName: doctor.name,
        mockMode: true
      };
    case 'instamojo':
      return {
        success: true,
        paymentRequest: {
          id: mockPaymentId,
          amount: amount,
          currency: currency,
          status: 'pending',
          longurl: `https://mock-instamojo.com/pay/${mockPaymentId}`
        },
        mockMode: true
      };
    default:
      return {
        paymentId: mockPaymentId,
        amount: amount,
        doctorName: doctor.name,
        mockMode: true
      };
  }
};

// Confirm payment and update appointment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, appointmentId, paymentMethod, orderId, paymentId, signature } = req.body;

    let paymentConfirmed = false;
    let paymentData = {};

    switch (paymentMethod) {
      case 'stripe':
        if (!stripe) {
          return res.json({ success: false, message: "Stripe not configured" });
        }
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        paymentConfirmed = paymentIntent.status === 'succeeded';
        paymentData = { paymentIntentId, method: 'stripe' };
        break;

      case 'razorpay':
        if (!razorpay) {
          return res.json({ success: false, message: "Razorpay not configured" });
        }
        // Verify Razorpay signature
        const crypto = await import('crypto');
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${orderId}|${paymentId}`)
          .digest('hex');
        
        paymentConfirmed = expectedSignature === signature;
        paymentData = { orderId, paymentId, method: 'razorpay' };
        break;

      case 'paypal':
        if (!paypalClient) {
          return res.json({ success: false, message: "PayPal not configured" });
        }
        // Execute PayPal payment
        return new Promise((resolve) => {
          paypal.payment.execute(orderId, { payer_id: paymentId }, (error, payment) => {
            if (error) {
              paymentConfirmed = false;
              console.error("PayPal payment execution error:", error);
            } else {
              paymentConfirmed = payment.state === 'approved';
              paymentData = { paymentId: orderId, executionId: payment.id, method: 'paypal' };
            }
            resolve();
          });
        });
        break;

      case 'instamojo':
        if (!instamojo) {
          return res.json({ success: false, message: "Instamojo not configured" });
        }
        // Verify Instamojo payment
        const paymentVerification = await verifyInstamojoPayment(paymentId, orderId);
        paymentConfirmed = paymentVerification.success && paymentVerification.status === 'Credit';
        paymentData = { paymentId, method: 'instamojo' };
        break;

      default:
        return res.json({ success: false, message: "Invalid payment method" });
    }

    if (paymentConfirmed) {
      // Update appointment payment status
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        payment: true,
        paymentId: paymentIntentId || paymentId || orderId,
        paymentMethod: paymentMethod,
        paymentData: paymentData
      });

      res.json({
        success: true,
        message: "Payment confirmed successfully",
        paymentMethod
      });
    } else {
      res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.json({ success: false, message: "Payment confirmation failed" });
  }
};

// Mock payment confirmation for development
const confirmMockPayment = async (req, res) => {
  try {
    const { appointmentId, paymentId, paymentMethod } = req.body;
    const { userId } = req.body;

    // Get appointment details
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || appointment.userId !== userId) {
      return res.json({ success: false, message: "Appointment not found or unauthorized" });
    }

    // Simulate successful payment
    appointment.payment = true;
    appointment.paymentId = paymentId;
    appointment.paymentMethod = paymentMethod;
    appointment.paymentData = {
      ...appointment.paymentData,
      mockPayment: true,
      completedAt: new Date().toISOString(),
      status: 'completed'
    };
    
    await appointment.save();

    console.log(`🧪 Mock payment confirmed for appointment ${appointmentId}`);

    res.json({
      success: true,
      message: "Mock payment confirmed successfully",
      appointment: appointment,
      mockMode: true
    });

  } catch (error) {
    console.error("Mock payment confirmation error:", error);
    res.json({ success: false, message: "Payment confirmation failed" });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { userId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Verify appointment belongs to user
    if (appointment.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    res.json({
      success: true,
      payment: appointment.payment,
      paymentId: appointment.paymentId || null,
    });

  } catch (error) {
    console.error("Get payment status error:", error);
    res.json({ success: false, message: "Failed to get payment status" });
  }
};

// Webhook handler for multiple payment providers
const handleWebhook = async (req, res) => {
  try {
    const { provider } = req.params;

    switch (provider) {
      case 'stripe':
        return handleStripeWebhook(req, res);
      case 'razorpay':
        return handleRazorpayWebhook(req, res);
      case 'paypal':
        return handlePayPalWebhook(req, res);
      case 'instamojo':
        return handleInstamojoWebhook(req, res);
      default:
        return res.status(400).send("Invalid webhook provider");
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).send("Webhook processing failed");
  }
};

// Stripe webhook handler
const handleStripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(400).send("Stripe not configured");
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Stripe webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Stripe payment succeeded:', paymentIntent.id);
      
      if (paymentIntent.metadata.appointmentId) {
        await appointmentModel.findByIdAndUpdate(
          paymentIntent.metadata.appointmentId,
          {
            payment: true,
            paymentId: paymentIntent.id,
            paymentMethod: 'stripe'
          }
        );
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Stripe payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled Stripe event type ${event.type}`);
  }

  res.json({ received: true });
};

// Razorpay webhook handler
const handleRazorpayWebhook = async (req, res) => {
  if (!razorpay) {
    return res.status(400).send("Razorpay not configured");
  }

  const crypto = await import('crypto');
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body.event;
  
  switch (event) {
    case 'payment.captured':
      const payment = req.body.payload.payment.entity;
      console.log('Razorpay payment captured:', payment.id);
      
      if (payment.notes && payment.notes.appointmentId) {
        await appointmentModel.findByIdAndUpdate(
          payment.notes.appointmentId,
          {
            payment: true,
            paymentId: payment.id,
            paymentMethod: 'razorpay'
          }
        );
      }
      break;

    case 'payment.failed':
      const failedRzpPayment = req.body.payload.payment.entity;
      console.log('Razorpay payment failed:', failedRzpPayment.id);
      break;

    default:
      console.log(`Unhandled Razorpay event type ${event}`);
  }

  res.json({ received: true });
};

// PayPal webhook handler
const handlePayPalWebhook = async (req, res) => {
  if (!paypalClient) {
    return res.status(400).send("PayPal not configured");
  }

  // PayPal webhook verification would go here in production
  const event = req.body;
  
  switch (event.event_type) {
    case 'PAYMENT.SALE.COMPLETED':
      const sale = event.resource;
      console.log('PayPal payment completed:', sale.id);
      
      if (sale.custom) {
        const [appointmentId] = sale.custom.split('_');
        await appointmentModel.findByIdAndUpdate(appointmentId, {
          payment: true,
          paymentId: sale.id,
          paymentMethod: 'paypal'
        });
      }
      break;

    case 'PAYMENT.SALE.DENIED':
      const deniedSale = event.resource;
      console.log('PayPal payment denied:', deniedSale.id);
      break;

    default:
      console.log(`Unhandled PayPal event type ${event.event_type}`);
  }

  res.json({ received: true });
};

// Instamojo webhook handler
const handleInstamojoWebhook = async (req, res) => {
  if (!instamojo) {
    return res.status(400).send("Instamojo not configured");
  }

  const event = req.body;
  
  switch (event.event) {
    case 'ORDER_PAYMENT_CAPTURED':
      const capturedPayment = event.payload.payment;
      console.log('Instamojo payment captured:', capturedPayment.id);
      
      if (capturedPayment.notes && capturedPayment.notes.appointmentId) {
        await appointmentModel.findByIdAndUpdate(
          capturedPayment.notes.appointmentId,
          {
            payment: true,
            paymentId: capturedPayment.id,
            paymentMethod: 'instamojo'
          }
        );
      }
      break;

    case 'ORDER_PAYMENT_FAILED':
      const failedPayment = event.payload.payment;
      console.log('Instamojo payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled Instamojo event type ${event.event}`);
  }

  res.json({ received: true });
};

// Instamojo Helper Functions
const getInstamojoAccessToken = async () => {
  try {
    // Check if we have a valid token
    if (instamojo.accessToken && instamojo.tokenExpiry && new Date() < instamojo.tokenExpiry) {
      return instamojo.accessToken;
    }

    // Get new access token
    const response = await axios.post(instamojo.authEndpoint, {
      grant_type: 'client_credentials',
      client_id: instamojo.clientId,
      client_secret: instamojo.clientSecret
    });

    if (response.data.access_token) {
      instamojo.accessToken = response.data.access_token;
      // Set expiry to 1 hour from now
      instamojo.tokenExpiry = new Date(Date.now() + 3600000);
      console.log("✅ Instamojo access token obtained successfully");
      return instamojo.accessToken;
    } else {
      throw new Error('Failed to get access token from Instamojo');
    }
  } catch (error) {
    console.error("❌ Failed to get Instamojo access token:", error.message);
    throw error;
  }
};

const createInstamojoPaymentRequest = async (appointmentData, amount) => {
  try {
    const accessToken = await getInstamojoAccessToken();
    
    const paymentData = {
      purpose: `Appointment with Dr. ${appointmentData.docData.name}`,
      amount: amount,
      phone: appointmentData.userData.phone || '9876543210',
      buyer_name: appointmentData.userData.name,
      redirect_url: `${process.env.FRONTEND_URL}/payment-success`,
      send_email: true,
      webhook: `${process.env.BACKEND_URL || 'http://localhost:4001'}/api/payment/webhook/instamojo`,
      send_sms: false,
      email: appointmentData.userData.email,
      allow_repeated_payments: false
    };

    const response = await axios.post(
      `${instamojo.apiEndpoint}payment-requests/`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (response.data.success) {
      return {
        success: true,
        paymentRequest: response.data.payment_request,
        paymentUrl: response.data.payment_request.longurl
      };
    } else {
      throw new Error('Failed to create Instamojo payment request');
    }
  } catch (error) {
    console.error("❌ Failed to create Instamojo payment request:", error.message);
    throw error;
  }
};

const verifyInstamojoPayment = async (paymentId, paymentRequestId) => {
  try {
    const accessToken = await getInstamojoAccessToken();
    
    const response = await axios.get(
      `${instamojo.apiEndpoint}payments/${paymentId}/`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      return {
        success: true,
        payment: response.data.payment,
        status: response.data.payment.status
      };
    } else {
      throw new Error('Failed to verify Instamojo payment');
    }
  } catch (error) {
    console.error("❌ Failed to verify Instamojo payment:", error.message);
    throw error;
  }
};

export {
  getPaymentMethods,
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  handleWebhook,
  handleStripeWebhook,
  handleRazorpayWebhook,
  handlePayPalWebhook,
  handleInstamojoWebhook,
  confirmMockPayment
};
