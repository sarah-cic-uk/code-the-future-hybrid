import { defineFunction, secret } from '@aws-amplify/backend';

/**
 * Lambda that permanently deletes a student account from BOTH Cognito and the
 * DynamoDB User table. Gated by a shared password validated server-side here
 * (never shipped to the browser). USER_POOL_ID and USER_TABLE are injected
 * dynamically in backend.ts because they aren't compile-time constants.
 */
export const deleteStudent = defineFunction({
  name: 'delete-student',
  entry: './handler.ts',
  // Co-locate with the data stack: this function both resolves a data mutation
  // AND references the User table, which otherwise creates a circular dependency
  // between the data and function nested stacks.
  resourceGroupName: 'data',
  environment: {
    // Resolved from the Amplify secret store at deploy time and injected as an
    // env var at runtime — the password is never stored in this repo. The
    // secret named DELETE_PASSWORD must be set for each backend (sandbox via
    // `ampx sandbox secret set DELETE_PASSWORD`; cloud branches in the Amplify
    // console under Hosting → Secrets) or the deploy will fail.
    DELETE_PASSWORD: secret('DELETE_PASSWORD'),
  },
});
