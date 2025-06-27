# DynamoDB Setup Guide

This guide explains how to set up DynamoDB to replace the existing Supabase/Prisma database for user management.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI configured with credentials
3. Node.js and npm installed

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# AWS Configuration
NEXT_AWS_REGION=us-east-1
NEXT_AWS_ACCESS_KEY_ID=your_access_key_id
NEXT_AWS_SECRET_ACCESS_KEY=your_secret_access_key

# DynamoDB Configuration
DYNAMODB_USERS_TABLE=users
```

## Setting up DynamoDB Table

### Option 1: Using the Setup Script

1. Run the setup script to create the DynamoDB table:

```bash
node scripts/setup-dynamodb.js
```

### Option 2: Using AWS Console

1. Go to the AWS DynamoDB Console
2. Click "Create table"
3. Use the following configuration:

**Table details:**
- Table name: `users` (or your preferred name)
- Partition key: `authId` (String)

**Table settings:**
- Choose "Customize settings"
- Capacity mode: "Provisioned"
- Provisioned capacity: 5 read capacity units, 5 write capacity units

**Indexes:**
- Add a Global Secondary Index:
  - Index name: `email-index`
  - Partition key: `email` (String)
  - Projection type: "All"

## Table Structure

The DynamoDB table will have the following structure:

- **Primary Key**: `authId` (String)
- **Global Secondary Index**: `email-index` with `email` as partition key
- **Attributes**:
  - `id` (String) - Same as authId
  - `email` (String) - User's email address
  - `authId` (String) - Supabase auth ID
  - `name` (String, optional) - User's display name
  - `imageUrl` (String, optional) - User's avatar URL
  - `installationId` (String, optional) - GitHub installation ID
  - `createdAt` (String) - ISO timestamp of user creation

## Code Changes Made

1. **Created `lib/dynamodb.ts`**: DynamoDB service class with methods for:
   - Finding users by email
   - Finding users by authId
   - Creating new users
   - Updating existing users

2. **Updated `app/auth-callback/callback/route.ts`**: Replaced Prisma operations with DynamoDB operations

3. **Added dependencies**: `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`

## Testing

After setup, test the authentication flow:

1. Start your development server
2. Navigate to the auth page
3. Complete the authentication process
4. Check the DynamoDB console to verify the user was created

## Migration from Existing Data

If you have existing user data in your current database, you'll need to create a migration script to transfer the data to DynamoDB. The migration script should:

1. Read all users from your current database
2. Transform the data to match the DynamoDB schema
3. Write each user to DynamoDB using the `DynamoDBService.createUser()` method

## Troubleshooting

### Common Issues

1. **Access Denied**: Ensure your AWS credentials have DynamoDB permissions
2. **Table Not Found**: Run the setup script or create the table manually
3. **Index Not Found**: Ensure the GSI `email-index` is created
4. **Region Mismatch**: Verify `NEXT_AWS_REGION` matches your DynamoDB table region

### Permissions Required

Your AWS user/role needs the following DynamoDB permissions:
- `dynamodb:CreateTable`
- `dynamodb:GetItem`
- `dynamodb:PutItem`
- `dynamodb:Query`
- `dynamodb:UpdateItem`
- `dynamodb:DeleteItem`

## Cost Considerations

DynamoDB pricing is based on:
- **Provisioned capacity**: Fixed cost per RCU/WCU
- **On-demand capacity**: Pay per request (recommended for development)
- **Storage**: Pay per GB stored
- **Data transfer**: Pay for data transferred out of AWS

For development, consider using on-demand capacity to avoid charges when not in use.