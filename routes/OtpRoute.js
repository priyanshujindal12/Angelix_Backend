const {Router}=require('express');
const otpRouter=Router();
const { sendOtp, verifyOtp } = require('../controllers/OtpController')
const clerkAuth = require('../middlewares/clerkAuth');
otpRouter.post('/send-otp', clerkAuth, sendOtp)
otpRouter.post('/verify-otp', clerkAuth, verifyOtp)
module.exports = otpRouter