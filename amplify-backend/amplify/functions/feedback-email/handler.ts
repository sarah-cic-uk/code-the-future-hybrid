import type { Schema } from '../../data/resource';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient();

export const handler: Schema['sendFeedback']['functionHandler'] = async (event) => {
  const { category, lesson, message, userName, userEmail } = event.arguments;
  const from = process.env.FROM_EMAIL!;
  const to = process.env.ADMIN_EMAIL!;

  const safeName = userName || 'A student';
  const safeEmail = userEmail || '(not logged in)';
  const safeCategory = category || 'General';
  const lessonLine = lesson ? `Lesson / Session: ${lesson}\n` : '';

  const params: any = {
    Source: from,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: `New feedback (${safeCategory}) from ${safeName}` },
      Body: {
        Text: {
          Data:
            `New feedback was submitted on Code the Future.\n\n` +
            `From: ${safeName}\n` +
            `Email: ${safeEmail}\n` +
            `Category: ${safeCategory}\n` +
            lessonLine +
            `\nFeedback:\n${message || '(no message provided)'}\n`,
        },
      },
    },
  };

  // Let the team reply straight back to the student where we have their email.
  if (userEmail) params.ReplyToAddresses = [userEmail];

  try {
    await ses.send(new SendEmailCommand(params));
    return 'sent';
  } catch (err) {
    console.error('SES send failed:', err);
    // Don't fail the user's submission just because the email didn't send
    return 'error';
  }
};
