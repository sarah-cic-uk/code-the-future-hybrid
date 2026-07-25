import type { Schema } from '../../data/resource';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient();

// Human-readable section names, mirroring FORUM_SECTIONS in forum.html.
const SECTION_LABELS: Record<string, string> = {
  session1: 'Session 1',
  session2: 'Session 2',
  session3: 'Session 3',
  session4: 'Session 4',
  session5: 'Session 5',
  aiSession: 'AI Session',
  careersTech: 'Careers in Tech',
  lifeAtIBM: 'Life at IBM',
};

/**
 * Sends forum notification emails via SES.
 *   newQuestion -> one email to each tutor in `recipients`
 *   newAnswer   -> one email to the asker (single-element `recipients`)
 *   threadReply -> one email to each tutor who previously replied on the thread
 * Best-effort: individual send failures are logged, never thrown.
 */
export const handler: Schema['sendForumNotification']['functionHandler'] = async (event) => {
  const { type, recipients, questionTitle, section, askerName, authorName, bodyPreview } =
    event.arguments;
  const from = process.env.FROM_EMAIL!;
  const siteUrl = process.env.SITE_URL || 'https://codethefuture.uk';

  const to = (recipients || []).filter((r): r is string => !!r);
  if (!to.length) return 'sent';

  const sectionLabel = (section && SECTION_LABELS[section]) || 'the forum';
  const link = `${siteUrl}/pages/forum.html${section ? '#' + section : ''}`;
  const title = questionTitle || 'a question';
  const preview = bodyPreview ? `\n\n"${bodyPreview}"` : '';
  const signoff = '\n\nBest wishes,\nThe Code the Future team';

  async function send(recipient: string, subject: string, text: string, replyTo?: string | null) {
    try {
      const params: any = {
        Source: from,
        Destination: { ToAddresses: [recipient] },
        Message: { Subject: { Data: subject }, Body: { Text: { Data: text } } },
      };
      if (replyTo) params.ReplyToAddresses = [replyTo];
      await ses.send(new SendEmailCommand(params));
    } catch (err) {
      console.error('SES send failed for', recipient, err);
    }
  }

  if (type === 'newQuestion') {
    const asker = askerName || 'A student';
    const subject = `New forum question: "${title}"`;
    const text =
      `Hi there,\n\n` +
      `${asker} posted a new question in ${sectionLabel} on the Code the Future forum.\n\n` +
      `Question: ${title}${preview}\n\n` +
      `View it and reply here: ${link}` +
      signoff;
    // Notify each tutor individually so addresses aren't shared across the group.
    await Promise.all(to.map((tutor) => send(tutor, subject, text)));
  } else if (type === 'newAnswer') {
    const answerer = authorName || 'Someone';
    const subject = 'Your Code the Future forum question got an answer';
    const text =
      `Hi ${askerName || 'there'},\n\n` +
      `${answerer} answered your question in ${sectionLabel}.\n\n` +
      `Question: ${title}${preview}\n\n` +
      `Read the full answer here: ${link}` +
      signoff;
    await send(to[0], subject, text);
  } else if (type === 'threadReply') {
    const answerer = authorName || 'Someone';
    const subject = `New reply on a forum discussion you joined: "${title}"`;
    const text =
      `Hi there,\n\n` +
      `${answerer} posted a new reply on a discussion you're part of in ${sectionLabel}.\n\n` +
      `Question: ${title}${preview}\n\n` +
      `View the discussion here: ${link}` +
      signoff;
    // One email per participating tutor.
    await Promise.all(to.map((tutor) => send(tutor, subject, text)));
  }

  return 'sent';
};
