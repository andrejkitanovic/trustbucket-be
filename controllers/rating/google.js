const axios = require('axios')
// const utf8 = require('utf8')

// const Company = require('../../models/company')
const Rating = require('../../models/rating')
// const { addAddress } = require('../company')
const { updateRatingHandle, deleteRatingHandle } = require('../profile')
// const { getCluster } = require('../../utils/puppeteer')

const getRefreshTokenFromCode = async (code) => {
  try {
    const res = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.CLIENT_ID_GOOGLE,
      client_secret: process.env.CLIENT_SECRET_GOOGLE,
      redirect_uri: 'https://admin.trustbucket.io',
      grant_type: 'authorization_code',
      code,
    })
    console.log('Refresh token' + res.data.refresh_token)
    return res.data.refresh_token
  } catch (err) {
    console.log('Refresh token error', err)
    throw new Error(err)
  }
}
const getAccessTokenFromRefreshToken = async (refreshToken) => {
  try {
    const res = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.CLIENT_ID_GOOGLE,
      client_secret: process.env.CLIENT_SECRET_GOOGLE,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
    console.log('Access token' + res.data.access_token)
    return res.data.access_token
  } catch (err) {
    console.log('Access token error', err)
    throw new Error(err)
  }
}
const getGoogleIdFromAccesToken = async (accessToken) => {
  try {
    const res = await axios.get(
      'https://mybusiness.googleapis.com/v4/accounts',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return res.data.accounts[0].name.replace('accounts/', '')
  } catch (err) {
    throw new Error(err)
  }
}

// exports.getGoogleProfile = async (req, res, next) => {
//   try {
//     const fields = [
//       'formatted_address',
//       'name',
//       'place_id',
//       'icon_background_color',
//       'rating',
//       'geometry',
//       'icon',
//     ].join('%2C')
//     const textquery = req.body.q

//     const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=${fields}&input=${utf8.encode(
//       textquery
//     )}&inputtype=textquery&key=${process.env.API_KEY_GOOGLE}`

//     const { data } = await axios.get(url)

//     res.json(data)
//   } catch (err) {
//     next(err)
//   }
// }

// exports.saveGoogleRating = async (req, res, next) => {
//   try {
//     const fields = [
//       'name',
//       'rating',
//       'user_ratings_total',
//       'url',
//       'formatted_address',
//       'geometry',
//       'photos',
//     ].join('%2C')
//     const { placeId } = req.body
//     const url = `https://maps.googleapis.com/maps/api/place/details/json?fields=${fields}&place_id=${placeId}&key=${process.env.API_KEY_GOOGLE}`

//     const { selectedCompany } = req.auth

//     const { data } = await axios.get(url)

//     if (data.result.photos && data.result.photos.length) {
//       const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${data.result.photos[0].photo_reference}&key=${process.env.API_KEY_GOOGLE}`

//       const { request } = await axios.get(photoUrl)
//       const photo = request.res.responseUrl

//       const company = await Company.findById(selectedCompany)
//       company.image = photo
//       await company.save()
//     }

//     const rating = {
//       placeId,
//       type: 'google',
//       name: data.result.name,
//       rating: data.result.rating,
//       ratingCount: data.result.user_ratings_total,
//       url: data.result.url,
//     }
//     if (!rating.rating || Number.isNaN(rating.rating)) {
//       rating.rating = 0
//     }
//     if (!rating.ratingCount || Number.isNaN(rating.ratingCount)) {
//       rating.ratingCount = 0
//     }

//     await updateRatingHandle(selectedCompany, rating)

//     if (rating.ratingCount) {
//       const cluster = await getCluster()
//       await cluster.queue({
//         url: data.result.url,
//         type: 'google',
//         selectedCompany,
//       })
//     }

//     await addAddress(
//       {
//         name: data.result.formatted_address,
//         position: data.result.geometry.location,
//       },
//       selectedCompany
//     )

//     res.json(rating)
//   } catch (err) {
//     next(err)
//   }
// }

// exports.cronGoogleProfile = async (
//   placeId,
//   selectedCompany,
//   previousRatings
// ) => {
//   try {
//     const fields = [
//       'name',
//       'rating',
//       'user_ratings_total',
//       'url',
//       'formatted_address',
//       'geometry',
//       'photos',
//     ].join('%2C')
//     const url = `https://maps.googleapis.com/maps/api/place/details/json?fields=${fields}&place_id=${placeId}&key=${process.env.API_KEY_GOOGLE}`

//     const { data } = await axios.get(url)

//     if (data.result && data.result.photos.length) {
//       const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${data.result.photos[0].photo_reference}&key=${process.env.API_KEY_GOOGLE}`

//       const { request } = await axios.get(photoUrl)
//       const photo = request.res.responseUrl

//       const company = await Company.findById(selectedCompany)
//       company.image = photo
//       await company.save()
//     }

//     const rating = {
//       placeId,
//       type: 'google',
//       name: data.result.name,
//       rating: data.result.rating,
//       ratingCount: data.result.user_ratings_total,
//       url: data.result.url,
//     }

//     if (previousRatings < rating.ratingCount) {
//       await deleteRatingHandle(selectedCompany, 'google')
//       await updateRatingHandle(selectedCompany, rating)
//       const cluster = await getCluster()
//       await cluster.queue({
//         url: data.result.url,
//         type: 'google',
//         selectedCompany,
//       })
//     } else console.log('Same google reviews as previous')
//   } catch (err) {
//     console.log(err)
//   }
// }

exports.getGoogleLocations = async (req, res, next) => {
  try {
    const { code } = req.body

    const refreshToken = await getRefreshTokenFromCode(code)
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken)
    const googleId = await getGoogleIdFromAccesToken(accessToken)

    const { data: locationsData } = await axios.get(
      `https://mybusiness.googleapis.com/v4/accounts/${googleId}/locations`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    const { locations } = locationsData

    if (!locations) {
      throw new Error('User has no locations!')
    }

    const parsedLocations = locations.map((location) => ({
      route: location.name,
      name: location.locationName,
      website: location.websiteUrl,
      url: location.metadata.mapsUrl,
      placeId: location.locationKey.placeId,
      refreshToken,
      accessToken,
    }))

    res.json(parsedLocations)
  } catch (err) {
    next(err)
  }
}

const wordToNumber = (word) => {
  switch (word) {
    case 'ONE':
      return 1
    case 'TWO':
      return 2
    case 'THREE':
      return 3
    case 'FOUR':
      return 4
    case 'FIVE':
      return 5
  }
  return 0
}

exports.saveGoogleReviews = async (req, res, next) => {
  try {
    const { route, name, url, refreshToken, accessToken, placeId } = req.body
    const selectedCompany = req.auth.selectedCompany._id

    const { data: reviewsData } = await axios.get(
      `https://mybusiness.googleapis.com/v4/${route}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const rating = {
      placeId,
      route,
      type: 'google',
      name: name,
      rating: reviewsData.averageRating,
      ratingCount: reviewsData.totalReviewCount,
      url,
      refreshToken,
    }
    await updateRatingHandle(selectedCompany, rating)

    const { reviews } = reviewsData

    let items = reviews.map((review) => {
      let description = review.comment

      if (description && description.includes('(Original)')) {
        description = description.split('(Original)')[1]
      }

      let reply
      if (review.reviewReply && review.reviewReply.comment) {
        reply = review.reviewReply.comment
      }

      return {
        company: selectedCompany._id,
        url,
        image: review.reviewer.profilePhotoUrl,
        type: 'google',
        name: review.reviewer.displayName,
        description,
        rating: wordToNumber(review.starRating),
        date: new Date(review.createTime),
        reply: {
          text: reply,
        },
      }
    })

    if (items.length) {
      console.log(`LOADED REVIEWS:${items.length}`)
      items = items.filter((item) => item.name && item.rating && item.date)
      console.log(`VALID REVIEWS:${items.length}`)

      await Rating.insertMany(items)
    }

    res.json(rating)
  } catch (err) {
    next(err)
  }
}

exports.cronGoogleProfile = async (
  refreshToken,
  route,
  url,
  name,
  placeId,
  selectedCompany,
  previousRatings
) => {
  try {
    const accessToken = await getAccessTokenFromRefreshToken(refreshToken)

    const { data: reviewsData } = await axios.get(
      `https://mybusiness.googleapis.com/v4/${route}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (previousRatings < reviewsData.totalReviewCount) {
      await deleteRatingHandle(selectedCompany, 'google')

      const rating = {
        placeId,
        route,
        type: 'google',
        name: name,
        rating: reviewsData.averageRating,
        ratingCount: reviewsData.totalReviewCount,
        url,
        refreshToken,
      }
      await updateRatingHandle(selectedCompany, rating)

      const { reviews } = reviewsData

      let items = reviews.map((review) => {
        let description = review.comment

        if (description && description.includes('(Original)')) {
          description = description.split('(Original)')[1]
        }

        let reply
        if (review.reviewReply && review.reviewReply.comment) {
          reply = review.reviewReply.comment
        }

        return {
          company: selectedCompany._id,
          url,
          image: review.reviewer.profilePhotoUrl,
          type: 'google',
          name: review.reviewer.displayName,
          description,
          rating: wordToNumber(review.starRating),
          date: new Date(review.createTime),
          reply: {
            text: reply,
          },
        }
      })

      if (items.length) {
        console.log(`LOADED REVIEWS:${items.length}`)
        items = items.filter((item) => item.name && item.rating && item.date)
        console.log(`VALID REVIEWS:${items.length}`)

        await Rating.insertMany(items)
      }
    } else console.log('Same google reviews as previous')
  } catch (err) {
    console.log(err)
  }
}
