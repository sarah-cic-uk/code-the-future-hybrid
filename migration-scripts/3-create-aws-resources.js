/**
 * Step 3: Create AWS Resources
 * 
 * This script creates all necessary AWS resources:
 * - DynamoDB tables
 * - Cognito User Pool
 * - S3 buckets
 * 
 * Prerequisites:
 * - AWS CLI configured with credentials
 * - Appropriate IAM permissions
 * 
 * Usage: node 3-create-aws-resources.js
 */

require('dotenv').config();
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { 
  CognitoIdentityProviderClient, 
  CreateUserPoolCommand,
  CreateUserPoolClientCommand,
  CreateGroupCommand,
  DescribeUserPoolCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const { S3Client, CreateBucketCommand, PutBucketPolicyCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

const region = process.env.AWS_REGION || 'eu-west-2';

const dynamoClient = new DynamoDBClient({ region });
const cognitoClient = new CognitoIdentityProviderClient({ region });
const s3Client = new S3Client({ region });

// DynamoDB Table Definitions
const tables = [
  {
    TableName: 'CodeTheFuture-Users',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
      { AttributeName: 'cohortId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      },
      {
        IndexName: 'CohortIndex',
        KeySchema: [{ AttributeName: 'cohortId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'CodeTheFuture-Cohorts',
    KeySchema: [
      { AttributeName: 'cohortId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'cohortId', AttributeType: 'S' },
      { AttributeName: 'cohortCode', AttributeType: 'S' },
      { AttributeName: 'teacherId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'CohortCodeIndex',
        KeySchema: [{ AttributeName: 'cohortCode', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      },
      {
        IndexName: 'TeacherIndex',
        KeySchema: [{ AttributeName: 'teacherId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'CodeTheFuture-TutorAvailability',
    KeySchema: [
      { AttributeName: 'tutorId', KeyType: 'HASH' },
      { AttributeName: 'slotId', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'tutorId', AttributeType: 'S' },
      { AttributeName: 'slotId', AttributeType: 'S' },
      { AttributeName: 'date', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'DateIndex',
        KeySchema: [
          { AttributeName: 'tutorId', KeyType: 'HASH' },
          { AttributeName: 'date', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'CodeTheFuture-BookedSessions',
    KeySchema: [
      { AttributeName: 'sessionId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'sessionId', AttributeType: 'S' },
      { AttributeName: 'tutorId', AttributeType: 'S' },
      { AttributeName: 'studentEmail', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'TutorIndex',
        KeySchema: [{ AttributeName: 'tutorId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      },
      {
        IndexName: 'StudentIndex',
        KeySchema: [{ AttributeName: 'studentEmail', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'CodeTheFuture-SessionRequests',
    KeySchema: [
      { AttributeName: 'requestId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'requestId', AttributeType: 'S' },
      { AttributeName: 'tutorId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'TutorIndex',
        KeySchema: [{ AttributeName: 'tutorId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
];

async function createDynamoDBTables() {
  console.log('📦 Creating DynamoDB tables...\n');

  for (const tableConfig of tables) {
    try {
      // Check if table already exists
      try {
        await dynamoClient.send(new DescribeTableCommand({ TableName: tableConfig.TableName }));
        console.log(`⏭️  Table ${tableConfig.TableName} already exists, skipping...`);
        continue;
      } catch (error) {
        if (error.name !== 'ResourceNotFoundException') {
          throw error;
        }
      }

      // Create table
      const command = new CreateTableCommand(tableConfig);
      await dynamoClient.send(command);
      console.log(`✅ Created table: ${tableConfig.TableName}`);
    } catch (error) {
      console.error(`❌ Error creating table ${tableConfig.TableName}:`, error.message);
    }
  }

  console.log('\n✨ DynamoDB tables creation complete!\n');
}

async function createCognitoUserPool() {
  console.log('👤 Creating Cognito User Pool...\n');

  try {
    const createPoolCommand = new CreateUserPoolCommand({
      PoolName: 'CodeTheFutureUserPool',
      Policies: {
        PasswordPolicy: {
          MinimumLength: 8,
          RequireUppercase: true,
          RequireLowercase: true,
          RequireNumbers: true,
          RequireSymbols: false
        }
      },
      AutoVerifiedAttributes: ['email'],
      UsernameAttributes: ['email'],
      Schema: [
        {
          Name: 'email',
          Required: true,
          Mutable: false,
          AttributeDataType: 'String'
        },
        {
          Name: 'name',
          Required: true,
          Mutable: true,
          AttributeDataType: 'String'
        }
      ],
      UserAttributeUpdateSettings: {
        AttributesRequireVerificationBeforeUpdate: ['email']
      }
    });

    const poolResponse = await cognitoClient.send(createPoolCommand);
    const userPoolId = poolResponse.UserPool.Id;
    console.log(`✅ Created User Pool: ${userPoolId}`);

    // Create User Pool Client
    const createClientCommand = new CreateUserPoolClientCommand({
      UserPoolId: userPoolId,
      ClientName: 'CodeTheFutureWebApp',
      ExplicitAuthFlows: [
        'ALLOW_USER_PASSWORD_AUTH',
        'ALLOW_REFRESH_TOKEN_AUTH',
        'ALLOW_USER_SRP_AUTH'
      ],
      PreventUserExistenceErrors: 'ENABLED'
    });

    const clientResponse = await cognitoClient.send(createClientCommand);
    const clientId = clientResponse.UserPoolClient.ClientId;
    console.log(`✅ Created User Pool Client: ${clientId}`);

    // Create Groups
    const groups = ['Students', 'Teachers', 'Tutors'];
    for (const groupName of groups) {
      try {
        const createGroupCommand = new CreateGroupCommand({
          GroupName: groupName,
          UserPoolId: userPoolId,
          Description: `${groupName} group for Code the Future`
        });
        await cognitoClient.send(createGroupCommand);
        console.log(`✅ Created group: ${groupName}`);
      } catch (error) {
        if (error.name !== 'GroupExistsException') {
          console.error(`❌ Error creating group ${groupName}:`, error.message);
        }
      }
    }

    console.log('\n📝 IMPORTANT: Save these values to your .env file:');
    console.log(`COGNITO_USER_POOL_ID=${userPoolId}`);
    console.log(`COGNITO_CLIENT_ID=${clientId}`);

  } catch (error) {
    if (error.name === 'UsernameExistsException') {
      console.log('⏭️  User Pool already exists, skipping...');
    } else {
      console.error('❌ Error creating Cognito User Pool:', error.message);
    }
  }

  console.log('\n✨ Cognito User Pool creation complete!\n');
}

async function createS3Buckets() {
  console.log('🪣 Creating S3 buckets...\n');

  const buckets = [
    {
      name: 'code-the-future-storage',
      policy: {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: 'arn:aws:s3:::code-the-future-storage/media/*'
          }
        ]
      }
    },
    {
      name: 'code-the-future-website',
      policy: null // Will be configured for static website hosting separately
    }
  ];

  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucket.name }));
        console.log(`⏭️  Bucket ${bucket.name} already exists, skipping...`);
        continue;
      } catch (error) {
        if (error.name !== 'NotFound') {
          throw error;
        }
      }

      // Create bucket
      const createCommand = new CreateBucketCommand({
        Bucket: bucket.name,
        CreateBucketConfiguration: {
          LocationConstraint: region
        }
      });
      await s3Client.send(createCommand);
      console.log(`✅ Created bucket: ${bucket.name}`);

      // Apply bucket policy if specified
      if (bucket.policy) {
        const policyCommand = new PutBucketPolicyCommand({
          Bucket: bucket.name,
          Policy: JSON.stringify(bucket.policy)
        });
        await s3Client.send(policyCommand);
        console.log(`✅ Applied policy to bucket: ${bucket.name}`);
      }

    } catch (error) {
      console.error(`❌ Error creating bucket ${bucket.name}:`, error.message);
    }
  }

  console.log('\n✨ S3 buckets creation complete!\n');
}

async function createAllResources() {
  console.log('🚀 Starting AWS resource creation...\n');
  console.log(`📍 Region: ${region}\n`);

  try {
    await createDynamoDBTables();
    await createCognitoUserPool();
    await createS3Buckets();

    console.log('✨ All AWS resources created successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file with the Cognito values printed above');
    console.log('2. Run: node 4-import-to-dynamodb.js');

  } catch (error) {
    console.error('❌ Error creating AWS resources:', error);
    process.exit(1);
  }
}

// Run resource creation
createAllResources();

// Made with Bob
