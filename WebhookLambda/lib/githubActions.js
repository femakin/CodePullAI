// lib/githubApp.js
import { App } from "@octokit/app";
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export async function getInstallationToken(installationId) {
    const appId = process.env.GITHUB_APP_ID;
    const pk = process.env.GITHUB_APP_PRIVATE_KEY;
    const privateKey = atob(pk || "");

    if (!appId) {
        throw new Error("FATAL: GITHUB_APP_ID environment variable is not set.");
    }

    if (!privateKey) {
        throw new Error("FATAL: GITHUB_APP_PRIVATE_KEY environment variable is not set. Check your .env.local file or deployment settings.");
    }
    // --- End of Diagnostic Check ---

    const app = new App({
        appId,
        privateKey,
    });

    const octokit = await app.getInstallationOctokit(installationId);

    const installToken = await octokit.auth({ type: "app" });

    return installToken.token;
}

export async function getGitHubInstallationAccessToken(installationId, jwt) {
    const url = `https://api.github.com/app/installations/${installationId}/access_tokens`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${jwt}`,
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching token: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data; // Contains token, expires_at, etc.
}

export function parseDiff(diff) {
    // console.log("Parsing diff...", diff);
    const files = [];
    const fileBlocks = diff.split(/^diff --git /m).slice(1);
    for (const block of fileBlocks) {
        const lines = block.split("\n");
        const fileLine = lines[0];
        const filename = fileLine.split(" b/").pop()?.trim() || "unknown";
        const changes = [];
        for (const line of lines) {
            if (line.startsWith("+ ") || (line.startsWith("+") && !line.startsWith("+++"))) {
                changes.push({ type: "added", content: line.substring(1) });
            } else if (line.startsWith("- ") || (line.startsWith("-") && !line.startsWith("---"))) {
                changes.push({ type: "removed", content: line.substring(1) });
            }
        }
        files.push({ filename, changes });
    }
    /*  console.log("Parsed files:", files); */
    return files;
}

const client = new BedrockRuntimeClient({
    region: process.env.NEXT_AWS_REGION || 'eu-west-1',
    credentials: {
        accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
    },
});

export async function getAIReview(files, prTitle) {
    const prompt = `
You are an expert code reviewer. Analyze the following code changes from a pull request titled "${prTitle}".

Provide specific, actionable feedback focusing on:
1. Potential bugs or errors
2. Security vulnerabilities
3. Performance improvements
4. Code style and best practices
5. Maintainability concerns

Code changes:
${files.map(f => `File: ${f.filename}\n` +
        f.changes.map((c) =>
            `${c.type === "added" ? "+" : "-"} ${c.content}`
        ).join("\n")
    ).join("\n\n")}

IMPORTANT: Return ONLY a valid JSON array. Each object must have exactly these fields:
- "file": string (filename)
- "line": string (line content)
- "comment": string (your review comment)
- "severity": string ("low", "medium", or "high")

Example format:
[{"file":"example.js","line":"const x = 1","comment":"Consider using more descriptive variable names","severity":"low"}]
`;

    try {
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
            modelId: process.env.BEDROCK_MODEL_ID,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(requestBody),
        });

        const response = await client.send(command);

        if (!response.body) {
            throw new Error('Empty response body from Bedrock API');
        }

        const responseText = new TextDecoder().decode(response.body);
        // console.log('Response text length:', responseText.length);

        let responseBody;
        try {
            responseBody = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse Bedrock response as JSON:', parseError);
            console.error('Raw response text:', responseText);
            throw new Error(`Invalid JSON response from Bedrock API: ${parseError}`);
        }

        if (!responseBody.content || !Array.isArray(responseBody.content) || responseBody.content.length === 0) {
            console.error('Invalid response structure from Bedrock API:', responseBody);
            throw new Error('Invalid response structure from Bedrock API - missing content array');
        }

        const aiText = responseBody.content[0]?.text;
        if (!aiText) {
            console.error('No text content in Bedrock response:', responseBody);
            throw new Error('No text content in Bedrock API response');
        }

        // console.log('AI response text length:', aiText.length);
        return parseAIResponse(aiText);

    } catch (error) {
        // Handle specific types of errors
        if (error instanceof Error) {
            if (error.name === 'ThrottlingException') {
                console.error('Bedrock API throttling error:', error.message);
                throw new Error('API rate limit exceeded. Please try again later.');
            } else if (error.name === 'ValidationException') {
                console.error('Bedrock API validation error:', error.message);
                throw new Error('Invalid request format sent to AI service.');
            } else if (error.name === 'AccessDeniedException') {
                console.error('Bedrock API access denied:', error.message);
                throw new Error('Access denied to AI service. Check credentials.');
            } else if (error.name === 'ModelStreamErrorException') {
                console.error('Bedrock API model stream error:', error.message);
                throw new Error('AI model temporarily unavailable.');
            } else if (error.message.includes('fetch')) {
                console.error('Network error calling Bedrock API:', error.message);
                throw new Error('Network error connecting to AI service.');
            } else {
                console.error('Unexpected error in AI review:', error.message);
                throw new Error(`AI review failed: ${error.message}`);
            }
        } else {
            console.error('Unknown error type in AI review:', error);
            throw new Error('Unknown error occurred during AI review.');
        }
    }
}

export async function getAIReviewWithRetry(files, prTitle, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await getAIReview(files, prTitle);

            if (result.length > 0) {
                return result;
            } else {
                console.log(`AI review attempt ${attempt + 1} returned empty results`);
            }

            if (attempt < maxRetries) {
                console.log(`Attempt ${attempt + 1} returned empty results, retrying in ${1000 * (attempt + 1)}ms...`);
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`AI review attempt ${attempt + 1} failed:`, errorMessage);

            // Don't retry for certain types of errors
            if (error instanceof Error) {
                if (error.message.includes('Access denied') ||
                    error.message.includes('Invalid request format') ||
                    error.message.includes('Invalid JSON response') ||
                    error.message.includes('Invalid response structure')) {
                    console.error('Not retrying due to configuration/format error');
                    return [];
                }
            }

            if (attempt === maxRetries) {
                console.error(`All ${maxRetries + 1} AI review attempts failed for PR: "${prTitle}"`);
                return [];
            }

            // For other errors, continue with retry
            console.log(`Will retry in ${1000 * (attempt + 1)}ms...`);
        }
    }

    return [];
}

export async function postGitHubComment(commentsUrl, review, token) {
    try {
        const response = await fetch(commentsUrl, {
            method: "POST",
            headers: {
                Authorization: `token ${token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                body: `🤖 **AI Code Review** (${review.severity} priority)\n\n**File:** \`${review.file}\`\n**Line:** \`${review.line}\`\n\n${review.comment}`,
            }),
        })

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error posting GitHub comment:", error);
    }
}

