const protectedTest = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Protected route accessed successfully',
    auth: req.auth,
  })
}
module.exports = {
  protectedTest,
}