import { defineFunction } from '@aws-amplify/backend';

/**
 * Lambda that emails forum participants via Amazon SES:
 *   newQuestion -> notify every tutor that a student posted a question
 *   newAnswer   -> notify the asker that their question got an answer
 * The FROM address must be a verified identity in SES (eu-west-2)
 * — see backend.ts and the deploy notes.
 */
export const forumEmail = defineFunction({
  name: 'forum-email',
  entry: './handler.ts',
  environment: {
    FROM_EMAIL: 'no-reply@codethefuture.uk',
    SITE_URL: 'https://codethefuture.uk',
  },
});
