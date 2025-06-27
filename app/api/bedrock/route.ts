import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({
    region: process.env.NEXT_AWS_REGION || 'eu-west-1',
    credentials: {
        accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();


        const requestBody = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4000,
            messages: [
                {
                    role: "user",
                    content: "You are an expert code reviewer. Always respond with valid JSON arrays only."
                },
                { role: "user", content: prompt }
            ],
        };

        const command = new InvokeModelCommand({
            modelId: 'arn:aws:bedrock:eu-west-1:501010171970:inference-profile/eu.anthropic.claude-sonnet-4-20250514-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(requestBody),
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        return NextResponse.json({
            success: true,
            data: responseBody,
        });
    } catch (error: any) {
        console.error('Bedrock API error:', error);

        // Check if it's a model validation error
        if (error.name === 'ValidationException' && error.message.includes('model identifier')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid model identifier. Please check the model ID or region availability.',
                    details: error.message
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to call Bedrock API',
                details: error.message
            },
            { status: 500 }
        );
    }
}