const userModel = require('../models/userModel')
const syncUser = async (req, res) => {
  try {
    const {
      clerkId,
      email,
      firstName,
      lastName,
      imageUrl,
      provider,
    } = req.auth
    console.log('✅ Sync request received for:', email, clerkId, firstName, lastName, imageUrl,provider)

    if (!email || !clerkId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid auth payload',
      })
    }

    let user = await userModel.findOne({ clerkId })

    if (!user) {
      user = await userModel.create({
        clerkId,
        email,
        name: `${firstName || ''} ${lastName || ''}`.trim(),
        avatar: imageUrl,
        provider,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User synced successfully',
      user,
    })
  } catch (error) {
    console.error(' Sync user error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to sync user',
    })
  }
}
module.exports = {
  syncUser,
}
