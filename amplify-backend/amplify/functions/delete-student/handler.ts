import type { Schema } from '../../data/resource';
import {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const cognito = new CognitoIdentityProviderClient();
const dynamo = new DynamoDBClient();

/**
 * Deletes a student from Cognito (by email = username) and from the DynamoDB
 * User table (by id). Returns:
 *   'deleted'      - removed (or already absent) from both stores
 *   'unauthorized' - password did not match; nothing was touched
 *   'error'        - unexpected failure
 */
export const handler: Schema['deleteStudent']['functionHandler'] = async (event) => {
  const { email, userId, password } = event.arguments;

  if (!password || password !== process.env.DELETE_PASSWORD) {
    return 'unauthorized';
  }
  if (!email || !userId) {
    return 'error';
  }

  const userPoolId = process.env.USER_POOL_ID!;
  const userTable = process.env.USER_TABLE!;

  try {
    // 1. Delete the Cognito account (username is the email address).
    try {
      await cognito.send(
        new AdminDeleteUserCommand({ UserPoolId: userPoolId, Username: email })
      );
    } catch (err: any) {
      // If the Cognito account is already gone, still clean up the DB row.
      if (err?.name !== 'UserNotFoundException') throw err;
      console.warn(`Cognito user not found for ${email}; deleting DB row only.`);
    }

    // 2. Delete the DynamoDB User record (partition key is the model's UUID id).
    await dynamo.send(
      new DeleteItemCommand({
        TableName: userTable,
        Key: { id: { S: userId } },
      })
    );

    return 'deleted';
  } catch (err) {
    console.error('Failed to delete student:', err);
    return 'error';
  }
};
