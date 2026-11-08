const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: [true, 'Recipient is required (User ID or contact handle)']
    },
    protest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Protest',
      required: [true, 'Protest reference is required']
    },
    status: {
      type: String,
      enum: {
        values: ['sent', 'failed'],
        message: '{VALUE} is not a valid notification status'
      },
      default: 'sent'
    },
    message: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ protest: 1 });
notificationSchema.index({ status: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

