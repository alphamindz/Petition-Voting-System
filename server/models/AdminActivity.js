const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin user reference is required']
    },
    protest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Protest',
      required: [true, 'Protest reference is required']
    },
    action: {
      type: String,
      required: [true, 'Admin action is required'],
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for auditing and audit logs
adminActivitySchema.index({ admin: 1, createdAt: -1 });
adminActivitySchema.index({ protest: 1, createdAt: -1 });

module.exports = mongoose.model('AdminActivity', adminActivitySchema);

