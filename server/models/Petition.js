const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: ''
    },
    signedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const updateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Update title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    content: {
      type: String,
      required: [true, 'Update content is required'],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const petitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Petition title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [180, 'Title cannot exceed 180 characters']
    },
    description: {
      type: String,
      required: [true, 'Petition description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Community',
          'Environment',
          'Human Rights',
          'Education',
          'Healthcare',
          'Animal Welfare',
          'Technology',
          'Other'
        ],
        message: '{VALUE} is not a supported category'
      },
      default: 'Community'
    },
    targetSignatures: {
      type: Number,
      required: [true, 'Target signature count is required'],
      min: [5, 'Target must be at least 5 signatures'],
      default: 100
    },
    currentSignatures: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'successful'],
      default: 'active'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    signatures: [signatureSchema],
    updates: [updateSchema]
  },
  {
    timestamps: true
  }
);

// Indexes for high performance searching and querying
petitionSchema.index({ title: 'text', description: 'text' });
petitionSchema.index({ creator: 1 });
petitionSchema.index({ 'signatures.user': 1 });
petitionSchema.index({ status: 1, category: 1, createdAt: -1 });
petitionSchema.index({ currentSignatures: -1 });

module.exports = mongoose.model('Petition', petitionSchema);
