const {Router}=require('express');
const Maprouter = Router();
const { getRoute } = require('../controllers/mapController')
Maprouter.post('/route', getRoute)
module.exports = Maprouter
