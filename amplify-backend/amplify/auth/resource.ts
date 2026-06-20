import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * Note: Keeping configuration minimal because Cognito User Pool
 * attributes cannot be modified after creation. User display names
 * will be stored in the DynamoDB User table instead.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // No userAttributes - store additional user data in DynamoDB instead
});
