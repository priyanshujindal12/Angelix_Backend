const recordingModel = require('../models/RecordingModel')
const userModel = require('../models/userModel')
const cloudinary = require('../config/Cloudinary')
const streamifier = require('streamifier')
const uploadToCloudinary = (file, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    streamifier.createReadStream(file.buffer).pipe(stream)
  })
}
const createRecording = async (req, res) => {
  try {
    const { clerkId } = req.auth
    const { latitude, longitude, startedAt, endedAt } = req.body
    const user = await userModel.findOne({ clerkId })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const { video, audio } = req.files || {}

    if (!video || !audio) {
      return res.status(400).json({
        message: 'Audio & Video required',
      })
    }
    const videoResult = await uploadToCloudinary(video[0], {
      resource_type: 'video',
      folder: 'angelix/recordings/videos',
    })

    const audioResult = await uploadToCloudinary(audio[0], {
      resource_type: 'video', 
      folder: 'angelix/recordings/audio',
    })
    const recording = await recordingModel.create({
      user: user._id,
      videoUrl: videoResult.secure_url,
      audioUrl: audioResult.secure_url,
      location: {
        latitude,
        longitude,
      },
      startedAt,
      endedAt,
    })

    return res.status(201).json({
      success: true,
      recording,
    })
  } catch (err) {
    console.error(' Create recording error:', err)
    return res.status(500).json({
      message: 'Recording upload failed',
    })
  }
}

const getUserRecordings = async (req, res) => {
  try {
    const { clerkId } = req.auth

    const user = await userModel.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }
    const recordings = await recordingModel
      .find({ user: user._id })
      .sort({ createdAt: -1 })

    return res.json({
      success: true,
      recordings,
    })
  } catch (err) {
    console.error(' Fetch recordings error:', err)
    return res.status(500).json({
      message: 'Failed to fetch recordings',
    })
  }
}
module.exports = {
  createRecording,
  getUserRecordings,
}
