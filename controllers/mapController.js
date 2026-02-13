const axios = require('axios')
const getRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body
    if (!origin || !destination) {
      return res.status(400).json({
        message: 'Origin and destination required',
      })
    }
    console.log("📍 Route Request:", origin, "→", destination)

    const googleResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin,
          destination,
          mode: 'driving',
          key: process.env.GOOGLE_DIRECTIONS_API_KEY,
        },
      }
    )

    const route = googleResponse.data.routes[0]

    if (!route) {
      return res.status(404).json({
        message: 'No route found',
      })
    }
    res.status(200).json({
      polyline: route.overview_polyline.points,
      distance: route.legs[0].distance,
      duration: route.legs[0].duration,
      startAddress: route.legs[0].start_address,
      endAddress: route.legs[0].end_address,
    })

  } catch (error) {
    console.error("❌ Route fetch error:", error.message)

    res.status(500).json({
      message: 'Failed to fetch route',
    })
  }
}

module.exports = { getRoute }
