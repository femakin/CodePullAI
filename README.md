# CodePullAI - AI Code Review Assistant

An intelligent, serverless assistant that performs automated code reviews on pull requests using AI. Built with Next.js, AWS Lambda integration, and GitHub API.

## 🚀 Features

- **Automated Code Reviews**: AI analyzes pull requests and provides intelligent feedback
- **GitHub Integration**: Seamless OAuth and webhook integration
- **Real-time Analysis**: Instant code review comments on PR creation/updates
- **Security Focus**: Identifies vulnerabilities and security issues
- **Best Practices**: Suggests improvements for code quality and performance
- **Multi-language Support**: Works with JavaScript, TypeScript, Python, and more

## 🏗️ Architecture

\`\`\`
GitHub PR Event → Webhook → API Gateway → Lambda → AI Analysis → GitHub Comments
\`\`\`

### Tech Stack

- **Frontend**: Next.js 14 with App Router, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, AWS Lambda integration
- **AI**: OpenAI GPT-4 or Amazon Bedrock (Claude/Titan)
- **Integration**: GitHub API, GitHub OAuth, GitHub Webhooks
- **Deployment**: Vercel (frontend) + AWS Lambda (serverless functions)

## 🛠️ Setup Instructions

### 1. Clone and Install

\`\`\`bash
git clone https://github.com/yourusername/CodePullAI
cd CodePullAI
npm install
\`\`\`

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Required variables:
- `GITHUB_TOKEN`: Personal Access Token with repo permissions
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: OAuth App credentials
- `OPENAI_API_KEY`: For AI code analysis
- `WEBHOOK_SECRET`: Secure webhook validation
- `NEXT_PUBLIC_APP_URL`: Your app's public URL

### 3. GitHub OAuth App Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - Homepage URL: `https://your-app-domain.com`
   - Authorization callback URL: `https://your-app-domain.com/auth/callback`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

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

## 📁 Project Structure

\`\`\`
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/page.tsx         # GitHub OAuth
│   ├── dashboard/page.tsx    # Repository management
│   ├── demo/page.tsx         # Live demo
│   └── api/
│       ├── webhook/github/   # Webhook handler
│       └── repositories/     # Repo management API
├── components/ui/            # shadcn/ui components
├── lib/                      # Utilities
└── README.md
\`\`\`

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
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

### AI Model Configuration

Customize the AI prompts in `/app/api/webhook/github/route.ts`:

\`\`\`typescript
const prompt = `
You are an expert code reviewer. Focus on:
1. Security vulnerabilities
2. Performance issues
3. Best practices
4. Potential bugs
...
`
\`\`\`

## 🧪 Testing

### Run the Demo

Visit `/demo` to see a simulated code review process with sample PR data.

### Manual Testing

1. Create a test repository
2. Enable CodePullAI integration
3. Open a pull request
4. Verify AI comments appear

## 📊 Monitoring

- Check Vercel deployment logs for frontend issues
- Monitor AWS CloudWatch for Lambda function logs
- GitHub webhook delivery logs for debugging

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
- Documentation: Check the wiki for detailed guides
- Community: Join our Discord for discussions

---

Built with ❤️ for the AWS Serverless Hackathon
