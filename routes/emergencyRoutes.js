const {Router}=require('express');
const emergencyContactrouter=Router();
const { addEmergencyContact, getEmergencyContacts, deleteEmergencyContact } = require("../controllers/emergencyController")
const clerkAuth = require("../middlewares/clerkAuth")
emergencyContactrouter.post('/add', clerkAuth, addEmergencyContact)
emergencyContactrouter.get('/list', clerkAuth, getEmergencyContacts)
emergencyContactrouter.post('/delete', clerkAuth, deleteEmergencyContact);
module.exports = emergencyContactrouter
