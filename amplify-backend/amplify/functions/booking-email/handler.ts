import type { Schema } from '../../data/resource';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient();

/**
 * Sends 1:1 session emails via SES for every session event:
 *   booked            -> confirm to student + notify tutor
 *   cancelledBooked   -> notify student a booked session was cancelled
 *   cancelledRequest  -> notify student a requested session was cancelled
 *   requested         -> notify tutor a student requested a session
 */
export const handler: Schema['sendBookingEmail']['functionHandler'] = async (event) => {
  const { type, tutorEmail, tutorName, studentEmail, studentName, date, time, duration } = event.arguments;
  const from = process.env.FROM_EMAIL!;
  const kind = type || 'booked';

  const tutor = tutorName || 'your tutor';
  const student = studentName || 'the student';
  const when = `${date || ''}${time ? ' at ' + time : ''}${duration ? ' (' + duration + ')' : ''}`.trim();

  async function send(to: string | null | undefined, subject: string, text: string) {
    if (!to) return;
    try {
      await ses.send(
        new SendEmailCommand({
          Source: from,
          Destination: { ToAddresses: [to] },
          Message: { Subject: { Data: subject }, Body: { Text: { Data: text } } },
        })
      );
    } catch (err) {
      console.error('SES send failed for', to, err);
    }
  }

  const signoff = '\n\nBest wishes,\nThe Code the Future team';

  if (kind === 'booked') {
    await send(
      studentEmail,
      'Your Code the Future 1:1 session is booked',
      `Hi ${studentName || 'there'},\n\nYour 1:1 session with ${tutor} is confirmed for ${when}.\n\nSee you then!` + signoff
    );
    await send(
      tutorEmail,
      'New 1:1 session booked',
      `Hi ${tutorName || 'there'},\n\n${student} has booked a 1:1 session with you for ${when}.` + signoff
    );
  } else if (kind === 'cancelledBooked') {
    await send(
      studentEmail,
      'Your Code the Future 1:1 session was cancelled',
      `Hi ${studentName || 'there'},\n\nUnfortunately your booked 1:1 session for ${when} has been cancelled by ${tutor}.\n\n` +
        `Your tutor should be in touch to reschedule. You can also book another slot on the Schedule a 1:1 page.` + signoff
    );
  } else if (kind === 'cancelledRequest') {
    await send(
      studentEmail,
      'Your Code the Future 1:1 session request was cancelled',
      `Hi ${studentName || 'there'},\n\nYour requested 1:1 session for ${when} has been cancelled.\n\n` +
        `Feel free to request another time or book an available slot on the Schedule a 1:1 page.` + signoff
    );
  } else if (kind === 'requested') {
    await send(
      tutorEmail,
      'New 1:1 session request',
      `Hi ${tutorName || 'there'},\n\n${student} has requested a 1:1 session with you for ${when}.\n\n` +
        `Please log in to Tutor Availability to confirm or decline it.` + signoff
    );
  }

  return 'sent';
};
