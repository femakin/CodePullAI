const { DynamoDBClient, CreateTableCommand, CreateGlobalSecondaryIndexCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'eu-west-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE || 'codepullai-users';

async function createUsersTable() {
    try {
        const createTableCommand = new CreateTableCommand({
            TableName: TABLE_NAME,
            KeySchema: [
                { AttributeName: 'authId', KeyType: 'HASH' }, // Partition key
            ],
            AttributeDefinitions: [
                { AttributeName: 'authId', AttributeType: 'S' },
                { AttributeName: 'email', AttributeType: 'S' },
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'email-index',
                    KeySchema: [
                        { AttributeName: 'email', KeyType: 'HASH' },
                    ],
                    Projection: {
                        ProjectionType: 'ALL',
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 5,
                        WriteCapacityUnits: 5,
                    },
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
            },
        });

        console.log('Creating DynamoDB table...');
        await client.send(createTableCommand);
        console.log(`Table '${TABLE_NAME}' created successfully!`);

        console.log('\nTable structure:');
        console.log('- Primary Key: authId (String)');
        console.log('- GSI: email-index with email as partition key');
        console.log('- Attributes: id, email, authId, name, imageUrl, installationId, createdAt');

    } catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log(`Table '${TABLE_NAME}' already exists.`);
        } else {
            console.error('Error creating table:', error);
        }
    }
}

// Run the setup
createUsersTable();