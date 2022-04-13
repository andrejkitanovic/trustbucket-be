const { sendEmail, getCampaignOverview } = require('../utils/mailer');
const EmailTemplate = require('../models/emailTemplate');
const Campaign = require('../models/campaign');
const InvitationSettings = require('../models/invitationSettings');

exports.getCampaigns = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const campaigns = await Campaign.find({ company: selectedCompany });
		const count = await Campaign.countDocuments({ company: selectedCompany });

		res.status(200).json({
			total: count,
			data: campaigns,
		});
	} catch (err) {
		next(err);
	}
};

exports.getCampaignStats = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const campaigns = await Campaign.find({ company: selectedCompany }).select('id recievers');
		const campaignsId = campaigns.map((campaign) => campaign._id.toString());
		const campaignsEmails = campaigns.map((campaign) => campaign.recievers.map((reciever) => reciever.email)).flat();

		const allCampaignsOverview = await getCampaignOverview();
		const result = allCampaignsOverview.filter((campaign) => campaignsId.includes(campaign.Title));

		const stats = {
			campaignCount: result.length,
			invitationsCount: result.reduce((sum, single) => sum + single.DeliveredCount, 0),
			uniqueCustomersCount: [...new Set(campaignsEmails)].length,
			openCount: result.reduce((sum, single) => sum + single.OpenedCount, 0),
			clickCount: result.reduce((sum, single) => sum + single.ClickedCount, 0),
			processCount: result.reduce((sum, single) => sum + single.ProcessedCount, 0),
		};

		res.status(200).json({
			stats,
		});
	} catch (err) {
		next(err);
	}
};

exports.postCampaign = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const { templateId, reminder, recievers } = req.body;

		const template = await EmailTemplate.findById(templateId).select('subject content linkUrl');

		const campaignObject = new Campaign({
			company: selectedCompany,
			emailTemplate: templateId,
			reminder,
			recievers,
		});
		const campaign = await campaignObject.save();

		const invitation = await InvitationSettings.findOne({ company: selectedCompany });
		await sendEmail(template, recievers, campaign._id, invitation);

		res.status(200).json({
			campaign: campaignObject,
			message: 'Successfully sent!',
		});
	} catch (err) {
		next(err);
	}
};
