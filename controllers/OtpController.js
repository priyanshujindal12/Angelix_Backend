const { Resend } = require('resend')
const User = require('../models/userModel')
const OtpModel = require('../models/OtpModel')
const resend = new Resend(process.env.RESEND_API_KEY)
const { parsePhoneNumberFromString } = require('libphonenumber-js')
const validatePhone = (phone) => {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone)

    if (!phoneNumber || !phoneNumber.isValid()) {
      return null
    }
    return phoneNumber.number
  } catch {
    return null
  }
}

const sendOtp = async (req, res) => {
  try {
    const { clerkId } = req.auth
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({
        message: 'Phone number required',
      })
    }

    // ✅ VALIDATE PHONE
    const validPhone = validatePhone(phone)

    if (!validPhone) {
      return res.status(400).json({
        message: 'Invalid phone number format',
      })
    }
    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    console.log('📩 OTP request for phone:', phone)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await OtpModel.deleteMany({ clerkId })
    await OtpModel.create({
      clerkId,
      phone,   // ✅ STORE REAL PHONE
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })

    console.log('✅ OTP created:', otp)

    /* ---------- SEND EMAIL ---------- */

    await resend.emails.send({
      from: 'Angelix Safety <onboarding@resend.dev>',
      to: user.email,
      subject: 'Angelix Phone Verification OTP',
      html: `
        <div style="font-family: Arial; padding:20px">
          <h2>Angelix Safety Verification</h2>
          <p>Phone Number:</p>
          <b>${phone}</b>
          <p>Your OTP is:</p>
          <h1 style="color:#9333EA">${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        </div>
      `,
    })
    console.log("email sent succesfully");
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
