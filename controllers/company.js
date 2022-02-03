const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Company = require('../models/company');
const { getIdAndTypeFromAuth } = require('./auth');

exports.postCompany = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { id } = auth;
			const { companyName, websiteURL } = req.body;

			const profile = await User.findById(id);

			const companyObject = new Company({
				user: profile._id,
				name: companyName,
				websiteURL,
				ratings: [{ type: 'overall', rating: null, ratingCount: 0 }],
			});

			profile.selectedCompany = companyObject._id;
			profile.companies = [...profile.companies, companyObject._id];

			const userCreated = await profile.save();
			const companyCreated = await companyObject.save();

			const token = jwt.sign(
				{ id: profile._id, type: profile.type, selectedCompany: profile.selectedCompany },
				process.env.DECODE_KEY,
				{
					// expiresIn: "1h",
				}
			);

			if (userCreated && companyCreated) {
				await profile.populate('selectedCompany', '_id name websiteURL ratings');
				await profile.populate('companies', '_id name');
				res.status(200).json({
					token,
					data: profile,
					message: 'Company successfully added!',
				});
			}
		} catch (err) {
			next(err);
		}
	})();
};
