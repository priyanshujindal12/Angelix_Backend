const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['email', 'oauth_google', 'google', 'apple'],
      default: 'email',
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    emergencyContacts: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        nickname: {
          type: String,
          default: 'bunny',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    safetyCircle: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    lastKnownLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,

    },

    isSOSActive: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)
const userModel = mongoose.model('User', UserSchema)
module.exports = userModel;
