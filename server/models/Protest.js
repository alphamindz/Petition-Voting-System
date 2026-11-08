const mongoose = require('mongoose');

const protestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User (creator) reference is required']
    },
    title: {
      type: String,
      required: [true, 'Protest title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Protest description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters']
    },
    concernedAuthority: {
      type: String,
      required: [true, 'Concerned authority is required'],
      trim: true,
      maxlength: [150, 'Concerned authority cannot exceed 150 characters']
    },
    supportingInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: '',
      description: 'Supporting documents, background notes, citations, or URLs'
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'published', 'closed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'pending'
    },
    voteCount: {
      type: Number,
      default: 0,
      min: [0, 'Vote count cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Full-text search index on title and description
protestSchema.index({ title: 'text', description: 'text' });

// Performance indexes for querying and sorting
protestSchema.index({ user: 1 });
protestSchema.index({ status: 1, createdAt: -1 });
protestSchema.index({ voteCount: -1 });
protestSchema.index({ concernedAuthority: 1 });

module.exports = mongoose.model('Protest', protestSchema);

