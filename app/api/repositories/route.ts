import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user's GitHub token from the session/database
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's repositories from GitHub API
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch repositories")
    }

    const repos = await response.json()

    // Transform the data to match our interface
    const transformedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      private: repo.private,
      webhook_enabled: false, // You'd check this against your database
    }))

    return NextResponse.json(transformedRepos)
  } catch (error) {
    console.error("Error fetching repositories:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { repoId, action } = await request.json()
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (action === "enable_webhook") {
      // Create webhook on the repository
      const webhookResponse = await fetch(`https://api.github.com/repos/${repoId}/hooks`, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "web",
          active: true,
          events: ["pull_request"],
          config: {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`,
            content_type: "json",
            secret: process.env.WEBHOOK_SECRET,
          },
        }),
      })

      if (!webhookResponse.ok) {
        throw new Error("Failed to create webhook")
      }

      return NextResponse.json({ success: true, message: "Webhook enabled" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error managing webhook:", error)
    return NextResponse.json({ error: "Failed to manage webhook" }, { status: 500 })
  }
}
