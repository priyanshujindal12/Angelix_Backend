const { Router } = require('express')
const sosRouter = Router()
const { startSOS, stopSOS } = require('../controllers/sosController')
const clerkAuth = require('../middlewares/clerkAuth')
sosRouter.post('/start', clerkAuth, startSOS)
sosRouter.post('/stop', clerkAuth, stopSOS)
module.exports = sosRouter
