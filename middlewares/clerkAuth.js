const { verifyToken, createClerkClient } = require('@clerk/backend')
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})
const clerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    })
    const clerkUser = await clerkClient.users.getUser(payload.sub)
    console.log(clerkUser.id, clerkUser.emailAddresses[0]?.emailAddress, clerkUser.firstName, clerkUser.lastName)
    req.auth = {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      provider: clerkUser.externalAccounts?.[0]?.provider || 'email',
    }
    next()
  } catch (error) {
    console.error('Clerk auth failed:', error.message)
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

module.exports = clerkAuth
