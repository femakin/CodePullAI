import { NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'
import { prisma } from "@/lib/prisma"
import { getInstallationToken, getGitHubInstallationAccessToken } from "@/lib/githubApp"
import { Octokit } from "octokit"
import { getAIReview, parseDiff } from "@/actions/github/handle-webhook"

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized: User not logged in" }, { status: 401 })
  }

  try {
    const dbUser = await prisma.users.findUnique({
      where: { authId: user.id },
    })

    if (!dbUser || !dbUser.installationId) {
      return NextResponse.json({ error: "GitHub App installation not found for this user." }, { status: 404 })
    }

    const installationId = dbUser.installationId

    const installationToken = await getInstallationToken(parseInt(installationId))
  
    const githubTken =  await getGitHubInstallationAccessToken(installationId, installationToken)

    const octokit = new Octokit({ auth: githubTken.token })




    fetch("https://github.com/jaymeeu/accomodate_with_xata/pull/2.diff",{
      headers: {
        Authorization: `Bearer ${githubTken.token}`,
        Accept: "application/vnd.github.v3.diff",
      },
    })
    .then(response => {
      if (!response.ok) {
        console.error('Error:', response);
      }
      return response.text();
    })
    .then(async(diff) => {
      console.log(diff);

      const files = parseDiff(diff);
      // 3. Send code to AI for review
      const aiReview = await getAIReview(files, "to main");
      // For now, just log the AI review
      console.log("AI Review:", aiReview);

    })
    .catch(error => {
      console.error('Error:', error);

    })


    



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
