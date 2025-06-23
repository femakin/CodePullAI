// lib/githubApp.ts
import { App } from "@octokit/app";

export async function getInstallationToken(installationId: number): Promise<string> {
  const appId = process.env.GITHUB_APP_ID;
  const pk = process.env.GITHUB_APP_PRIVATE_KEY;
  const privateKey = atob(pk || "");

  if (!appId) {
    throw new Error("FATAL: GITHUB_APP_ID environment variable is not set.");
  }

  console.log(privateKey, "privateKey privateKey")
  if (!privateKey) {
    throw new Error("FATAL: GITHUB_APP_PRIVATE_KEY environment variable is not set. Check your .env.local file or deployment settings.");
  }
  // --- End of Diagnostic Check ---

  const app = new App({
    appId,
    privateKey,
  });

  const octokit = await app.getInstallationOctokit(installationId);

  const  installToken  = await octokit.auth({ type: "app" });
  
  //@ts-ignore
  return installToken.token;
}


export async function getGitHubInstallationAccessToken(installationId :string, jwt:string) {
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