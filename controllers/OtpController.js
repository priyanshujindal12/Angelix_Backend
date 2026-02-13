const nodemailer = require('nodemailer')
const User = require('../models/userModel')
const OtpModel = require('../models/OtpModel')

/* ------------------------------------------------ */
/* CREATE MAIL TRANSPORTER (ONLY ONCE) */
/* ------------------------------------------------ */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app password (NO SPACES)
  },
})

/* ------------------------------------------------ */
/* SEND OTP */
/* ------------------------------------------------ */

const sendOtp = async (req, res) => {
  try {
    const { clerkId } = req.auth

    console.log('✅ Request came')

    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    console.log('User:', user.email)

    /* ---------- GENERATE OTP ---------- */

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await OtpModel.deleteMany({ clerkId })

    await OtpModel.create({
      clerkId,
      phone: user.email, // using email for verification
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })

    console.log('✅ OTP created:', otp)

    /* ---------- SEND EMAIL ---------- */

    const mailOptions = {
      from: `"Angelix Safety" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Angelix Phone Verification OTP',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log('✅ Email sent:', info.response)

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    })
  } catch (error) {
    console.error('❌ Send OTP error:', error)
    return res.status(500).json({
      message: 'Failed to send OTP',
      error: error.message,
    })
  }
}

/* ------------------------------------------------ */
/* VERIFY OTP */
/* ------------------------------------------------ */

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
    console.error('❌ Verify OTP error:', error)
    return res.status(500).json({
      message: 'Verification failed',
    })
  }
}

module.exports = {
  sendOtp,
  verifyOtp,
}
