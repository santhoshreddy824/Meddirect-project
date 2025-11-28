import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true,
    index: true 
  },
  email: { 
    type: String, 
    required: true,
    index: true 
  },
  token: { 
    type: String, 
    required: true,
    unique: true,
    index: true 
  },
  used: { 
    type: Boolean, 
    default: false 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Auto-delete expired tokens after 24 hours
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

const passwordResetModel = mongoose.models.passwordReset || mongoose.model('passwordReset', passwordResetSchema);

export default passwordResetModel;
