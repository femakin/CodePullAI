import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
    region: process.env.NEXT_AWS_REGION || 'eu-west-1',
    credentials: {
        accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
    },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE || 'codepullai-users';

export interface User {
    id: string;
    email: string;
    authId: string;
    name?: string;
    imageUrl?: string;
    installationId?: string;
    createdAt: string;
}

export class DynamoDBService {
    // Find user by email
    static async findUserByEmail(email: string): Promise<User | null> {
        try {
            const command = new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: 'email-index', // You'll need to create this GSI
                KeyConditionExpression: 'email = :email',
                ExpressionAttributeValues: {
                    ':email': email,
                },
            });

            const response = await docClient.send(command);

            if (response.Items && response.Items.length > 0) {
                return response.Items[0] as User;
            }

            return null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    // Find user by authId
    static async findUserByAuthId(authId: string): Promise<User | null> {
        try {
            const command = new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    authId: authId,
                },
            });

            const response = await docClient.send(command);

            if (response.Item) {
                return response.Item as User;
            }

            return null;
        } catch (error) {
            console.error('Error finding user by authId:', error);
            throw error;
        }
    }

    // Create new user
    static async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
        try {
            const user: User = {
                ...userData,
                id: userData.authId, // Use authId as the primary key
                createdAt: new Date().toISOString(),
            };

            const command = new PutCommand({
                TableName: TABLE_NAME,
                Item: user,
                ConditionExpression: 'attribute_not_exists(authId)', // Prevent overwriting existing user
            });

            await docClient.send(command);
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Update user
    static async updateUser(authId: string, updates: Partial<User>): Promise<User | null> {
        try {
            const existingUser = await this.findUserByAuthId(authId);
            if (!existingUser) {
                return null;
            }

            const updatedUser: User = {
                ...existingUser,
                ...updates,
            };

            const command = new PutCommand({
                TableName: TABLE_NAME,
                Item: updatedUser,
            });

            await docClient.send(command);
            return updatedUser;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
}