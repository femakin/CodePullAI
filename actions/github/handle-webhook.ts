import { App } from "@octokit/app";
import crypto from "crypto";

interface LambdaEvent {
  headers: { [name: string]: string };
  body: string;
}

// This is your AWS Lambda handler
export async function handler(event: LambdaEvent) {
  // 1. Verify the webhook signature
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const signature = event.headers["x-hub-signature-256"];
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(event.body).digest("hex");

  if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid signature" }),
    };
  }

  // 2. Parse the payload
  const payload = JSON.parse(event.body);
  const githubEvent = event.headers["x-github-event"];

  // 3. Handle a pull request event
  if (githubEvent === "pull_request" && payload.action === "opened") {
    const installationId = payload.installation.id;
    const repo = payload.repository.name;
    const owner = payload.repository.owner.login;
    const prNumber = payload.pull_request.number;

    try {
      // 4. Authenticate as the GitHub App installation
      const app = new App({
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
      });

      const octokit = await app.getInstallationOctokit(installationId);

      // 5. Use the installation token to post a comment
      await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
        owner,
        repo,
        issue_number: prNumber,
        body: "🎉 Thank you for opening this pull request! Our AI assistant will be with you shortly.",
        headers: {
          "x-github-api-version": "2022-11-28",
        },
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Comment posted successfully" }),
      };
    } catch (error) {
      console.error("Error processing webhook:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to process webhook" }),
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Webhook received, but no action taken" }),
  };
} 