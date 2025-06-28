# CodePullAI - AI Code Review Assistant (Powered by AWS Lambda and AWS API Gateway)

An intelligent, serverless AI Code Review assistant that performs automated code reviews on pull requests using AI. Built with **Amazon Bedrock, AWS Lambda, AWS API Gateway, AWS Amplify, AWS DynamoDB, Next.js and GitHub API**.

## 🚀 Features

- **Automated Code Reviews**: AI analyzes pull requests and provides intelligent feedback
- **GitHub Integration**: Seamless OAuth and webhook integration
- **Real-time Analysis**: Instant code review comments on PR creation/updates
- **Security Focus**: Identifies vulnerabilities and security issues
- **Best Practices**: Suggests improvements for code quality and performance
- **Multi-language Support**: Works with JavaScript, TypeScript, Python, and more

## 🏗️ Architecture


       ┌────────────────────┐
       │   Developer PR     │
       │   on GitHub Repo   │
       └────────┬───────────┘
                │ Webhook Event
                ▼
       ┌────────────────────┐
       │    GitHub Webhook  │
       └────────┬───────────┘
                ▼
       ┌────────────────────┐
       │  API Gateway       │
       │  /webhook endpoint │
       └────────┬───────────┘
                ▼
       ┌────────────────────────────────────────────┐
       │ 🧠 LAMBDA FUNCTION                          │
       │ - Validates GitHub Signature                │
       │ - Fetches PR Metadata + Code Diff           │
       │ - Stores/updates in DynamoDB                │
       │ - Sends code to Amazon Bedrock for Review   │
       │ - Formats Review                            │
       │ - Posts Comment via GitHub API              │
       └────────────┬────────────────────────────────┘
                    ▼
       ┌────────────────────────┐
       │ DynamoDB (Metadata DB) │
       └────────────────────────┘

       ┌────────────────────────────┐
       │ Amazon Bedrock             │
       │ (Claude Models)            │
       └────────────────────────────┘

       ┌────────────────────────┐
       │ GitHub API (PR Comment)│
       └────────────────────────┘

            Frontend Flow 

       ┌────────────────────────────┐
       │     Next.js Frontend       │
       │  (Hosted via Amplify)      │
       └────────────┬───────────────┘ 

### Tech Stack

- **Backend**: API Gateway, AWS Lambda integration
- **AI**: Amazon Bedrock (Claude)
- **Database**: DynamoDB
- **Deployment**: AWS Amplify (frontend) + AWS Lambda (serverless functions)
- **Integration**: GitHub API, GitHub OAuth, GitHub Webhooks
- **Frontend**: Next.js 15 with App Router, Tailwind CSS, shadcn/ui

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/femakin/CodePullAI.git
cd CodePullAI
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```
Required Environment Variables

- `GITHUB_TOKEN`: Personal Access Token with repo permissions
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: OAuth App credentials  
- `GITHUB_WEBHOOK_SECRET`: Secure webhook validation
- `GITHUB_APP_ID`: Secure GitHub App ID
- `NEXT_AWS_ACCESS_KEY_ID`: AWS access key for authentication
- `NEXT_AWS_SECRET_ACCESS_KEY`: AWS secret key for authentication
- `NEXT_AWS_REGION`: AWS region for services (e.g., us-east-1)
- `BEDROCK_MODEL_ID`: Amazon Bedrock model identifier for AI services
- `GITHUB_APP_PRIVATE_KEY`: Private key for GitHub App authentication
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL for database connection
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key for client-side access
- `NEXT_PUBLIC_APP_URL`: Your app's public URL

### 3. GitHub OAuth App Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - Homepage URL: `https://your-app-domain.com`
   - Authorization callback URL: `https://your-app-domain.com/auth/callback`

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔄 How It Works

### User Flow

1. **Connect GitHub**: User authorizes the app via OAuth
2. **Select Repositories**: Choose which repos to monitor
3. **Automatic Webhooks**: App installs webhooks on selected repos
4. **PR Analysis**: When PRs are created/updated, AI analyzes the code
5. **Intelligent Comments**: AI posts review comments directly to GitHub

### Technical Flow

1. **Webhook Trigger**: GitHub sends PR events to `/api/webhook/github`
2. **Diff Fetching**: Lambda fetches the PR diff via GitHub API
3. **AI Analysis**: Code changes sent to OpenAI/Bedrock for review
4. **Comment Posting**: AI feedback posted as PR comments via GitHub API

## 🤖 AI Prompting

The AI analyzes code for:

- **Security Issues**: SQL injection, XSS, authentication flaws
- **Performance**: Inefficient algorithms, memory leaks
- **Best Practices**: Code style, naming conventions, patterns
- **Bug Detection**: Logic errors, edge cases, type issues
- **Maintainability**: Code complexity, documentation needs

## 🚀 Deployment

### AWS Amplify Deployment

1. Connect your GitHub repo to AWS Amplify
2. Add environment variables in Amplify console under App Settings > Environment variables
3. Deploy automatically on push to main

### AWS Lambda Setup

For production webhook handling:

1. Create Lambda function with Node.js runtime
2. Set up API Gateway trigger
3. Configure environment variables
4. Deploy webhook handler code

## 🔧 Configuration

### Webhook Events

The app listens for these GitHub events:
- `pull_request.opened`
- `pull_request.synchronize`
- `pull_request.reopened`


### Testing

1. Create a test repository
2. Enable CodePullAI integration
3. Open a pull request
4. Verify AI comments appear


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- GitHub Issues: Report bugs and feature requests


---

Built with ❤️ for the AWS Serverless Hackathon
