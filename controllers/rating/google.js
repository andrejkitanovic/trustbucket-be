const axios = require('axios');

const { getIdAndTypeFromAuth } = require('../auth');
const { addAddress } = require('../company');
const { updateRatingHandle } = require('../profile');
const Company = require('../../models/company');
const { getCluster } = require('../../utils/puppeteer');

exports.getGoogleProfile = (req, res, next) => {
	(async function () {
		try {
			const fields = ['formatted_address', 'name', 'place_id', 'icon_background_color', 'rating', 'geometry'].join(
				'%2C'
			);
			const textquery = req.query.q;
			const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=${fields}&input=${textquery}&inputtype=textquery&key=${process.env.API_KEY_GOOGLE}`;

			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}

			const { data } = await axios.get(url);
			res.json(data);
		} catch (err) {
			next(err);
		}
	})();
};

exports.saveGoogleRating = (req, res, next) => {
	(async function () {
		try {
			const fields = ['name', 'rating', 'user_ratings_total', 'url', 'formatted_address', 'geometry'].join('%2C');
			const placeId = req.body.placeId;
			const url = `https://maps.googleapis.com/maps/api/place/details/json?fields=${fields}&place_id=${placeId}&key=${process.env.API_KEY_GOOGLE}`;

			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;
			const company = await Company.findById(selectedCompany);

			const { data } = await axios.get(url);

			const rating = {
				type: 'google',
				name: data.result.name,
				rating: data.result.rating,
				ratingCount: data.result.user_ratings_total,
			};
			const cluster = await getCluster();
			await cluster.queue({
				url: data.result.url,
				type: 'google',
				selectedCompany,
			});
			
			await updateRatingHandle(company, rating);
			await addAddress(
				{ name: data.result.formatted_address, position: data.result.geometry.location },
				selectedCompany
			);

			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};
