import validator from "validator";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { verifyFirebaseToken } from "../config/firebase-admin.js";
import axios from "axios";
import loginEventModel from "../models/loginEventModel.js";
import passwordResetModel from "../models/passwordResetModel.js";
import crypto from "crypto";
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from "../utils/emailService.js";

// Function to verify reCAPTCHA
const verifyCaptcha = async (captchaToken) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; // Test secret key
    
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: secretKey,
        response: captchaToken
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return { success: false, 'error-codes': ['network-error'] };
  }
};

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, captchaToken } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Verify CAPTCHA if token is provided
    if (captchaToken) {
      const captchaResult = await verifyCaptcha(captchaToken);
      if (!captchaResult.success) {
        return res.json({ 
          success: false, 
          message: "CAPTCHA verification failed. Please try again." 
        });
      }
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "enter a valid email" });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "enter a strong password" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists with this email" });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.json({ success: false, message: "User already exists with this email" });
    }
    res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      // Record login event
      try {
        await loginEventModel.create({
          userId: String(user._id),
          email: user.email,
          name: user.name,
          method: "password",
          success: true,
          ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip,
          userAgent: req.headers["user-agent"],
        });
      } catch (e) {
        console.warn("Login event (password) record failed:", e.message);
      }
      res.json({ success: true, token });
    } else {
      // Record failed attempt
      try {
        await loginEventModel.create({
          userId: user ? String(user._id) : undefined,
          email,
          name: user?.name,
          method: "password",
          success: false,
          ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip,
          userAgent: req.headers["user-agent"],
        });
      } catch (e) {
        console.warn("Login event (password fail) record failed:", e.message);
      }
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const useData = await userModel.findById(userId).select("-password");

    res.json({ success: true, user: useData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime, paymentMethod, paid, paymentId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    let slots_booked = docData.slots_booked;

    // checking for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");
    
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
      payment: paid || false,
      paymentMethod: paymentMethod || null,
      paymentId: paymentId || null
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    const successMessage = paid 
      ? "Appointment booked and payment completed successfully!"
      : "Appointment booked successfully! You can pay later from My Appointments.";

    res.json({ success: true, message: successMessage });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
  try {
    const userId = req.body.userId;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    // Check if doctor exists
    if (!doctorData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    let slots_booked = doctorData.slots_booked;

    // Check if slots_booked exists and has the slotDate
    if (slots_booked && slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (e) => e !== slotTime
      );

      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark payment as successful
const paymentSuccess = async (req, res) => {
  try {
    const { userId, appointmentId, paymentMethod, amount } = req.body;

    // Find the appointment
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Verify appointment belongs to user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    // Check if payment is already completed
    if (appointmentData.payment) {
      return res.json({ success: false, message: "Payment already completed" });
    }

    // Update appointment with payment info
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      payment: true,
      paymentMethod: paymentMethod,
      amount: amount,
      paymentDate: new Date()
    });

    console.log(`✅ Payment successful for appointment ${appointmentId}, user ${userId}, amount: ₹${amount}, method: ${paymentMethod}`);

    res.json({ 
      success: true, 
      message: "Payment completed successfully",
      appointmentId: appointmentId
    });

  } catch (error) {
    console.log("❌ Payment processing error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API for Firebase authentication
const firebaseAuth = async (req, res) => {
  try {
    console.log("🔐 Firebase auth request received");
    const { firebaseUid, name, email, imageUrl, idToken } = req.body;

    // Validate required data
    if (!firebaseUid || !email || !idToken) {
      console.log("❌ Missing Firebase user data");
      return res.json({ 
        success: false, 
        message: "Missing Firebase authentication data" 
      });
    }

    // Verify Firebase ID token
    try {
      const decodedToken = await verifyFirebaseToken(idToken);
      console.log("✅ Firebase token verified successfully");
      
      // Verify token data matches request data
      if (decodedToken.email !== email || decodedToken.uid !== firebaseUid) {
        console.log("❌ Token data mismatch");
        return res.json({ 
          success: false, 
          message: "Invalid authentication data" 
        });
      }
      
    } catch (verifyError) {
      console.log("❌ Firebase token verification failed:", verifyError.message);
      return res.json({ 
        success: false, 
        message: "Invalid Firebase authentication token" 
      });
    }

    // Check if user already exists
    let user = await userModel.findOne({ email });

    if (!user) {
      // Create new user
      console.log("👤 Creating new Firebase user:", email);
      const userData = {
        name: name || "Firebase User",
        email,
        password: `firebase_auth_${Date.now()}_${Math.random()}`, // Unique placeholder
        image: imageUrl || "https://via.placeholder.com/150",
        firebaseUid
      };

      try {
        const newUser = new userModel(userData);
        user = await newUser.save();
        console.log("✅ New Firebase user created successfully");
      } catch (createError) {
        if (createError.code === 11000) {
          // User was created by another request, fetch it
          user = await userModel.findOne({ email });
          if (!user) {
            return res.json({ 
              success: false, 
              message: "Failed to create or retrieve user" 
            });
          }
        } else {
          throw createError;
        }
      }
    } else {
      // Update existing user with Firebase data if needed
      console.log("👤 User exists, updating Firebase data if needed");
      let updateNeeded = false;
      
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        updateNeeded = true;
      }
      
      if (imageUrl && user.image !== imageUrl) {
        user.image = imageUrl;
        updateNeeded = true;
      }
      
      if (updateNeeded) {
        await user.save();
        console.log("✅ User updated with Firebase data");
      }
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.log("❌ JWT_SECRET not configured");
      return res.json({ 
        success: false, 
        message: "Authentication configuration error" 
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    console.log("✅ Firebase authentication successful for:", email);
    // Record login event
    try {
      await loginEventModel.create({
        userId: String(user._id),
        email: user.email,
        name: user.name,
        method: "google",
        success: true,
        ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip,
        userAgent: req.headers["user-agent"],
        meta: { firebaseUid },
      });
    } catch (e) {
      console.warn("Login event (google) record failed:", e.message);
    }

    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image
      },
      message: "Firebase authentication successful"
    });

  } catch (error) {
    console.log("❌ Firebase auth error:", error);
    // Attempt to record failed google auth
    try {
      const { email, firebaseUid } = req.body || {};
      await loginEventModel.create({
        email,
        method: "google",
        success: false,
        ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip,
        userAgent: req.headers["user-agent"],
        meta: { firebaseUid, error: error?.message },
      });
    } catch (e) {
      console.warn("Login event (google fail) record failed:", e.message);
    }
    res.json({ 
      success: false, 
      message: "Firebase authentication failed. Please try again." 
    });
  }
};

// API for forgot password - send reset email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        success: true, 
        message: "If an account exists with this email, you will receive a password reset link shortly." 
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiry to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing unused reset tokens for this user
    await passwordResetModel.deleteMany({ userId: user._id, used: false });

    // Create new reset token
    await passwordResetModel.create({
      userId: user._id,
      email: user.email,
      token: hashedToken,
      expiresAt,
      used: false
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
      console.log(`✅ Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send reset email:', emailError);
      // Continue anyway - token is created
    }

    res.json({ 
      success: true, 
      message: "If an account exists with this email, you will receive a password reset link shortly." 
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.json({ success: false, message: "An error occurred. Please try again." });
  }
};

// API for reset password - verify token and update password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.json({ success: false, message: "Token and new password are required" });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters long" });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const resetRecord = await passwordResetModel.findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.json({ 
        success: false, 
        message: "Invalid or expired reset link. Please request a new password reset." 
      });
    }

    // Find user
    const user = await userModel.findById(resetRecord.userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    // Send confirmation email
    try {
      await sendPasswordResetConfirmation(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if confirmation email fails
    }

    console.log(`✅ Password successfully reset for user: ${user.email}`);

    res.json({ 
      success: true, 
      message: "Password has been reset successfully. You can now log in with your new password." 
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.json({ success: false, message: "An error occurred. Please try again." });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentSuccess,
  firebaseAuth,
  forgotPassword,
  resetPassword,
};
