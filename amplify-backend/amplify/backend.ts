import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { notifyAdmin } from './functions/notify-admin/resource';
import { bookingEmail } from './functions/booking-email/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  notifyAdmin,
  bookingEmail,
});

// Allow the email Lambdas to send through SES
const sesPolicy = new PolicyStatement({
  actions: ['ses:SendEmail', 'ses:SendRawEmail'],
  resources: ['*'],
});
backend.notifyAdmin.resources.lambda.addToRolePolicy(sesPolicy);
backend.bookingEmail.resources.lambda.addToRolePolicy(sesPolicy);

// Made with Bob
