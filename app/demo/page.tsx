"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, GitPullRequest, MessageSquare, CheckCircle, AlertTriangle, Code } from "lucide-react"

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showComments, setShowComments] = useState(false)

  const demoSteps = ["Pull Request Created", "AI Analysis Started", "Code Review Generated", "Comments Posted"]

  const mockPRCode = `// src/components/UserForm.tsx
import React, { useState } from 'react'

export function UserForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Simple email validation
    if (email.includes('@')) {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        alert('User created successfully!')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Create User</button>
    </form>
  )
}`

  const aiComments = [
    {
      line: 8,
      severity: "high",
      comment:
        "🤖 **Security Issue**: Storing passwords in component state is not secure. Consider using a form library with proper password handling or avoid storing sensitive data in state.",
      type: "security",
    },
    {
      line: 12,
      severity: "medium",
      comment:
        "🤖 **Validation**: This email validation is too simplistic. Consider using a proper email validation library like `validator.js` or a regex pattern that covers edge cases.",
      type: "validation",
    },
    {
      line: 13,
      severity: "medium",
      comment:
        "🤖 **Error Handling**: Add proper error handling for the fetch request. Consider implementing try-catch blocks and user-friendly error messages.",
      type: "error-handling",
    },
    {
      line: 14,
      severity: "low",
      comment:
        "🤖 **Best Practice**: Add Content-Type header to the fetch request: `headers: { 'Content-Type': 'application/json' }`",
      type: "best-practice",
    },
  ]

  const runDemo = () => {
    setCurrentStep(0)
    setShowComments(false)

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= demoSteps.length - 1) {
          clearInterval(interval)
          setShowComments(true)
          return prev
        }
        return prev + 1
      })
    }, 1500)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">CodePullAI</h1>
            <Badge variant="secondary">Demo</Badge>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Live Demo</h2>
          <p className="text-slate-600">See how CodePullAI analyzes pull requests and provides AI-powered code reviews</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitPullRequest className="h-5 w-5" />
                <span>Demo Pull Request</span>
              </CardTitle>
              <CardDescription>Watch as our AI analyzes this sample pull request in real-time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">PR #42: Add user registration form</h3>
                <p className="text-sm text-slate-600 mb-3">
                  This pull request adds a new user registration form component with email and password fields.
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Badge variant="outline">+25 lines</Badge>
                  <Badge variant="outline">-3 lines</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                </div>
              </div>

              <Button onClick={runDemo} className="w-full" size="lg">
                <Bot className="h-4 w-4 mr-2" />
                Start AI Review Demo
              </Button>

              {/* Progress Steps */}
              <div className="space-y-2">
                {demoSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${index <= currentStep ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                        }`}
                    >
                      {index <= currentStep ? <CheckCircle className="h-3 w-3" /> : index + 1}
                    </div>
                    <span
                      className={`text-sm ${index <= currentStep ? "text-slate-900 font-medium" : "text-slate-500"}`}
                    >
                      {step}
                    </span>
                    {index === currentStep && index < demoSteps.length - 1 && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Code and Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Code Changes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="code" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="code">Code Diff</TabsTrigger>
                  <TabsTrigger value="comments" disabled={!showComments}>
                    AI Comments {showComments && `(${aiComments.length})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="code" className="mt-4">
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{mockPRCode}</pre>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-4">
                  {showComments ? (
                    <div className="space-y-4">
                      <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertDescription>
                          AI analysis complete! Found {aiComments.length} suggestions for improvement.
                        </AlertDescription>
                      </Alert>

                      {aiComments.map((comment, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(comment.severity)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                Line {comment.line}
                              </Badge>
                              <Badge
                                variant={comment.severity === "high" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {comment.severity} priority
                              </Badge>
                            </div>
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>AI comments will appear here after analysis</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Features Highlight */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
              <CardTitle className="text-lg">Security Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Identifies potential security vulnerabilities like password handling issues, SQL injection risks, and
                XSS vulnerabilities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-lg">Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Suggests improvements for code style, performance optimizations, and adherence to language-specific best
                practices.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Bot className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Intelligent Context</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Understands your codebase context and provides relevant, actionable feedback tailored to your specific
                use case.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
