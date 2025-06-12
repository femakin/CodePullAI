"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, Bot, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const router = useRouter()

  const handleGitHubConnect = async () => {
    setIsConnecting(true)

    // Simulate GitHub OAuth flow
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)

      // Simulate storing auth token
      localStorage.setItem("github_token", "mock_token_" + Date.now())
      localStorage.setItem(
        "github_user",
        JSON.stringify({
          login: "demo_user",
          name: "Demo User",
          avatar_url: "https://github.com/github.png",
        }),
      )

      // Redirect to dashboard after a moment
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">CodeSage</h1>
          </div>
          <p className="text-slate-600">Connect your GitHub account to get started</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Github className="h-5 w-5" />
              <span>GitHub Integration</span>
            </CardTitle>
            <CardDescription>
              Authorize CodeSage to access your repositories and create webhooks for automated code reviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Read repository information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Create webhooks for pull requests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Post review comments</span>
                  </div>
                </div>

                <Button onClick={handleGitHubConnect} disabled={isConnecting} className="w-full" size="lg">
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Github className="h-4 w-4 mr-2" />
                      Connect with GitHub
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Successfully connected to GitHub! Redirecting to dashboard...</AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-slate-500 text-center">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => router.push("/")}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
