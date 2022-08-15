const axios = require('axios')
const { updateRatingHandle } = require('../profile')
const Rating = require('../../models/rating')

exports.searchYelpProfile = async (req, res, next) => {
  const { q, location } = req.body

  try {
    const response = await axios.get(
      `https://api.yelp.com/v3/businesses/search?term=${q}&location=${location}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        },
      }
    )
    let object = {}

    if (response.data.businesses && response.data.businesses.length) {
      const business = response.data.businesses[0]
      object = {
        placeId: business.id,
        title: business.name,
        image: business.image_url,
        rating: business.rating,
        ratingCount: business.review_count,
        address: business.location.display_address.join(', '),
        link: business.url,
      }
    }

    res.json(object)
  } catch (err) {
    next(err)
  }
}

exports.saveYelpProfile = async (req, res, next) => {
  const { placeId } = req.body

  try {
    const { data } = await axios.get(
      `https://api.yelp.com/v3/businesses/${placeId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        },
      }
    )

    const { selectedCompany } = req.auth

    const rating = {
      type: 'yelp',
      name: data.name,
      rating: data.rating,
      ratingCount: data.review_count,
      url: data.url,
    }
    await updateRatingHandle(selectedCompany, rating)

    const { data: reviewsData } = await axios.get(
      `https://api.yelp.com/v3/businesses/${placeId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        },
      }
    )

    let items = []
    if (reviewsData.reviews && reviewsData.reviews.length) {
      items = reviewsData.reviews.map((review) => {
        return {
          company: selectedCompany._id,
          url: data.url,
          image: review.user.image_url,
          type: 'yelp',
          name: review.user.name,
          description: review.text,
          rating: review.rating,
          date: new Date(review.time_created),
          //   reply: {
          // text: reply,
          //   },
        }
      })
    }

    if (items.length) {
      console.log(`LOADED REVIEWS:${items.length}`)
      items = items.filter((item) => item.name && item.rating && item.date)
      console.log(`VALID REVIEWS:${items.length}`)

      await Rating.insertMany(items)
    }

    res.json(reviewsData)
  } catch (err) {
    next(err)
  }
}
