const {Router}=require('express');
const emergencyContactrouter=Router();
const { addEmergencyContact, getEmergencyContacts } = require("../controllers/emergencyController")
const clerkAuth = require("../middlewares/clerkAuth")
emergencyContactrouter.post('/add', clerkAuth, addEmergencyContact)
emergencyContactrouter.get('/list', clerkAuth, getEmergencyContacts)
module.exports = emergencyContactrouter
