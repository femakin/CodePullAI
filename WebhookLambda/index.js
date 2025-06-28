import crypto from 'crypto'
import { getGitHubInstallationAccessToken, getInstallationToken, parseDiff, processReview } from './lib/githubActions.js'

export const handler = async (event, context) => {

    try {
        // --- Webhook signature verification ---
        const signature = event.headers["X-Hub-Signature-256"];
        const rawBody = event.body; // Use the raw string body, not parsed JSON
        const secret = process.env.GITHUB_WEBHOOK_SECRET;

        if (!secret) {
            console.error("GITHUB_WEBHOOK_SECRET not configured");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Webhook secret not configured" })
            };
        }

        const hmac = crypto.createHmac("sha256", secret);
        const digest = "sha256=" + hmac.update(rawBody, 'utf8').digest("hex");

        if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
            console.error("Invalid signature - Expected:", digest, "Received:", signature);
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Invalid signature" })
            };
        }

        // Parse JSON after signature verification
        const payload = JSON.parse(rawBody);

        const eventType = event.headers["X-GitHub-Event"];

        // Handle pull request events
        if (eventType === "pull_request") {
            const action = payload.action;
            const pullRequest = payload.pull_request;
            const repository = payload.repository;
            const installationId = payload.installation?.id;

            console.log(`Processing PR ${action} event for ${repository.full_name}#${pullRequest.number}`);

            // Only process opened, synchronize, or reopened PRs
            if (["opened", "synchronize", "reopened"].includes(action) && installationId) {
                // Trigger AI code review
                await processCodeReview({
                    repo: repository.full_name,
                    prNumber: pullRequest.number,
                    prTitle: pullRequest.title,
                    diffUrl: pullRequest.diff_url,
                    commentsUrl: pullRequest.comments_url,
                    installationId,
                });
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };

    } catch (error) {
        console.error("Lambda handler error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" })
        };
    }
};

async function processCodeReview(prData) {
    try {
        // Get installation token
        const installationToken = await getInstallationToken(prData.installationId);

        const githubToken = await getGitHubInstallationAccessToken(prData.installationId.toString(), installationToken);

        // 1. Fetch the diff from GitHub using the API
        const [owner, repo] = prData.repo.split('/');
        const diffResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prData.prNumber}`, {
            headers: {
                Authorization: `token ${githubToken.token}`,
                Accept: "application/vnd.github.v3.diff",
            },
        });

        if (!diffResponse.ok) {
            console.error(`Failed to fetch diff: ${diffResponse.status} ${diffResponse.statusText}`);
            return;
        }

        const diff = await diffResponse.text();

        // 2. Parse the diff and extract code changes
        const codeChanges = parseDiff(diff);

        if (codeChanges.length === 0) {
            return;
        }

        // 3. Send to AI for review
        await processReview(codeChanges, prData.prTitle, prData.commentsUrl, githubToken.token);

        console.log(`AI review completed for PR #${prData.prNumber} in ${prData.repo}`);

    } catch (error) {
        console.error("Code review processing error:", error);
    }
}


