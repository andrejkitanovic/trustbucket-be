module.exports = (app) => {
	const authRoutes = require('./auth');
	const userRoutes = require('./user');
	const profileRoutes = require('./profile');
	const logRoutes = require('./log');
	const ratingRoutes = require('./rating');
	const companyRoutes = require('./company');
	const emailTemplateRoutes = require('./emailTemplate');

	// API routes
	app.use('/api/auth', authRoutes);
	app.use('/api/user', userRoutes);
	app.use('/api/profile', profileRoutes);
	app.use('/api/log', logRoutes);
	app.use('/api/rating', ratingRoutes);
	app.use('/api/company', companyRoutes);
	app.use('/api/email-template', emailTemplateRoutes);
};
