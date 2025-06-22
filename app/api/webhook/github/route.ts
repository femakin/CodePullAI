import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getInstallationToken } from "@/lib/githubApp"

// This would be your webhook endpoint that GitHub calls
export async function POST(request: NextRequest) {
  // --- Webhook signature verification ---

  console.log("am here ")

  const signature = request.headers.get("x-hub-signature-256")
  const rawBody = await request.text()
  const secret = process.env.GITHUB_WEBHOOK_SECRET!


  const hmac = crypto.createHmac("sha256", secret)
  const digest = "sha256=" + hmac.update(rawBody).digest("hex")
  if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }
  // Parse JSON after signature check
  const payload = JSON.parse(rawBody)
  const event = request.headers.get("x-github-event")

  console.log("GitHub webhook received:", event, payload)

  // Handle pull request events
  if (event === "pull_request") {
    const action = payload.action
    const pullRequest = payload.pull_request
    const repository = payload.repository
    const installationId = payload.installation?.id
    // Only process opened, synchronize, or reopened PRs
    if (["opened", "synchronize", "reopened"].includes(action) && installationId) {
      // Trigger AI code review
      await processCodeReview({
        repo: repository.full_name,
        prNumber: pullRequest.number,
        prTitle: pullRequest.title,
        diffUrl: pullRequest.diff_url,
        commentsUrl: pullRequest.comments_url,
        installationId,
      })
    }
  }

  return NextResponse.json({ success: true })
}

async function processCodeReview(prData: {
  repo: string
  prNumber: number
  prTitle: string
  diffUrl: string
  commentsUrl: string
  installationId: number
}) {
  try {
    // Get installation token
    const token = await getInstallationToken(prData.installationId)
    // 1. Fetch the diff from GitHub
    const diffResponse = await fetch(prData.diffUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3.diff",
      },
    })

    const diff = await diffResponse.text()

    // 2. Parse the diff and extract code changes
    const codeChanges = parseDiff(diff)

    // 3. Send to AI for review
    const reviews = await generateAIReview(codeChanges, prData.prTitle)

    // 4. Post comments back to GitHub
    for (const review of reviews) {
      await postGitHubComment(prData.commentsUrl, review, token)
    }

    console.log(`AI review completed for PR #${prData.prNumber} in ${prData.repo}`)
  } catch (error) {
    console.error("Code review processing error:", error)
  }
}

function parseDiff(diff: string) {
  // Simple diff parsing - in production, use a proper diff parser
  const lines = diff.split("\n")
  const changes = []
  let currentFile = ""

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      currentFile = line.split(" ")[3]?.replace("b/", "") || ""
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      changes.push({
        file: currentFile,
        type: "addition",
        content: line.substring(1),
        line: line,
      })
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      changes.push({
        file: currentFile,
        type: "deletion",
        content: line.substring(1),
        line: line,
      })
    }
  }

  return changes
}

async function generateAIReview(codeChanges: any[], prTitle: string) {
  // This would integrate with OpenAI or Amazon Bedrock
  const prompt = `
You are an expert code reviewer. Analyze the following code changes from a pull request titled "${prTitle}".

Provide specific, actionable feedback focusing on:
1. Potential bugs or errors
2. Security vulnerabilities
3. Performance improvements
4. Code style and best practices
5. Maintainability concerns

Code changes:
${codeChanges.map((change) => `${change.file}: ${change.line}`).join("\n")}

Respond with a JSON array of review comments, each with:
- file: filename
- line: line content
- comment: your review comment
- severity: "low", "medium", or "high"
`

  try {
    // Mock AI response for demo
    const mockReviews = [
      {
        file: "src/components/UserForm.tsx",
        line: "+  const [password, setPassword] = useState('')",
        comment:
          "Consider using a more secure password handling approach. Avoid storing passwords in component state for security reasons.",
        severity: "high",
      },
      {
        file: "src/utils/api.ts",
        line: "+  const response = await fetch(url)",
        comment:
          "Add error handling for the fetch request. Consider implementing retry logic and proper error boundaries.",
        severity: "medium",
      },
      {
        file: "src/components/UserForm.tsx",
        line: "+  if (email.includes('@')) {",
        comment:
          "This email validation is too simplistic. Consider using a proper email validation library or regex pattern.",
        severity: "medium",
      },
    ]

    return mockReviews
  } catch (error) {
    console.error("AI review generation error:", error)
    return []
  }
}

async function postGitHubComment(commentsUrl: string, review: any, token: string) {
  try {
    const response = await fetch(commentsUrl, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: `🤖 **AI Code Review** (${review.severity} priority)\n\n**File:** \`${review.file}\`\n**Line:** \`${review.line}\`\n\n${review.comment}`,
      }),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    console.log("Comment posted successfully");
  } catch (error) {
    console.error("Error posting GitHub comment:", error);
  }
}
