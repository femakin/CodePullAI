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

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [activities, setActivities] = useState<ReviewActivity[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated

    // fetch("/api/repositories")
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (data.error) {
    //       console.log(data.error, "error")
    //     } else {
    //       setRepositories(data)
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err, "err")
    //   })


      fetch("/api/repositories/installed")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error, "error")
        } else {
          // setRepositories(data)

          console.log(data, "data")
        }
      })
      .catch((err) => {
        console.log(err, "err")
      })



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
                {/* <div className="space-y-4">
                  {repositories?.map((repo) => (
                    <RespositoryCard key={repo.id} repo={repo} toggleWebhook={toggleWebhook} />  
                  ))}
                </div> */}

<Link
  href="https://github.com/apps/codepullai/installations/new"
  target="_blank"
  rel="noopener noreferrer"
>
  <Button size="lg" className="w-full">
    Install GitHub App
  </Button>
</Link>

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
  )
}
