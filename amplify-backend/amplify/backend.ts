import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { notifyAdmin } from './functions/notify-admin/resource';
import { bookingEmail } from './functions/booking-email/resource';
import { feedbackEmail } from './functions/feedback-email/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  notifyAdmin,
  bookingEmail,
  feedbackEmail,
});

// Allow the email Lambdas to send through SES
const sesPolicy = new PolicyStatement({
  actions: ['ses:SendEmail', 'ses:SendRawEmail'],
  resources: ['*'],
});
backend.notifyAdmin.resources.lambda.addToRolePolicy(sesPolicy);
backend.bookingEmail.resources.lambda.addToRolePolicy(sesPolicy);
backend.feedbackEmail.resources.lambda.addToRolePolicy(sesPolicy);

// The login page authenticates with USER_PASSWORD_AUTH (AWS SDK v2), so the
// user pool app client must allow that flow (plus SRP + refresh-token).
backend.auth.resources.cfnResources.cfnUserPoolClient.explicitAuthFlows = [
  'ALLOW_USER_PASSWORD_AUTH',
  'ALLOW_USER_SRP_AUTH',
  'ALLOW_REFRESH_TOKEN_AUTH',
];

// Made with Bob
