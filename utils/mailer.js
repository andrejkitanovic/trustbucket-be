const sg = require('@sendgrid/mail');
sg.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async (data) => {
	const msg = {
		to: 'kitanovicandrej213@gmail.com',
		from: 'andrej.kitanovic@boopro.tech',
		subject: 'Sending with SendGrid is Fun',
		text: 'and easy to do anywhere, even with Node.js',
		html: '<strong>and easy to do anywhere, even with Node.js</strong>',
	};

	return await sg.send(msg);
};
