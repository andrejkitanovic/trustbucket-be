const Widget = require('../models/widget');
const Rating = require('../models/rating');
const { getIdAndTypeFromAuth } = require('./auth');

exports.getWidget = (req, res, next) => {
	(async function () {
		try {
			const { id } = req.query;

			let widget = await Widget.findById(id);
			const companyId = widget.selectedCompany;
			await widget.populate('selectedCompany');

			const params = {};
			if (widget.object && widget.object.reviewSources && widget.object.reviewSources !== 'all') {
				params.type = widget.object.reviewSources;
			}

			const ratings = await Rating.find({ company: companyId }).limit(10);

			res.status(200).json({ widget, ratings });
		} catch (err) {
			next(err);
		}
	})();
};

exports.postWidget = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}

			const { object, attributes } = req.body;

			const { selectedCompany } = auth;

			const widgetObject = new Widget({
				selectedCompany,
				object,
				attributes,
			});

			const widget = await widgetObject.save();

			const attributesToValues = Object.keys(attributes).map((attribute) => `${attribute}="${attributes[attribute]}"`);

			res.status(200).json({
				link: `<iframe ${attributesToValues.join(' ')} src="https://admin.trustbucket.io/widget/${widget._id}"></iframe>`,
				message: 'Successfully created!',
			});
		} catch (err) {
			next(err);
		}
	})();
};