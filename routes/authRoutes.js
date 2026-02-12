const {Router}=require('express');
const clerkAuth = require('../middlewares/clerkAuth');
const { syncUser } = require('../controllers/authController');
const updateLocation = require('../controllers/updateLocation');
const authRouter=Router();
authRouter.post("/sync", clerkAuth, syncUser);
authRouter.put("/update-location", clerkAuth, updateLocation);
module.exports=authRouter