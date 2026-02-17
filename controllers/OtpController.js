const brevo = require('@getbrevo/brevo')
const User = require('../models/userModel')
const OtpModel = require('../models/OtpModel')
const { parsePhoneNumberFromString } = require('libphonenumber-js')
const brevoClient = new brevo.TransactionalEmailsApi()
brevoClient.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
)

const validatePhone = (phone) => {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone)

    if (!phoneNumber || !phoneNumber.isValid()) {
      return null
    }

    // returns normalized format (+91XXXXXXXXXX)
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

    const validPhone = validatePhone(phone)

    if (!validPhone) {
      return res.status(400).json({
        message: 'Invalid phone number format',
      })
    }

    const user = await User.findOne({ clerkId })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    console.log('📩 OTP request for:', validPhone)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await OtpModel.deleteMany({ clerkId })

    await OtpModel.create({
      clerkId,
      phone: validPhone, 
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })

    console.log('✅ OTP created:', otp)

    const emailData = {
      sender: {
        name: 'Angelix Safety',
        email: 'priyanshujindal009@gmail.com', // must be verified in Brevo
      },
      to: [
        {
          email: user.email,
        },
      ],
      subject: 'Angelix Phone Verification OTP',
      htmlContent: `
        <div style="font-family:Arial;padding:20px">
          <h2>Angelix Safety Verification</h2>

          <p>Phone Number:</p>
          <b>${validPhone}</b>

          <p>Your OTP is:</p>
          <h1 style="color:#9333EA">${otp}</h1>

          <p>This OTP expires in <b>5 minutes</b>.</p>
        </div>
      `,
    }

    await brevoClient.sendTransacEmail(emailData)

    console.log('✅ Email sent successfully to:', user.email)

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    })
  } catch (error) {
    console.error(' Send OTP error:', error)
    return res.status(500).json({
      message: 'Failed to send OTP',
      error: error.message,
    })
  }
}


const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body
    const { clerkId } = req.auth
    if (!phone || !otp) {
      return res.status(400).json({
        message: 'Phone and OTP required',
      })
    }
    const validPhone = validatePhone(phone)

    if (!validPhone) {
      return res.status(400).json({
        message: 'Invalid phone number',
      })
    }

    /* ---------- FIND OTP ---------- */

    const existingOtp = await OtpModel.findOne({
      clerkId,
      phone: validPhone,
    })

    if (!existingOtp) {
      return res.status(400).json({
        message: 'OTP not found',
      })
    }

    if (existingOtp.expiresAt < new Date()) {
      return res.status(400).json({
        message: 'OTP expired',
      })
    }

    if (existingOtp.otp !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP',
      })
    }

    /* ---------- UPDATE USER ---------- */

    await User.findOneAndUpdate(
      { clerkId },
      {
        phone: validPhone,
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
