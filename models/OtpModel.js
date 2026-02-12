const mongoose=require('mongoose');
const OtpSchema=new mongoose.Schema({
    clerkId: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
})
const OtpModel=mongoose.model("Otp", OtpSchema);
module.exports=OtpModel