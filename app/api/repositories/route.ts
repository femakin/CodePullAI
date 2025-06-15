import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'
import { Octokit } from "octokit"

export async function GET(request: NextRequest) {

  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()

  const { data: { session } } = await supabase.auth.getSession()  

  const github_token = session?.provider_token

  if (data.user?.aud !== "authenticated") {
    return NextResponse.json({ error: "Unauthenticated user" }, { status: 401 })
  }
  if (!github_token) {
    return NextResponse.json({ error: "Unauthorized user" }, { status: 401 })
  }

  try {

    // Fetch user's repositories from GitHub API
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=20", {
      headers: {
        Authorization: `Bearer ${github_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
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
      owner: repo.owner.login,
      webhook_enabled: false, // You'd check this against your database
    }))

    return NextResponse.json(transformedRepos)
  } catch (error) {
    console.error("Error fetching repositories:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {

  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()

  const { data: { session } } = await supabase.auth.getSession()  

  const github_token = session?.provider_token

  if (data.user?.aud !== "authenticated") {
    return NextResponse.json({ error: "Unauthenticated user" }, { status: 401 })
  }
  if (!github_token) {
    return NextResponse.json({ error: "Unauthorized user" }, { status: 401 })
  }

  const octokit = new Octokit({
    auth: github_token
  })
  try {
    const { repoId, action, repoName, repoOwner } = await request.json()

    console.log(repoId, action, repoName, repoOwner, "repoId, action")

    if (action === "enable_webhook") {
      // Create webhook on the repository
      
      const webhookResponse = await octokit.request(`POST /repos/${repoOwner}/${repoName}/hooks`, {
        owner: repoOwner,
        repo: repoName,
        name: 'web',
        active: true,
        events: [
          'pull_request'
        ],
        config: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`,
          content_type: 'json',
          insecure_ssl: '0'
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      // const webhookResponse = await fetch(`https://api.github.com/repos/${repoId}/hooks`, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${github_token}`,
      //     Accept: "application/vnd.github.v3+json",
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     name: "web",
      //     active: true,
      //     events: ["pull_request"],
      //     config: {
      //       url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`,
      //       content_type: "json",
      //       secret: process.env.WEBHOOK_SECRET,
      //     },
      //   }),
      // })

      console.log(webhookResponse, "webhookResponse")

      if (!webhookResponse.data) {
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