export async function processReview(files, prTitle, commentsUrl, token) {
    try {
        // console.log(`Starting AI review process for PR: "${prTitle}" with ${files.length} files`);

        const aiReview = await getAIReviewWithRetry(files, prTitle);

        if (aiReview.length === 0) {
            console.log(`No AI review comments generated for PR: "${prTitle}"`);
            return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const review of aiReview) {
            try {
                await postGitHubComment(commentsUrl, review, token);
                successCount++;
                // console.log(`Successfully posted comment ${successCount}/${aiReview.length}`);
            } catch (error) {
                errorCount++;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Failed to post comment ${successCount + errorCount}/${aiReview.length}:`, errorMessage);
            }
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to process review for PR: "${prTitle}":`, errorMessage);
        throw error; // Re-throw to let the calling function handle it
    }
}

function parseAIResponse(content) {
    try {
        // Strategy 1: Direct JSON parse
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
            return validateAndCleanReviews(parsed);
        }
    } catch (error) {
        // Strategy 2: Extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                if (Array.isArray(parsed)) {
                    return validateAndCleanReviews(parsed);
                }
            } catch (e) {
                console.warn("Failed to parse JSON from code block");
            }
        }

        // Strategy 3: Find JSON array pattern in text
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            try {
                const parsed = JSON.parse(arrayMatch[0]);
                if (Array.isArray(parsed)) {
                    return validateAndCleanReviews(parsed);
                }
            } catch (e) {
                console.warn("Failed to parse extracted JSON array");
            }
        }

        // Strategy 4: Try to fix common JSON issues
        const fixedContent = fixCommonJsonIssues(content);
        try {
            const parsed = JSON.parse(fixedContent);
            if (Array.isArray(parsed)) {
                return validateAndCleanReviews(parsed);
            }
        } catch (e) {
            console.warn("Failed to parse fixed JSON");
        }

        // Strategy 5: Parse line by line if it looks like separate objects
        if (content.includes('{"file"')) {
            const objects = content.match(/\{"file"[^}]*\}/g);
            if (objects) {
                const validObjects = [];
                objects.forEach(obj => {
                    try {
                        const parsed = JSON.parse(obj);
                        if (isValidReviewComment(parsed)) {
                            validObjects.push(parsed);
                        }
                    } catch (e) {
                        // Skip invalid objects
                    }
                });
                return validObjects;
            }
        }
        console.warn("Could not parse AI response as JSON:", content);
        return [];
    }
    // Ensure a return in all code paths
    return [];
}

function fixCommonJsonIssues(content) {
    return content
        // Remove markdown formatting
        .replace(/```json\s*|\s*```/g, '')
        // Fix trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix single quotes to double quotes
        .replace(/'/g, '"')
        // Remove any text before the first [
        .replace(/^[^[]*/, '')
        // Remove any text after the last ]
        .replace(/[^\]]*$/, '');
}

function validateAndCleanReviews(reviews) {
    return reviews
        .filter(isValidReviewComment)
        .map(review => ({
            file: String(review.file || ''),
            line: String(review.line || ''),
            comment: String(review.comment || ''),
            severity: ['low', 'medium', 'high'].includes(review.severity)
                ? review.severity
                : 'medium'
        }));
}

function isValidReviewComment(obj) {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.file === 'string' &&
        typeof obj.line === 'string' &&
        typeof obj.comment === 'string' &&
        typeof obj.severity === 'string'
    );
}
