import { defineFunction } from '@aws-amplify/backend';

/**
 * Lambda that emails the team when a student submits feedback.
 * Sends via Amazon SES. The FROM and ADMIN addresses must be verified
 * identities in SES (eu-west-2) — see backend.ts and the deploy notes.
 */
export const feedbackEmail = defineFunction({
  name: 'feedback-email',
  entry: './handler.ts',
  environment: {
    FROM_EMAIL: 'no-reply@codethefuture.uk',
    ADMIN_EMAIL: 'code.the.future.team@gmail.com',
  },
});
