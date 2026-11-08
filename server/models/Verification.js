const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    type: {
      type: String,
      required: [true, 'Verification type is required'],
      enum: {
        values: ['email', 'mobile', 'aadhaar'],
        message: '{VALUE} is not a valid verification type'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'failed'],
        message: '{VALUE} is not a valid verification status'
      },
      default: 'pending'
    },
    referenceId: {
      type: String,
      trim: true,
      default: null,
      description: 'Masked transaction/eKYC reference identifier. NEVER store raw Aadhaar numbers.'
    },
    otpHash: {
      type: String,
      trim: true,
      select: false,
      default: null,
      description: 'Hashed OTP string (e.g., bcrypt/sha256). NEVER store raw OTP.'
    },
    otpExpiresAt: {
      type: Date,
      default: null
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
verificationSchema.index({ user: 1, type: 1 });
verificationSchema.index({ status: 1 });
verificationSchema.index({ otpExpiresAt: 1 });

module.exports = mongoose.model('Verification', verificationSchema);

