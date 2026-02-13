require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})
console.log(process.env.EMAIL_PASS);
console.log(process.env.EMAIL_USER);
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"Angelix Safety" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    })

    console.log('✅ Email sent:', info.response)
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    throw error
  }
}

module.exports = sendEmail
