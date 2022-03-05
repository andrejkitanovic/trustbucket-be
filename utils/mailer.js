const mailjet = require('node-mailjet').connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

exports.sendEmail = async (template, recievers, campaignId) => {
	try {
		const { subject, content } = template;
		const { body: result } = await mailjet.post('send', { version: 'v3.1' }).request({
			Messages: recievers.map((reciever) => {
				let personalizedContent = content;
				personalizedContent = personalizedContent.replace('{firstName}', reciever.firstName);
				personalizedContent = personalizedContent.replace('{lastName}', reciever.lastName);
				personalizedContent = personalizedContent.replace('{email}', reciever.email);
				return {
					From: {
						// Email: 'noreply.invitations@trustbucket.io',
						Email: 'kitanovicandrej213@gmail.com',
						Name: 'Trustbucket IO',
					},
					To: [
						{
							Email: reciever.email,
							Name: `${reciever.firstname} ${reciever.lastname}`,
						},
					],
					Subject: subject,
					HTMLPart: personalizedContent,
					CustomCampaign: campaignId,
				};
			}),
		});

		return 'Successfully sent!';
	} catch (err) {
		console.log(err);

		return 'Error while sending!';
	}
};
