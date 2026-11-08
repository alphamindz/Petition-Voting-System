const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ]
    },
    mobile: {
      type: String,
      required: [true, 'Please provide a mobile phone number'],
      unique: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: false,
      default: null,
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'user'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isAadhaarVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    bio: {
      type: String,
      default: '',
      maxlength: [300, 'Bio cannot exceed 300 characters']
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Virtual field for plain password input
userSchema
  .virtual('password')
  .set(function (plainPassword) {
    this._plainPassword = plainPassword;
  })
  .get(function () {
    return this._plainPassword;
  });

// Pre-save hook to hash plain password into passwordHash
userSchema.pre('save', async function (next) {
  if (this._plainPassword) {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this._plainPassword, salt);
  }
  next();
});

// Compare entered password with passwordHash
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.passwordHash) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to generate password hash (12 rounds)
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(plainPassword, salt);
};

// Strip sensitive fields when serializing to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj._plainPassword;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
