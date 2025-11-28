import mongoose from 'mongoose';

const loginEventSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    email: { type: String, index: true },
    name: { type: String },
    method: { type: String, enum: ['password', 'google'], required: true },
    success: { type: Boolean, default: true },
    ip: { type: String },
    userAgent: { type: String },
    meta: { type: Object },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

const loginEventModel = mongoose.models.loginEvent || mongoose.model('loginEvent', loginEventSchema);
export default loginEventModel;
