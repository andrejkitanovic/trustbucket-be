const Feedback = require('../models/feedback');

exports.getFeedbacks = async (req, res, next) => {
	try {
		const feedbacks = await Feedback.find().populate('company');
		const count = await Feedback.count();

		res.status(200).json({
			data: feedbacks,
			total: count,
		});
	} catch (err) {
		next(err);
	}
};

exports.postFeedback = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const feedbackObject = new Feedback({
			company: selectedCompany,
			...req.body,
		});
		await feedbackObject.save();

		res.status(200).json({
			message: 'Feedback sent!',
		});
	} catch (err) {
		next(err);
	}
};
