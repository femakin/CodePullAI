import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getGitHubInstallationAccessToken, getInstallationToken } from "@/lib/githubApp"
import { parseDiff, processReview } from "@/actions/github/handle-webhook"

// This would be your webhook endpoint that GitHub calls
export async function POST(request: NextRequest) {
  // --- Webhook signature verification ---

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
    const installationToken = await getInstallationToken(prData.installationId)

    const githubTken = await getGitHubInstallationAccessToken(prData.installationId.toString(), installationToken)

    // console.log(githubTken.token, 'githubTken')

    // 1. Fetch the diff from GitHub using the API
    const [owner, repo] = prData.repo.split('/')
    // console.log(owner, repo, 'owner and repo')
    const diffResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prData.prNumber}`, {
      headers: {
        Authorization: `token ${githubTken.token}`,
        Accept: "application/vnd.github.v3.diff",
      },
    })

    // console.log(diffResponse, 'diffResponse')

    if (!diffResponse.ok) {
      console.error(`Failed to fetch diff: ${diffResponse.status} ${diffResponse.statusText}`)
      return
    }

    const diff = await diffResponse.text()

    // console.log(diff, 'diff----------')

    // 2. Parse the diff and extract code changes
    const codeChanges = parseDiff(diff)

    // console.log(codeChanges, 'codechanges')
    if (codeChanges.length === 0) {
      return
    }

    // 3. Send to AI for review
    await processReview(codeChanges, prData.prTitle, prData.commentsUrl, githubTken.token)

    console.log(`AI review completed for PR #${prData.prNumber} in ${prData.repo}`)

  } catch (error) {
    console.error("Code review processing error:", error)
  }
}


