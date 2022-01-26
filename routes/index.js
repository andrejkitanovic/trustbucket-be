module.exports = (app) => {
	const authRoutes = require('./auth');
	const userRoutes = require('./user');
	const profileRoutes = require('./profile');
	const logRoutes = require('./log');
	const ratingRoutes = require('./rating');

	// API routes
	app.use('/api/auth', authRoutes);
	app.use('/api/user', userRoutes);
	app.use('/api/profile', profileRoutes);
	app.use('/api/log', logRoutes);
	app.use('/api/rating', ratingRoutes);
};
