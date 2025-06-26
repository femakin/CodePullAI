"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Bot, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import LoginGithub from "@/components/LoginGithub"


export default function AuthPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">CodePullAI</h1>
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
              Authorize CodePullAI to access your repositories and create webhooks for automated code reviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <LoginGithub />
            </>

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
