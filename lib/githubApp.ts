// lib/githubApp.ts
import { App } from "@octokit/app";
import { request } from "@octokit/request";

export async function getInstallationToken(installationId: number): Promise<string> {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  // --- Diagnostic Check ---
  // This will throw a clear error if your environment variables are not set.
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
    webhooks: {
      secret: process.env.GITHUB_WEBHOOK_SECRET!,
    },
  });

  const octokit = await app.getInstallationOctokit(installationId);

  const { token } = (await octokit.auth({ type: "token" })) as { token:string };

  return token;
}