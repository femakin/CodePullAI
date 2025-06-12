"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Github, GitBranch, Settings, Activity, CheckCircle, Clock, AlertTriangle, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  private: boolean
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

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [activities, setActivities] = useState<ReviewActivity[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("github_token")
    const userData = localStorage.getItem("github_user")

    if (!token || !userData) {
      router.push("/auth")
      return
    }

    setUser(JSON.parse(userData))

    // Mock data for repositories
    setRepositories([
      {
        id: 1,
        name: "my-web-app",
        full_name: "demo_user/my-web-app",
        description: "A React web application with TypeScript",
        language: "TypeScript",
        private: false,
        webhook_enabled: true,
      },
      {
        id: 2,
        name: "api-server",
        full_name: "demo_user/api-server",
        description: "Node.js REST API with Express",
        language: "JavaScript",
        private: true,
        webhook_enabled: false,
      },
      {
        id: 3,
        name: "mobile-app",
        full_name: "demo_user/mobile-app",
        description: "React Native mobile application",
        language: "TypeScript",
        private: false,
        webhook_enabled: true,
      },
    ])

    // Mock data for recent activities
    setActivities([
      {
        id: "1",
        repo: "my-web-app",
        pr_number: 42,
        pr_title: "Add user authentication",
        status: "completed",
        comments_count: 3,
        timestamp: "2 hours ago",
      },
      {
        id: "2",
        repo: "api-server",
        pr_number: 15,
        pr_title: "Implement rate limiting",
        status: "in_progress",
        comments_count: 0,
        timestamp: "5 hours ago",
      },
      {
        id: "3",
        repo: "my-web-app",
        pr_number: 41,
        pr_title: "Fix responsive design issues",
        status: "completed",
        comments_count: 5,
        timestamp: "1 day ago",
      },
    ])

    setLoading(false)
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">CodeSage</h1>
            </div>
            <Badge variant="secondary">Dashboard</Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back!</h2>
          <p className="text-slate-600">Manage your repositories and review AI-powered code analysis.</p>
        </div>

        <Tabs defaultValue="repositories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="repositories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Github className="h-5 w-5" />
                  <span>Connected Repositories</span>
                </CardTitle>
                <CardDescription>Enable AI code reviews for your repositories by toggling the webhook.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {repositories.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{repo.name}</h3>
                          {repo.private && (
                            <Badge variant="secondary" className="text-xs">
                              Private
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {repo.language}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{repo.description}</p>
                        <p className="text-xs text-slate-500">{repo.full_name}</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-600">AI Reviews</span>
                          <Switch checked={repo.webhook_enabled} onCheckedChange={() => toggleWebhook(repo.id)} />
                        </div>
                        {repo.webhook_enabled && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                When you enable AI reviews for a repository, CodeSage will automatically analyze all new pull requests
                and provide intelligent feedback.
              </AlertDescription>
            </Alert>
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
      </div>
    </div>
  )
}
