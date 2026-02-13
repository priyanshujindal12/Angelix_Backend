const { Resend } = require('resend')
const User = require('../models/userModel')
const OtpModel = require('../models/OtpModel')
const resend = new Resend(process.env.RESEND_API_KEY)
const sendOtp = async (req, res) => {
  try {
    const { clerkId } = req.auth
    console.log('📩 OTP request received')
    const user = await User.findOne({ clerkId })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    console.log('User email:', user.email)

    /* ---------- GENERATE OTP ---------- */
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await OtpModel.deleteMany({ clerkId })
    await OtpModel.create({
      clerkId,
      phone: user.email, // using email verification
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })
    console.log('✅ OTP created:', otp)

    /* ---------- SEND EMAIL VIA RESEND ---------- */
    const response = await resend.emails.send({
      from: 'Angelix Safety <onboarding@resend.dev>', // default resend sender
      to: user.email,
      subject: 'Angelix Phone Verification OTP',
      html: `
        <div style="font-family: Arial; padding:20px">
          <h2>Angelix Safety Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="color:#9333EA">${otp}</h1>
          <p>This OTP expires in <b>5 minutes</b>.</p>
        </div>
      `,
    })
    console.log('✅ Email sent:', response)
    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    })
  } catch (error) {
    console.error('❌ Send OTP error:', error)

    return res.status(500).json({
      success: false,
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

    console.log('✅ Phone verified successfully')

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
