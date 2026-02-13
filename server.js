require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const authRouter = require('./routes/authRoutes')
const testRouter = require('./routes/testRoute')
const Maprouter = require('./routes/MapRoutes')
const app = express()
app.use(cors())
app.use(express.json())
connectDB()
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Angelix backend is running ',
  })
})

app.use('/api/auth', authRouter)
app.use('/api/test', testRouter);
app.use('/api/maps',Maprouter);
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})
