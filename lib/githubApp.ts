// lib/githubApp.ts
import { App } from "@octokit/app";
import { request } from "@octokit/request";

export async function getInstallationToken(installationId: number) {
  const app = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    webhooks: {
      secret: process.env.GITHUB_WEBHOOK_SECRET!,
    },
  });

  const octokit = await app.getInstallationOctokit(Number(installationId));
  const authResult = await octokit.auth() as { token: string };
  return authResult.token;
}