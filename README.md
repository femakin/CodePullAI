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
│                    AWS Lambda Function                          │
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
- **AWS CLI** configured (for Lambda deployment)

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

<!-- 3. **Database Setup**: -->
   <!-- ```bash -->
 <!--   # npx prisma generate -->
   <!-- npx prisma db push -->
   <!-- ``` -->

### Step 4: GitHub App Setup

1. **Create GitHub App**:
   - Go to GitHub → Settings → Developer settings → GitHub Apps
   - Click "New GitHub App"
   - Fill in the details:
     - **App name**: `CodePullAI`
     - **Homepage URL**: `http://localhost:3000`
     - **Webhook URL**: `https://your-api-gateway-url.amazonaws.com/webhook`
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
     - `AWSLambdaBasicExecutionRole`

2. **Setup DynamoDB**:
   ```bash
   node scripts/setup-dynamodb.js
   ```

3. **Configure Amazon Bedrock**:
   - Go to Amazon Bedrock Console
   - Request access to Claude models
   - Note the model ID (e.g., `anthropic.claude-3-sonnet-20240229-v1:0`)

### Step 6: Lambda Function Setup

1. **Prepare Lambda Package**:
   ```bash
   cd WebhookLambda
   npm install
   npm run zip
   ```

2. **Create Lambda Function**:
   - Go to AWS Lambda Console
   - Click "Create function"
   - Choose "Author from scratch"
   - **Function name**: `CodePullAI-Webhook`
   - **Runtime**: Node.js 18.x
   - **Architecture**: x86_64
   - Click "Create function"

3. **Upload Code**:
   - In the Lambda function, go to "Code" tab
   - Click "Upload from" → ".zip file"
   - Upload the `webhook-lambda.zip` file

4. **Configure Environment Variables**:
   ```bash
   GITHUB_APP_ID=your_github_app_id
   GITHUB_APP_PRIVATE_KEY=your_github_app_private_key_base64
   GITHUB_WEBHOOK_SECRET=your_webhook_secret
   NEXT_AWS_REGION=us-east-1
   NEXT_AWS_ACCESS_KEY_ID=your_aws_access_key
   NEXT_AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   BEDROCK_MODEL_ID=your-model-id
   ```

5. **Set Function Timeout**:
   - Go to "Configuration" → "General configuration"
   - Set timeout to 30 seconds
   - Click "Save"

### Step 7: API Gateway Setup

1. **Create API Gateway**:
   - Go to API Gateway Console
   - Click "Create API"
   - Choose "REST API" → "Build"
   - **API name**: `CodePullAI-Webhook`
   - Click "Create API"

2. **Create Resource and Method**:
   - Click "Actions" → "Create Resource"
   - **Resource Name**: `webhook`
   - Click "Create Resource"
   - Click "Actions" → "Create Method"
   - Select "POST" → Click checkmark
   - **Integration type**: Lambda Function
   - **Lambda Function**: `CodePullAI-Webhook`
   - Click "Save"

3. **Deploy API**:
   - Click "Actions" → "Deploy API"
   - **Deployment stage**: `prod`
   - Click "Deploy"
   - Note the **Invoke URL** (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)

4. **Update GitHub App Webhook URL**:
   - Go back to your GitHub App settings
   - Update the webhook URL to: `https://your-api-gateway-url.amazonaws.com/prod/webhook`

### Step 8: Run the Application

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

### Webhook Flow (Lambda)

1. **PR Created/Updated** → GitHub sends webhook to API Gateway
2. **API Gateway** → Routes request to Lambda function
3. **Signature Validation** → Lambda verifies webhook authenticity
4. **Diff Fetching** → Lambda gets PR diff via GitHub API
5. **AI Analysis** → Lambda sends code changes to Amazon Bedrock
6. **Comment Posting** → Lambda posts AI review comments to GitHub PR

### Database Architecture

- **Frontend (Next.js)**: Uses Prisma with Supabase PostgreSQL for user authentication and session management
- **Lambda Function**: Uses DynamoDB directly via AWS SDK for any data storage needs
- **Separation**: The Lambda function is completely independent and doesn't require Prisma setup

### AI Review Process

The AI analyzes code for:
- **🔒 Security Issues**: SQL injection, XSS, authentication flaws
- **⚡ Performance**: Inefficient algorithms, memory leaks
- **📝 Best Practices**: Code style, naming conventions, patterns
- **🐛 Bug Detection**: Logic errors, edge cases, type issues
- **🔧 Maintainability**: Code complexity, documentation needs

## 🚀 Deployment



### AWS Amplify

