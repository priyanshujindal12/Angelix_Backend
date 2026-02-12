const userModel = require("../models/userModel")

const updateLocation = async (req, res) => {
  try {
    console.log("request came to update location")
    const { latitude, longitude } = req.body
    const { clerkId } = req.auth
    
    const user=await userModel.findOneAndUpdate(
      { clerkId },
      {
        lastKnownLocation: {
          latitude,
          longitude,
          updatedAt: new Date(),
        },
      }
    )
    console.log("fetch data for update")
    await user.save();
    console.log("done and update location")
    res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update location' })
  }
}
module.exports=updateLocation;