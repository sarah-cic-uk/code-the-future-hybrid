import { defineFunction } from '@aws-amplify/backend';

/**
 * Lambda that emails the site admin when someone registers interest.
 * Sends via Amazon SES. The FROM and ADMIN addresses must be verified
 * identities in SES (eu-west-2) — see backend.ts and the deploy notes.
 */
export const notifyAdmin = defineFunction({
  name: 'notify-admin',
  entry: './handler.ts',
  environment: {
    FROM_EMAIL: 'code.the.future.team@gmail.com',
    ADMIN_EMAIL: 'code.the.future.team@gmail.com',
  },
});
