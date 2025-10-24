const sendEmail = require('./emailService');

async function testSendEmail() {
	const email = process.env.TEST_EMAIL || 'code.the.future.ibm@gmail.com';
	const subject = 'CTF: Test Email';
	const text = 'This is a plain text message.';
	const html = '<p>This is an <strong>HTML</strong> message.</p>';

	try {
		const result = await sendEmail(email, subject, text, html);

		if (result.success) {
			console.log('Email successfully sent:', result.info);
		} else {
			console.error('Email failed to send:', result.error);
		}
	} catch (error) {
		console.error('Unexpected error sending email:', error);
	}
}

testSendEmail();
