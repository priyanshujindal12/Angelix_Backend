const cron = require('node-cron')
const SosModel = require('../models/SosModel')
const userModel = require('../models/userModel')
const Recording = require('../models/RecordingModel')
const brevo = require('./brevo')
const MAX_REMINDERS = 36 
cron.schedule('*/10 * * * *', async () => {
  console.log('🔁 SOS Reminder Job Running...')
  try {
    const activeSOSList = await SosModel.find({
      status: 'active',
    }).populate('user')
    for (const sos of activeSOSList) {
      if (sos.reminderCount >= MAX_REMINDERS) {
        sos.status = 'stopped'
        sos.endedAt = new Date()
        sos.autoStopped = true
        await sos.save()
        const user = await userModel.findById(sos.user._id)
        if (user) {
          user.isSOSActive = false
          await user.save()
        }
        console.log(`⏹ Auto-stopped SOS for user ${sos.user._id} after ${MAX_REMINDERS} reminders`)
        continue
      }
      const user = await userModel
        .findById(sos.user._id)
        .populate('emergencyContacts.user')
      if (!user) continue
      const latestRecording = await Recording.findOne({
        user: user._id,
      }).sort({ createdAt: -1 })
      const lat = sos.lastLocation?.latitude
      const lng = sos.lastLocation?.longitude
      const mapsLink = `https://maps.google.com/?q=${lat},${lng}`
      const contacts = user.emergencyContacts.slice(0, 3)
      for (const contact of contacts) {
        if (!contact.user?.email) continue
        await brevo.sendTransacEmail({
          sender: {
            email: 'priyanshujindal009@gmail.com',
            name: 'Angelix Safety',
          },
          to: [{ email: contact.user.email }],
          subject: ` SOS REMINDER — ${user.name || 'Your contact'} still needs help`,
          htmlContent: `
            <h2> SOS Still Active</h2>
            <p>${user.name || 'Your contact'} has NOT turned off SOS.</p>
            <p><b>Current Location:</b></p>
            <a href="${mapsLink}">${mapsLink}</a>
            ${latestRecording
              ? `
                <p><b>Latest Evidence Recording:</b></p>
                <a href="${latestRecording.videoUrl || latestRecording.audioUrl
              }">View Recording</a>
                `
              : ''
            }
            <p>This alert repeats every 10 minutes until SOS is stopped.</p>
          `,
        })
      }
      sos.lastReminderSentAt = new Date()
      sos.reminderCount += 1
      await sos.save()
      console.log(` Reminder sent for user ${user.email}`)
    }
  } catch (err) {
    console.error(' SOS Reminder Job Error:', err)
  }
})
