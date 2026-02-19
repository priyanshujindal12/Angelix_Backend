const mongoose = require('mongoose')

const SosSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'stopped'],
      default: 'active',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    lastLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },
    locationHistory: [
      {
        latitude: Number,
        longitude: Number,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notifiedContacts: [
      {
        email: String,
        notifiedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    recordings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recording',
      },
    ],
    lastReminderSentAt: {
      type: Date,
      default: null,
    },

    reminderCount: {
      type: Number,
      default: 0,
    },
    autoStopped: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)
const SosModel=mongoose.model('SoS', SosSchema);
module.exports = SosModel
