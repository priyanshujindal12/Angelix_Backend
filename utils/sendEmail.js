const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})
const sendEmail = async (to, subject, text) => {
  try{
  await transporter.sendMail({
    from: `"Angelix Security" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  })
  console.log("email send success")
}catch(err){
 console.log("error" ,err)
}
}
module.exports = sendEmail
