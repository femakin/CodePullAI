import { NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'
import { getInstallationToken, getGitHubInstallationAccessToken } from "@/lib/githubApp"
import { Octokit } from "octokit"
import { DynamoDBService } from "@/lib/dynamodb"

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized: User not logged in" }, { status: 401 })
  }

  try {


    const dbUser = await DynamoDBService.findUserByAuthId(user.id);

    if (!dbUser || !dbUser.installationId) {
      return NextResponse.json({ error: "GitHub App installation not found for this user." }, { status: 404 })
    }

    const installationId = dbUser.installationId

    const installationToken = await getInstallationToken(parseInt(installationId))

    const githubTken = await getGitHubInstallationAccessToken(installationId, installationToken)

    // console.log(githubTken, "githubTken")
    const octokit = new Octokit({ auth: githubTken.token })

    const { data: response } = await octokit.request('GET /installation/repositories', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    const repositories = response.repositories

    return NextResponse.json({ data: repositories }, { status: 200 })
  } catch (error) {
    console.error("Error fetching installation repositories:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}
