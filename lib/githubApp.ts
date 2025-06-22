// lib/githubApp.ts
import { App } from "@octokit/app";
import { request } from "@octokit/request";

export async function getInstallationToken(installationId: number): Promise<string> {
  const appId = `1423048`;
  const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAtZG+6Agj9Cx/jZJ7MZ5s8HUG5lf/MnXYYWb6OdpSmaBDR0Q0
2hahBg8gHRDNz5xubbIY49HK7yW5JuHfEwVmNj/ZNrhckadrizSS9IFIjs2az5BD
JYVsXP91U4hZgn1NB2fqa8FEvUHl1SszcJpaq3l0LJd5Ym5n8XKifBL/QptWdELU
rYafyXnJdSgoi5+kVJdrbXaRJAv0puuvmMHJofz7i6zMXXyvzMnzQyZ0NWgISIBp
zw9rEIdLBUkIxlkJNqP4TqaL/b8YU32P+fkToKAQ7at3VGy4K/nvA5Bl+kmZ+DQX
0WVw2cXIy2MveWLyQn+O1OamFJufnlVQ2jYSPwIDAQABAoIBABq5Xu3r9M7FleiS
fMtq1AH4V5Gjtg4JRlXfwEivl6TA7+YXZegLmJu5sjJU/NXn4mEG657si//y/3N3
n0u/abHmZ+Qj8owFplCQ5mhSdwl9vaF7TEbDgpWVjAFFelc4dhP2+YvuoF1yy486
kpGqRloiwDSn/te8BFSHWN8GNMfqsUZBpwWp80qTgos9rkrn50dI1UhAkK2f+I05
mQiIV8Y+vVS6G1abFAzlC7NHvhIooM/bzN0gyhIg5P/Vq5xQHD/3T53htGx23OGF
FhcFu/cM3mk6ibVTFOI65EJn5hgG7JhHmM+tKxVf/+ktxQrpQdUFrJ/YacQruuQ1
jN8IsNECgYEA8dqpWjUpxZPJFEamcT4HkV27wPv0NhWFLtkqVgvlmRvTbYJSI0Cp
rEr/j/U7Rx0kuwqVzEMR22/2S4wdG/Wv2z1s6IpMffjAdksnil+2ohCx7TctlJZA
EjJRVEB8sXTYqfw6YCxcvsWq+h/H4v9DSadIFK95WGcaHoYaQilyej0CgYEAwDBs
6UOhI8Nj0dMLrkOcKAFPyaACrQ8KPqIDo3xefYat8fIDqZJG67pzKc+olEhwqJPw
9znHwpyc6Skp7DtN0NFdSh9LSms+Ze/eEt6TrmxKxtJwbo59DrfmUopHO0pxgTrD
SE3g+Oyw/JsAWvMVLq0rpl+uH4lfWKZq5+1kUisCgYEArg4cxRPvnQavtszlqifn
EGHx5oAtD+NK9x1JD6X+NcNF1NDuRfqaYamT5MmrQJGjxoxmpBs8tb0M9u++X0ng
ppq9T1mAlUQ5VqjdqwMZD+eN9Vc5kW7Ua4QU7dp/IsMhzqv8YwxqLs1ZMCtBEod8
qHwgLureHJYOwRrnuOfVQE0CgYBxNdViDwmD9Jv/RK+TxpXc5vDmF1CcOsjRHkTA
cAmFLemXJPXNVLJcN6eREJcASi+6zfLa3vlyBSlVG39rfX+YK0wl1otWWhgWmhaZ
zOz3iSj/N4UtStgV7HRLWNMe9PoposDX/bAxUdPr6S5rZNeseCvHRINgZl547Qb6
eddnowKBgQC9k0oaH9fWTDvnEzQBI+Mgcaj2tKCKprGytpNih4qtnFWXsYe8L+6A
blZV4zHMlKC3shHWmG+SlqpBWDIi1XG69U+dJelzpMg4HtMacZz2k8ZwRBCs6R29
J7WolOPCKqWQ2FaHTh6aHvaT9lEYN5QQDmj48LrsYBksBD7Z4d7VdA==
-----END RSA PRIVATE KEY-----`;

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