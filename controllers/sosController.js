const SosModel = require('../models/SosModel')
const userModel = require('../models/userModel')
const Recording = require('../models/RecordingModel')
const brevo = require('../utils/brevo')
const startSOS = async (req, res) => {
  try {
    const { clerkId } = req.auth
    const { latitude, longitude } = req.body
    if (!latitude || !longitude) {
      return res.status(400).json({
        message: 'Location required',
      })
    }
    const user = await userModel
      .findOne({ clerkId })
      .populate('emergencyContacts.user')
    if (!user)
      return res.status(404).json({ message: 'User not found' })
    const existingSOS = await SosModel.findOne({
      user: user._id,
      status: 'active',
    })
    if (existingSOS) {
      return res.status(400).json({
        message: 'SOS already active',
      })
    }
    const lastRecording = await Recording.findOne({
      user: user._id,
    }).sort({ createdAt: -1 })
    console.log(lastRecording);
    const sos = await SosModel.create({
      user: user._id,
      status: 'active',
      lastLocation: {
        latitude,
        longitude,
        updatedAt: new Date(),
      },
      locationHistory: [
        {
          latitude,
          longitude,
          timestamp: new Date(),
        },
      ],
      recordings: lastRecording ? [lastRecording._id] : [],
      notifiedContacts: [],
      lastReminderSentAt: new Date(),
    })
    console.log("sos created sucesfuul" + sos);
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`
    const contacts = user.emergencyContacts.slice(0, 3)
    for (const contact of contacts) {
      if (!contact.user?.email) continue
      await brevo.sendTransacEmail({
        sender: {
          email: 'priyanshujindal009@gmail.com',
          name: 'Angelix Safety',
        },
        to: [
          {
            email: contact.user.email,
          },
        ],
        subject: ` SOS ALERT — ${user.name || 'Your contact'} needs help`,
        htmlContent: `
          <h2> Emergency Alert</h2>
          <p><b>${user.name || 'Someone'}</b> has activated SOS.</p>
          <p><b>Live Location:</b></p>
          <a href="${mapsLink}">${mapsLink}</a>
          ${lastRecording
            ? `
              <p><b>Latest Evidence Recording:</b></p>
              <a href="${lastRecording.videoUrl || lastRecording.audioUrl
            }">View Recording</a>
              `
            : `<p>No recording available yet.</p>`
          }
          <hr/>
          <p>This alert will repeat every 10 minutes until SOS is turned OFF.</p>
        `,
      })
      sos.notifiedContacts.push({
        email: contact.user.email,
        notifiedAt: new Date(),
      })
    }
    console.log("mail sent");
    await sos.save();

    user.isSOSActive = true
    await user.save()
    res.status(200).json({
      success: true,
      message: 'SOS activated successfully',
      sos,
    })
  } catch (error) {
    console.error('Start SOS error:', error)
    res.status(500).json({
      message: 'Failed to start SOS',
    })
  }
}
const stopSOS = async (req, res) => {
  try {
    const { clerkId } = req.auth
    const user = await userModel.findOne({ clerkId })
    if (!user)
      return res.status(404).json({ message: 'User not found' })
    const sos = await SosModel.findOne({
      user: user._id,
      status: 'active',
    })
    console.log("sos find to stop")
    if (!sos)
      return res.status(404).json({
        message: 'No active SOS found',
      })
    sos.status = 'stopped'
    sos.endedAt = new Date()
    await sos.save()
    user.isSOSActive = false
    await user.save()
    res.json({
      success: true,
      message: 'SOS stopped successfully',
    })
  } catch (error) {
    console.error('Stop SOS error:', error)
    res.status(500).json({
      message: 'Failed to stop SOS',
    })
  }
}
module.exports = {
  startSOS,
  stopSOS,
}
