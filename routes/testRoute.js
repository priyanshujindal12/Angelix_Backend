const {Router}= require('express')
const testRouter =Router()
const clerkAuth = require('../middlewares/clerkAuth')
const { protectedTest } = require('../controllers/testController')
testRouter.get('/protected', clerkAuth, protectedTest)
module.exports =testRouter