1. **Deploy Frontend**:
   - Go to AWS Amplify Console
   - Connect your GitHub repository
   - Add environment variables
   - Update `NEXT_PUBLIC_APP_URL` to your Amplify domain

2. **Build Settings**:
   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - npm install --force
           build:
             commands:
               - env | grep -E "WEBHOOK_SECRET|GITHUB_WEBHOOK_SECRET|GITHUB_APP_ID|NEXT_AWS_ACCESS_KEY_ID|NEXT_AWS_SECRET_ACCESS_KEY|NEXT_AWS_REGION|BEDROCK_MODEL_ID|DATABASE_URL|DIRECT_URL|WEBHOOK_SECRET|GITHUB_APP_PRIVATE_KEY|NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_APP_URL" >> .env.production
               - npm run build
         artifacts:
           baseDirectory: .next
           files:
             - "**/*"
         cache:
           paths:
             - .next/cache/**/*
             - node_modules/**/*
   ```

### Option 3: Production Lambda Updates

For production updates to the Lambda function:

1. **Update Code**:
   ```bash
   cd WebhookLambda
   # Make your changes
   npm run zip
   ```

2. **Deploy to Lambda**:
   - Go to Lambda Console
   - Upload new zip file
   - Test the function

## 🧪 Testing

### Test Authentication

1. Start the development server
2. Navigate to `http://localhost:3000/auth`
3. Click "Connect with GitHub"
4. Complete the OAuth flow
5. Verify user appears in DynamoDB

### Test Lambda Webhook

1. **Test with Real PR**:
   - Create a test repository
   - Install your GitHub App on the repository
   - Create a pull request with some code changes
   - Check Lambda CloudWatch logs for processing
   - Verify AI comments appear on the PR

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

### Lambda Environment Variables

Ensure these are set in your Lambda function:

```bash
GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY=your_github_app_private_key_base64
GITHUB_WEBHOOK_SECRET=your_webhook_secret
NEXT_AWS_REGION=us-east-1
NEXT_AWS_ACCESS_KEY_ID=your_aws_access_key
NEXT_AWS_SECRET_ACCESS_KEY=your_aws_secret_key
BEDROCK_MODEL_ID=your-model-id
```

### Webhook Events

The Lambda function listens for these GitHub events:
- `pull_request.opened`
- `pull_request.synchronize`
- `pull_request.reopened`

### AI Model Configuration

You can customize the AI behavior by modifying the prompt in `WebhookLambda/lib/githubActions.js`:

```javascript
const prompt = `
You are an expert code reviewer. Analyze the following code changes...
// Customize this prompt for your specific needs
`;
```

### Rate Limiting

The Lambda function includes retry logic for AI API calls:
- Maximum 3 retry attempts
- Exponential backoff between retries
- Graceful handling of rate limits

## 🐛 Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**:
   - Check API Gateway URL is accessible
   - Verify webhook secret matches in Lambda
   - Check GitHub App permissions
   - Review Lambda CloudWatch logs

2. **Lambda Function Errors**:
   - Check CloudWatch logs for detailed error messages
   - Verify all environment variables are set
   - Ensure Lambda has proper IAM permissions
   - Check function timeout settings

3. **AI Review Not Working**:
   - Verify AWS credentials in Lambda
   - Check Bedrock model access
   - Review API rate limits
   - Check Lambda logs for AI API errors

4. **Authentication Issues**:
   - Verify Supabase configuration
   - Check GitHub OAuth settings
   - Ensure callback URLs match


### CloudWatch Monitoring

Monitor your Lambda function:
1. **Logs**: Check CloudWatch logs for errors
2. **Metrics**: Monitor invocation count, duration, errors
3. **Alarms**: Set up CloudWatch alarms for errors


### Cost Optimization

1. **Lambda**: Monitor execution time and memory usage
2. **Bedrock**: Track API calls and token usage
3. **DynamoDB**: Monitor read/write capacity
4. **API Gateway**: Track request count

## 🔒 Security Considerations

1. **Webhook Security**: Always validate GitHub signatures in Lambda
2. **API Keys**: Store secrets in Lambda environment variables
3. **Rate Limiting**: Implement proper rate limiting
4. **Access Control**: Use least privilege principle for AWS permissions
5. **Data Privacy**: Review what data is stored and processed
6. **VPC**: Consider running Lambda in VPC for additional security

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


## 🙏 Acknowledgments

- Built with ❤️ for the AWS Serverless Hackathon
- Powered by Amazon Bedrock and Claude AI
- Authentication by Supabase
- UI components by shadcn/ui

---

**Ready to automate your code reviews?** 🚀

Follow this guide step-by-step and you'll have a fully functional AI code review assistant running with serverless Lambda webhooks!
