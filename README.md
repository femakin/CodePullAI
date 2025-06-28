# CodePullAI - AI-Powered Code Review Assistant

An intelligent, serverless AI Code Review assistant that automatically analyzes pull requests and provides intelligent feedback using Amazon Bedrock. Built with **AWS Lambda, API Gateway, DynamoDB, Supabase Auth, Next.js, and GitHub API**.

## 🚀 Features

- **⚡ Serverless Architecture**: Scalable and cost-effective AWS infrastructure
- **🤖 AI-Powered Reviews**: Automated code analysis using Amazon Bedrock (Claude)
- **🔐 Secure Authentication**: GitHub OAuth integration via Supabase
- **📊 Real-time Analysis**: Instant code review comments on PR creation/updates
- **🛡️ Security Focus**: Identifies vulnerabilities and security issues
- **📈 Best Practices**: Suggests improvements for code quality and performance
- **🌐 Multi-language Support**: Works with JavaScript, TypeScript, Python, and more


## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  GitHub Webhook │───▶│  API Gateway    │
│   (PR Created)  │    │   (Event)       │    │  /webhook       │
└─────────────────┘    └─────────────────┘    └────────┬────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Route                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Validate GitHub Signature                            │   │
│  │ 2. Fetch PR Diff via GitHub API                         │   │
│  │ 3. Send to Amazon Bedrock for AI Analysis               │   │
│  │ 4. Post Review Comments back to GitHub                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DynamoDB      │◀───│  Amazon Bedrock │◀───│  GitHub API     │
│  (User Data)    │    │  (Claude AI)    │    │  (PR Comments)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Flow                               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  Next.js App    │───▶│  Supabase Auth  │───▶│  Dashboard  │ │
│  │  (Hosted)       │    │  (GitHub OAuth) │    │  (Repos)    │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and **npm** installed
- **GitHub Account** with repository access
- **AWS Account** with appropriate permissions
- **Supabase Account** for authentication
- **GitHub App** (we'll create this)

## 📋 Complete Setup Guide

### Step 1: Clone and Install

```bash
git clone https://github.com/femakin/CodePullAI.git
cd CodePullAI
npm install
```

### Step 2: Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration (Authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key


# GitHub App Configuration
GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY=your_github_app_private_key_base64
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# AWS Configuration
NEXT_AWS_REGION=us-east-1
NEXT_AWS_ACCESS_KEY_ID=your_aws_access_key
NEXT_AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Amazon Bedrock Configuration
BEDROCK_MODEL_ID=your-model-id

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

```

### Step 3: Supabase Setup (Authentication)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure GitHub OAuth**:
   - In Supabase Dashboard → Authentication → Providers
   - Enable GitHub provider
   - Add your GitHub OAuth credentials (we'll create these next)

3. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Step 4: GitHub App Setup

1. **Create GitHub App**:
   - Go to GitHub → Settings → Developer settings → GitHub Apps
   - Click "New GitHub App"
   - Fill in the details:
     - **App name**: `CodePullAI`
     - **Homepage URL**: `http://localhost:3000`
     - **Webhook URL**: `http://localhost:3000/api/webhook/github`
     - **Webhook secret**: Generate a secure random string

2. **Configure Permissions**:
   - **Repository permissions**:
     - `Contents`: Read
     - `Metadata`: Read
     - `Pull requests`: Read & Write
   - **Subscribe to events**:
     - `Pull request`

3. **Install App**:
   - After creating, install the app on your repositories
   - Note the `installation_id` from the URL

4. **Generate Private Key**:
   - In your GitHub App settings → Private keys
   - Generate a new private key
   - Download and convert to base64:
   ```bash
   base64 -i your-private-key.pem
   ```

### Step 5: AWS Setup

1. **Create IAM User**:
   - Go to AWS IAM Console
   - Create a new user with programmatic access
   - Attach policies for:
     - `AmazonBedrockFullAccess`
     - `AmazonDynamoDBFullAccess`

2. **Setup DynamoDB**:
   ```bash
   node scripts/setup-dynamodb.js
   ```

3. **Configure Amazon Bedrock**:
   - Go to Amazon Bedrock Console
   - Request access to Claude models
   - Note the model ID (e.g., `anthropic.claude-3-sonnet-20240229-v1:0`)

### Step 6: Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔄 How It Works

### Authentication Flow

1. **User visits `/auth`** → Clicks "Connect with GitHub"
2. **Supabase OAuth** → Redirects to GitHub for authorization
3. **GitHub callback** → User redirected back with installation ID
4. **User creation** → User data stored in DynamoDB with installation ID
5. **Dashboard access** → User can now manage repositories

### Webhook Flow

1. **PR Created/Updated** → GitHub sends webhook to `/api/webhook/github`
2. **Signature Validation** → Verify webhook authenticity
3. **Diff Fetching** → Get PR diff via GitHub API
4. **AI Analysis** → Send code changes to Amazon Bedrock
5. **Comment Posting** → Post AI review comments to GitHub PR

### AI Review Process

The AI analyzes code for:
- **🔒 Security Issues**: SQL injection, XSS, authentication flaws
- **⚡ Performance**: Inefficient algorithms, memory leaks
- **📝 Best Practices**: Code style, naming conventions, patterns
- **🐛 Bug Detection**: Logic errors, edge cases, type issues
- **🔧 Maintainability**: Code complexity, documentation needs

## 🚀 Deployment

### Option 1: Vercel Deployment

1. **Connect Repository**:
   - Push code to GitHub
   - Connect to Vercel
   - Add environment variables in Vercel dashboard

2. **Update Webhook URL**:
   - Update GitHub App webhook URL to your Vercel domain
   - Update `NEXT_PUBLIC_APP_URL` in environment variables

### Option 2: AWS Amplify

1. **Connect Repository**:
   - Go to AWS Amplify Console
   - Connect your GitHub repository
   - Add environment variables

2. **Build Settings**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
           - npx prisma generate
       build:
         commands:
           - npm run build
   ```

### Option 3: Production Lambda (Optional)

For high-traffic scenarios, deploy the webhook handler as a separate Lambda:

1. **Package Lambda**:
   ```bash
   cd WebhookLambda
   npm install
   npm run zip
   ```

2. **Deploy to AWS Lambda**:
   - Create Lambda function
   - Upload the zip file
   - Configure API Gateway trigger
   - Update GitHub webhook URL

## 🧪 Testing

### Test Authentication

1. Start the development server
2. Navigate to `http://localhost:3000/auth`
3. Click "Connect with GitHub"
4. Complete the OAuth flow
5. Verify user appears in DynamoDB

### Test Webhook

1. Create a test repository
2. Install your GitHub App on the repository
3. Create a pull request with some code changes
4. Check the application logs for webhook processing
5. Verify AI comments appear on the PR

### Test AI Review

1. Create a PR with intentional issues:
   ```javascript
   // Bad code for testing
   var x = 1;
   if(x == "1") {
     console.log("This is bad");
   }
   ```

2. Check that AI identifies:
   - Use of `var` instead of `const/let`
   - Loose equality (`==`) instead of strict equality (`===`)
   - Missing semicolons

## 🔧 Configuration

### Webhook Events

The app listens for these GitHub events:
- `pull_request.opened`
- `pull_request.synchronize`
- `pull_request.reopened`

### AI Model Configuration

You can customize the AI behavior by modifying the prompt in `actions/github/handle-webhook.ts`:

```typescript
const prompt = `
You are an expert code reviewer. Analyze the following code changes...
// Customize this prompt for your specific needs
`;
```

### Rate Limiting

The application includes retry logic for AI API calls:
- Maximum 3 retry attempts
- Exponential backoff between retries
- Graceful handling of rate limits

## 🐛 Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**:
   - Check webhook URL is accessible
   - Verify webhook secret matches
   - Check GitHub App permissions

2. **AI Review Not Working**:
   - Verify AWS credentials
   - Check Bedrock model access
   - Review API rate limits

3. **Authentication Issues**:
   - Verify Supabase configuration
   - Check GitHub OAuth settings
   - Ensure callback URLs match

4. **Database Errors**:
   - Run Prisma migrations
   - Check DynamoDB table exists
   - Verify AWS permissions

### Debug Mode

Enable debug logging by adding to your environment:

```bash
DEBUG=* npm run dev
```

## 📊 Monitoring

### Logs to Monitor

1. **Webhook Processing**: Check for successful PR analysis
2. **AI API Calls**: Monitor Bedrock API usage and costs
3. **Authentication**: Track user sign-ups and installations
4. **Error Rates**: Monitor failed webhook deliveries

### Metrics to Track

- Number of PRs analyzed per day
- Average AI response time
- User engagement (repositories connected)
- Error rates by component

## 🔒 Security Considerations

1. **Webhook Security**: Always validate GitHub signatures
2. **API Keys**: Store secrets in environment variables
3. **Rate Limiting**: Implement proper rate limiting
4. **Access Control**: Use least privilege principle for AWS permissions
5. **Data Privacy**: Review what data is stored and processed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/femakin/CodePullAI/issues)
- **Documentation**: Check the [DYNAMODB_SETUP.md](DYNAMODB_SETUP.md) for additional setup details

## 🙏 Acknowledgments

- Built with ❤️ for the AWS Serverless Hackathon
- Powered by Amazon Bedrock and Claude AI
- Authentication by Supabase
- UI components by shadcn/ui

---

**Ready to automate your code reviews?** 🚀

Follow this guide step-by-step and you'll have a fully functional AI code review assistant running in no time!
