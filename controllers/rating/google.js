const axios = require('axios');
const utf8 = require('utf8');

const Company = require('../../models/company');
const { addAddress } = require('../company');
const { updateRatingHandle, deleteRatingHandle } = require('../profile');
const { getCluster } = require('../../utils/puppeteer');

exports.getGoogleProfile = async (req, res, next) => {
	try {
		const fields = [
			'formatted_address',
			'name',
			'place_id',
			'icon_background_color',
			'rating',
			'geometry',
			'icon',
		].join('%2C');
		const textquery = req.body.q;

		const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=${fields}&input=${utf8.encode(textquery)}&inputtype=textquery&key=${process.env.API_KEY_GOOGLE}`;

		const { data } = await axios.get(url);

		res.json(data);
	} catch (err) {
		next(err);
	}
};

exports.saveGoogleRating = async (req, res, next) => {
	try {
		const fields = ['name', 'rating', 'user_ratings_total', 'url', 'formatted_address', 'geometry', 'photos'].join(
			'%2C'
		);
		const placeId = req.body.placeId;
		const url = `https://maps.googleapis.com/maps/api/place/details/json?fields=${fields}&place_id=${placeId}&key=${process.env.API_KEY_GOOGLE}`;

		const { selectedCompany } = req.auth;

		const { data } = await axios.get(url);

		if (data.result.photos && data.result.photos.length) {
			const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${data.result.photos[0].photo_reference}&key=${process.env.API_KEY_GOOGLE}`;

			const { request } = await axios.get(photoUrl);
			const photo = request.res.responseUrl;

			const company = await Company.findById(selectedCompany);
			company.image = photo;
			await company.save();
		}

		const rating = {
			placeId,
			type: 'google',
			name: data.result.name,
			rating: data.result.rating,
			ratingCount: data.result.user_ratings_total,
			url: data.result.url,
		};
		await updateRatingHandle(selectedCompany, rating);
		const cluster = await getCluster();
		await cluster.queue({
			url: data.result.url,
			type: 'google',
			selectedCompany,
		});

		await addAddress({ name: data.result.formatted_address, position: data.result.geometry.location }, selectedCompany);

		res.json(rating);
	} catch (err) {
		next(err);
	}
};

exports.cronGoogleProfile = async (placeId, selectedCompany, previousRatings) => {
	try {
		const fields = ['name', 'rating', 'user_ratings_total', 'url', 'formatted_address', 'geometry', 'photos'].join(
			'%2C'
		);
		const url = `https://maps.googleapis.com/maps/api/place/details/json?fields=${fields}&place_id=${placeId}&key=${process.env.API_KEY_GOOGLE}`;

		const { data } = await axios.get(url);

		if (data.result && data.result.photos.length) {
			const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${data.result.photos[0].photo_reference}&key=${process.env.API_KEY_GOOGLE}`;

			const { request } = await axios.get(photoUrl);
			const photo = request.res.responseUrl;

			const company = await Company.findById(selectedCompany);
			company.image = photo;
			await company.save();
		}

		const rating = {
			placeId,
			type: 'google',
			name: data.result.name,
			rating: data.result.rating,
			ratingCount: data.result.user_ratings_total,
			url: data.result.url,
		};

		if (previousRatings < rating.ratingCount) {
			await deleteRatingHandle(selectedCompany, 'google');
			await updateRatingHandle(selectedCompany, rating);
			const cluster = await getCluster();
			await cluster.queue({
				url: data.result.url,
				type: 'google',
				selectedCompany,
			});

			console.log(rating);
		} else console.log('Same google reviews as previous');
	} catch (err) {
		console.log(err);
	}
};
