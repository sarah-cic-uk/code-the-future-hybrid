import type { Schema } from '../../data/resource';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient();

export const handler: Schema['notifyInterest']['functionHandler'] = async (event) => {
  const { name, email } = event.arguments;
  const from = process.env.FROM_EMAIL!;
  const to = process.env.ADMIN_EMAIL!;

  const safeName = name || 'Someone';
  const safeEmail = email || '(no email provided)';

  try {
    await ses.send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: `New course interest: ${safeName}` },
          Body: {
            Text: {
              Data:
                `${safeName} has registered interest in Code the Future.\n\n` +
                `Name: ${safeName}\n` +
                `Email: ${safeEmail}\n\n` +
                `They had no cohort code — invite them to a future cohort. ` +
                `You can also see all interest registrations in the admin dashboard.`,
            },
          },
        },
      })
    );
    return 'sent';
  } catch (err) {
    console.error('SES send failed:', err);
    // Don't fail the user's request just because the email didn't send
    return 'error';
  }
};
