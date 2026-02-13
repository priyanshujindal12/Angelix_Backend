const {Router}=require('express');
const Maprouter = Router();
const { getRoute } = require('../controllers/mapController')

// POST /api/maps/route
Maprouter.post('/route', getRoute)

module.exports = Maprouter
