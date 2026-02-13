const sendEmail = require('../utils/sendEmail')
const User = require('../models/userModel')
const OtpModel = require('../models/OtpModel')

const sendOtp = async (req, res) => {
  try {
    const { clerkId } = req.auth
    console.log("request came");
    const user = await User.findOne({ clerkId });
    console.log(user.clerkId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await OtpModel.deleteMany({ clerkId })
    await OtpModel.create({
      clerkId,
      phone: user.email, 
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })
    console.log("otp created succesfully");
    await sendEmail(
      user.email,
      'Angelix Phone Verification OTP',
      `Your OTP is ${otp}. It expires in 5 minutes.`
    )
    console.log("emial send sucessfulyy")
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    })
  } catch (error) {
    console.error('Send OTP error:', error.message)
    res.status(500).json({ message: 'Failed to send OTP', error: error.message })
  }
}
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body
    const { clerkId } = req.auth
    const existingOtp = await OtpModel.findOne({ clerkId, phone })
    if (!existingOtp) {
      return res.status(400).json({ message: 'OTP not found' })
    }
    if (existingOtp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired' })
    }
    if (existingOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }
    await User.findOneAndUpdate(
      { clerkId },
      {
        phone,
        phoneVerified: true,
      }
    )
    await OtpModel.deleteMany({ clerkId })
    return res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
    })
  } catch (error) {
    console.error('Verify OTP error:', error.message)
    res.status(500).json({ message: 'Verification failed' })
  }
}
module.exports = {
  sendOtp,
  verifyOtp,
}
