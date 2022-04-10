const express = require('express');

module.exports = (app) => {
	const authRoutes = require('./auth');
	const userRoutes = require('./user');
	const profileRoutes = require('./profile');
	const logRoutes = require('./log');
	const ratingRoutes = require('./rating');
	const companyRoutes = require('./company');
	const emailTemplateRoutes = require('./emailTemplate');
	const campaignRoutes = require('./campaign');
	const invitationSettingsRoutes = require('./invitationSettings');
	const widgetRoutes = require('./widget');
	const webhookRoutes = require('./webhook');

	// API routes
	app.use('/api/auth', authRoutes);
	app.use('/api/user', userRoutes);
	app.use('/api/profile', profileRoutes);
	app.use('/api/log', logRoutes);
	app.use('/api/rating', ratingRoutes);
	app.use('/api/company', companyRoutes);
	app.use('/api/email-template', emailTemplateRoutes);
	app.use('/api/campaign', campaignRoutes);
	app.use('/api/invitation-settings', invitationSettingsRoutes);
	app.use('/api/widget', widgetRoutes);
	app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);
};
