const userModel = require('../models/userModel')
const addEmergencyContact = async (req, res) => {
  try {
    const { email, nickname } = req.body
    const { clerkId } = req.auth;
    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      })
    }
    const currentUser = await userModel.findOne({ clerkId })
    if (!currentUser) {
      return res.status(404).json({
        message: 'User not found',
      })
    }
    const contactUser = await userModel.findOne({
      email: email.toLowerCase(),
    })
    if (!contactUser) {
      return res.status(404).json({
        message: 'User with this email does not exist',
      })
    }
    if (contactUser._id.equals(currentUser._id)) {
      return res.status(400).json({
        message: 'You cannot add yourself',
      })
    }
    const alreadyExists = currentUser.emergencyContacts.find(
      (c) => c.user.toString() === contactUser._id.toString()
    )
    if (alreadyExists) {
      return res.status(400).json({
        message: 'Contact already added',
      })
    }
    currentUser.emergencyContacts.push({
      user: contactUser._id,
      nickname,
    })
    await currentUser.save()
    res.status(200).json({
      success: true,
      message: 'Emergency contact added successfully',
    })
  } catch (error) {
    console.error('Add emergency contact error:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}
const getEmergencyContacts = async (req, res) => {
  try {
    const { clerkId } = req.auth
    const user = await userModel.findOne({ clerkId })
      .populate('emergencyContacts.user', 'name email avatar phoneNumber')
    res.json({
      success: true,
      contacts: user.emergencyContacts,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contacts' })
  }
}

module.exports={addEmergencyContact,getEmergencyContacts}