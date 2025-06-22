import { NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'
import { prisma } from "@/lib/prisma"
import { getInstallationToken } from "@/lib/githubApp"
import { Octokit } from "octokit"

export async function GET() {
  const supabase = await createClient()

  // 1. Get the current user from Supabase Auth
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized: User not logged in" }, { status: 401 })
  }

  try {
    // 2. Get the user's installation ID from your database
    const dbUser = await prisma.users.findUnique({
      where: { authId: user.id },
    })

    if (!dbUser || !dbUser.installationId) {
      return NextResponse.json({ error: "GitHub App installation not found for this user." }, { status: 404 })
    }

    // 3. Generate an installation access token
    const installationId = parseInt(dbUser.installationId)

    console.log(installationId, "installationId"
      
    )

    const installationToken = await getInstallationToken(installationId)

  
    // 4. Use the installation token to call the GitHub API
    const octokit = new Octokit({ auth: installationToken })

    const { data: response } = await octokit.request('GET /installation/repositories', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    
    // The response contains a list of repositories for the installation
    const repositories = response.repositories

    return NextResponse.json({ data: repositories }, { status: 200 })
  } catch (error) {
    console.error("Error fetching installation repositories:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}
