## Inspiration

Our inspiration for **CodePullAI** came from a challenge every developer faces: the code review bottleneck.

As developers, we know that thorough code reviews are essential for maintaining high-quality, secure, and performant code. However, they are also time-consuming, can be subjective, and often slow down the development cycle.

Witnessing the rapid advancements in generative AI and participating in the AWS Serverless Hackathon, we saw a perfect opportunity. We were inspired to build a tool that could serve as an intelligent, unbiased assistant for developers, leveraging the power of serverless technology and cutting-edge AI like Amazon Bedrock to make code reviews faster, smarter, and more consistent.

## What It Does

CodePullAI is an intelligent assistant that automates the code review process directly within GitHub.

When a developer creates or updates a pull request, CodePullAI springs into action:

1. 🔔 **Receives Real-Time Notifications**
Via a GitHub App, CodePullAI is instantly notified of changes in the repository.

2. 🧠 **Performs AI-Powered Analysis**
AWS Lambda processes the code diff and sends it to Amazon Bedrock via API, using the Claude model for deep contextual review.

3. 🛡️ **Provides Intelligent Feedback**

It identifies:
- Security vulnerabilities (XSS, injections)
- Performance issues
- Logical bugs
- Maintainability problems
- Best practice violations

4. 💬 **Posts In-line Comments**
It posts clear, contextual suggestions directly on the affected lines in the PR.

5. 🧪 **Manages Repositories**
A secure dashboard built with Next.js (authenticated via Supabase + GitHub OAuth) allows users to select which repositories the assistant should monitor.

## How We Built It

We designed CodePullAI with a serverless-first to ensure scalability and cost-efficiency.

1. 🔧 The Serverless Backend

Core services:

- GitHub Webhook ➝ Triggers when a PR is opened or updated

- Amazon API Gateway ➝ Receives the webhook securely

- AWS Lambda:

    Validates the request signature

    Uses GitHub API to fetch PR data and code diff

    Sends the prompt to Amazon Bedrock (Claude)

    Receives feedback and posts comments via GitHub API

2. 🖥️ Frontend & Authentication

    Built with Next.js, hosted on AWS Amplify

    Auth via Supabase GitHub OAuth for secure login and repo access

    Amazon DynamoDB used to store:

    User info

    Repository metadata


## Challenges We Ran Into

• **Complex Configuration**: GitHub App credentials, IAM policies, Supabase OAuth, and Lambda environment variables all needed careful syncing.

• **Webhook Debugging**: Serverless debugging is non-trivial. We leaned heavily on CloudWatch Logs to trace execution paths.

• **Prompt Engineering**: Effective feedback required precise prompt crafting to Claude, instructing it to behave like a real reviewer with defined categories (e.g., security, performance).

• **Security Management**:
  - Sensitive secrets (GitHub private key) were stored in Lambda securely and never exposed to the frontend.
  - Webhook signature validation ensured secure API Gateway invocation.

## Accomplishments That We’re Proud Of

1. ✅ A Fully Functional End-to-End System: **Git push ➝ AI code review ➝ GitHub PR comments**

2. ⚡ Pure Serverless Stack: No VMs, no containers — just Lambda, API Gateway, and DynamoDB

3. 🔒 Smooth GitHub OAuth via Supabase: Easy onboarding for developers

4. 🤖 Real, Actionable AI Integration: Generative AI that does useful work — not just a chatbot

## What We Learned

1. 🧩 Event-Driven Architecture: Real-world reactive systems are powerful and elegant

2. ☁️ Deep Dive into AWS Serverless Stack: From IAM to API Gateway to Lambda triggers

3. 🧠 Practical AI Integration: Effective use of Amazon Bedrock and Claude for real dev workflows

4. 🔗 Multi-Platform Integration: We became pros at stitching GitHub + AWS + Supabase together securely

## What's Next for CodePullAI

 -   🎛️ Customizable AI Reviewer
     Let users set preferences (e.g., strictness, security-focus, language standards)

 -   🧠 Deeper Code Context
    Analyze entire repo (not just diff) for more accurate insights

 -  🏢 Org & Team Support
    Manage PR settings and analytics across GitHub orgs

 -   ⚙️ Infrastructure-as-Code (IaC)
    One-click deployment via AWS CDK or Terraform

 -  🌍 More Platform Support
    Extend to GitLab, Bitbucket, and others
