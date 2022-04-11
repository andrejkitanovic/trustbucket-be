const mailjet = require('node-mailjet').connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);
const campaignEmail = require('./emailTemplates/campaignEmail');
const confirmEmail = require('./emailTemplates/confirmEmail');
const forgotPassword = require('./emailTemplates/forgotPassword');

exports.getCampaignOverview = async () => {
	const { body: result } = await mailjet.get('campaignoverview').request();

	return result.Data;
};

// const sendEmailButton = (url, text) => `<a
// style="color: #2563eb"
// href="${url}"
// >https://admin.trustbucket.io/confirm-email?id=${id}</a
// >`;

exports.sendEmail = async (template, recievers, campaignId, invitation) => {
	try {
		const { subject, content, linkUrl } = template;

		const { body: result } = await mailjet.post('send', { version: 'v3.1' }).request({
			Messages: recievers.map((reciever) => {
				let personalizedContent = content;
				personalizedContent = personalizedContent.replace(/{firstName}/g, reciever.firstName);
				personalizedContent = personalizedContent.replace(/{lastName}/g, reciever.lastName);
				personalizedContent = personalizedContent.replace(/{email}/g, reciever.email);

				let button = null;
				if (/{review_link:(.*?)}/g.test(personalizedContent)) {
					const buttonText = personalizedContent.split('{review_link:').pop().split('}')[0];
					// personalizedContent = personalizedContent.replace(
					// 	/{review_link:(.*?)}/g,
					// 	`<a href="${linkUrl}">${buttonText.trim()}</a>`
					// );
					personalizedContent = personalizedContent.replace(/{review_link:(.*?)}/g, '');

					button = {
						text: buttonText.trim(),
						url: linkUrl,
					};
				}

				return {
					From: {
						// Email: 'noreply.invitations@trustbucket.io',
						Email: 'kitanovicandrej213@gmail.com',
						Name: invitation.senderName,
					},
					To: [
						{
							Email: reciever.email,
							Name: `${reciever.firstName} ${reciever.lastName}`,
						},
					],
					ReplyTo: {
						// Email: 'kitanovicandrej213@gmail.com',
						Email: invitation.replyTo,
					},
					Subject: subject,
					HTMLPart: campaignEmail({ subject, content: personalizedContent, button }),
					CustomCampaign: campaignId,
				};
			}),
		});

		return result.Data;
	} catch (err) {
		console.log(err);
		return 'Error while sending!';
	}
};

exports.confirmEmail = async (user) => {
	try {
		const { body: result } = await mailjet.post('send', { version: 'v3.1' }).request({
			Messages: [
				{
					From: {
						Email: 'kitanovicandrej213@gmail.com',
						Name: 'Trustbucket IO',
					},
					To: [
						{
							Email: user.email,
							Name: `${user.firstName} ${user.lastName}`,
						},
					],
					Subject: 'Trustbucket Confirmation Email',
					HTMLPart: confirmEmail(user),
				},
			],
		});

		return result.Data;
	} catch (err) {
		console.log(err);
	}
};

exports.forgotPassword = async (user) => {
	try {
		const { body: result } = await mailjet.post('send', { version: 'v3.1' }).request({
			Messages: [
				{
					From: {
						Email: 'kitanovicandrej213@gmail.com',
						Name: 'Trustbucket IO',
					},
					To: [
						{
							Email: user.email,
							Name: `${user.firstName} ${user.lastName}`,
						},
					],
					Subject: 'Trustbucket Reset Password',
					HTMLPart: forgotPassword(user),
				},
			],
		});

		return result.Data;
	} catch (err) {
		console.log(err);
	}
};
