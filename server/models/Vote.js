const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    protest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Protest',
      required: [true, 'Protest reference is required']
    },
    voteType: {
      type: String,
      default: 'support',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// UNIQUE compound index on (user, protest) to strictly prevent duplicate votes
voteSchema.index({ user: 1, protest: 1 }, { unique: true });

// Index on protest for counting and tallying
voteSchema.index({ protest: 1 });

module.exports = mongoose.model('Vote', voteSchema);

