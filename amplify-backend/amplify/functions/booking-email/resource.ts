import { defineFunction } from '@aws-amplify/backend';

/**
 * Lambda that emails BOTH the tutor and the student when a 1:1 session is booked.
 * Sends via Amazon SES. FROM must be a verified SES identity (eu-west-2);
 * in SES sandbox the recipients must also be verified until production access
 * is granted. See backend.ts and the deploy notes.
 */
export const bookingEmail = defineFunction({
  name: 'booking-email',
  entry: './handler.ts',
  environment: {
    FROM_EMAIL: 'no-reply@codethefuture.uk',
  },
});
