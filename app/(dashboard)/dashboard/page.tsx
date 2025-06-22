"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Github, GitBranch, Activity, CheckCircle, Clock, AlertTriangle, User, PlusCircle, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import RespositoryCard from "@/components/RespositoryCard"
import Link from "next/link"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  private: boolean
  owner: string
  webhook_enabled: boolean
}

interface ReviewActivity {
  id: string
  repo: string
  pr_number: number
  pr_title: string
  status: "completed" | "in_progress" | "failed"
  comments_count: number
  timestamp: string
}

// A new component for the empty state
function InstallAppCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Your Repositories</CardTitle>
        <CardDescription>
          Install our GitHub App to begin analyzing your code. You'll be able to select which repositories you want us to access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={`https://github.com/apps/codepullai/installations/new`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg" className="w-full">
            <Github className="h-5 w-5 mr-2" />
            Install GitHub App
          </Button>
        </Link>
        <p className="text-xs text-slate-500 mt-4 text-center">
          You will be redirected to GitHub to complete the installation.
        </p>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [activities, setActivities] = useState<ReviewActivity[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [userData, setUserData] = useState<any>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      try {
        // Fetch repositories
        const reposResponse = await fetch("/api/repositories/installed")
        if (!reposResponse.ok) {
          throw new Error('Failed to fetch repositories')
        }
        const reposData = await reposResponse.json()
        if (reposData.data) {
          setRepositories(reposData.data)
        }

        // Fetch user data
        const userResponse = await fetch("/api/user")
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data')
        }
        const userData = await userResponse.json()
        if (userData.data) {
          setUserData(userData.data)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setRepositories([]) // Clear repositories on error
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const toggleWebhook = async (repoId: number) => {
    setRepositories((repos) =>
      repos.map((repo) => (repo.id === repoId ? { ...repo, webhook_enabled: !repo.webhook_enabled } : repo)),
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back!</h2>
        <p className="text-slate-600">Manage your repositories and review AI-powered code analysis.</p>
      </div>

      <Tabs defaultValue="repositories" className="space-y-6">
        {/* <TabsList>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList> */}

        <TabsContent value="repositories" className="space-y-6">
          {repositories.length > 0 ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Github className="h-5 w-5" />
                    <span>Connected Repositories</span>
                  </CardTitle>
                  <CardDescription>
                    AI code reviews are active for the repositories below.
                  </CardDescription>
                </div>
                <Link
                  href={userData?.installationId ? `https://github.com/settings/installations/${userData.installationId}` : "https://github.com/apps/codepullai/installations/new"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add / Configure Repositories
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {repositories.map((repo) => (
                    <RespositoryCard installationID={userData?.installationId} key={repo.id} repo={repo} toggleWebhook={toggleWebhook} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <InstallAppCard />
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Reviews</span>
              </CardTitle>
              <CardDescription>Latest AI code review activities across your repositories.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(activity.status)}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">#{activity.pr_number}</h3>
                          <span className="text-sm text-slate-600">{activity.pr_title}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <GitBranch className="h-3 w-3" />
                          <span>{activity.repo}</span>
                          <span>•</span>
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {activity.comments_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {activity.comments_count} comments
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        View PR
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert className="mt-6">
        <Bot className="h-4 w-4" />
        <AlertDescription>
          When you add a repository, CodeSage will automatically analyze all new pull requests. You can manage repository access at any time via your GitHub settings.
        </AlertDescription>
      </Alert>
    </div>
  )
}
