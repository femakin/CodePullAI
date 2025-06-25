'use client'

import { useState } from 'react';

interface BedrockResponse {
    success: boolean;
    data?: {
        content: Array<{
            text: string;
            type: string;
        }>;
    };
    error?: string;
}

export default function BedrockChat() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setResponse('');

        try {
            const res = await fetch('/api/bedrock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data: BedrockResponse = await res.json();

            if (data.success && data.data) {
                setResponse(data.data.content[0]?.text || 'No response received');
            } else {
                setResponse(`Error: ${data.error}`);
            }
        } catch (error) {
            setResponse('Failed to get response from Bedrock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">AWS Bedrock Chat</h1>

            <form onSubmit={handleSubmit} className="mb-6">
                <div className="mb-4">
                    <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                        Your Prompt:
                    </label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md resize-none"
                        rows={4}
                        placeholder="Enter your prompt here..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'Generating...' : 'Send to Bedrock'}
                </button>
            </form>

            {response && (
                <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Response:</h3>
                    <div className="whitespace-pre-wrap">{response}</div>
                </div>
            )}
        </div>
    );
}