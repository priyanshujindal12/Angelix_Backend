const {Router}=require('express')
const recordingRouter = Router();
const upload = require('../middlewares/upload')
const clerkAuth = require('../middlewares/clerkAuth')
const {createRecording,getUserRecordings}=require('../controllers/RecordingCotroller')
recordingRouter.post('/create',clerkAuth,upload.fields([{ name: 'video', maxCount: 1 },
{ name: 'audio', maxCount: 1 },]),createRecording)
recordingRouter.get('/my', clerkAuth, getUserRecordings)
module.exports = recordingRouter
