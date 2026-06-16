# Firebase to AWS Migration Scripts

This directory contains scripts to migrate data from Firebase to AWS.

## Prerequisites

1. **Firebase Admin SDK credentials**
   - Download `serviceAccountKey.json` from Firebase Console
   - Place in this directory (DO NOT commit to git)

2. **AWS Credentials**
   - Configure AWS CLI: `aws configure`
   - Set region to `eu-west-2` (London)

3. **Install Dependencies**
   ```bash
   npm install firebase-admin @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-cognito-identity-provider @aws-sdk/client-s3
   ```

## Migration Steps

### Step 1: Export Firebase Data
```bash
node 1-export-firebase-data.js
```
This exports all data from Firebase to `./export/` directory.

### Step 2: Transform Data for AWS
```bash
node 2-transform-data.js
```
This transforms Firebase data structure to AWS DynamoDB format.

### Step 3: Create AWS Resources
```bash
node 3-create-aws-resources.js
```
This creates DynamoDB tables, Cognito User Pool, and S3 buckets.

### Step 4: Import to DynamoDB
```bash
node 4-import-to-dynamodb.js
```
This imports transformed data into DynamoDB tables.

### Step 5: Migrate Users to Cognito
```bash
node 5-migrate-cognito-users.js
```
This creates users in Cognito (users will need to reset passwords).

### Step 6: Migrate Storage Files
```bash
bash 6-migrate-storage.sh
```
This copies files from Firebase Storage to S3.

## Important Notes

- **Backup**: All exported data is saved in `./export/` directory
- **Passwords**: Cannot migrate passwords from Firebase to Cognito - users must reset
- **Testing**: Test with a small dataset first before full migration
- **Rollback**: Keep Firebase data until AWS migration is confirmed working

## Directory Structure

```
migration-scripts/
├── README.md
├── package.json
├── 1-export-firebase-data.js
├── 2-transform-data.js
├── 3-create-aws-resources.js
├── 4-import-to-dynamodb.js
├── 5-migrate-cognito-users.js
├── 6-migrate-storage.sh
├── serviceAccountKey.json (DO NOT COMMIT)
└── export/
    ├── users.json
    ├── cohorts.json
    ├── sessionRequests.json
    ├── dynamodb-users.json
    ├── dynamodb-cohorts.json
    └── ...

cd migration-scripts
npm install
cp .env.example .env
# Add your Firebase serviceAccountKey.json
# Update .env with AWS credentials

# Run migration in order:
npm run export          # Export from Firebase
npm run transform       # Transform data
npm run create-aws      # Create AWS resources
npm run import-db       # Import to DynamoDB
npm run migrate-users   # Migrate to Cognito
npm run migrate-storage # Copy to S3
