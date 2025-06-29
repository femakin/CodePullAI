import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, GitPullRequest, Bot, Zap, Shield, Code } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">CodePullAI</h1>
          </div>
          <Link href="/auth">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          AI-Powered Code Reviews
        </Badge>
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          Automatically Review Your
          <span className="text-blue-600"> Pull Requests</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Connect your GitHub repositories and let our AI assistant provide intelligent, instant code reviews on every
          pull request. Catch bugs, improve code quality, and learn best practices.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8">
              Connect GitHub
            </Button>
          </Link>


          <Link href="https://youtu.be/1kUNkZaaulk" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="text-lg px-8">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <GitPullRequest className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>1. Open Pull Request</CardTitle>
              <CardDescription>Create a pull request in your connected GitHub repository</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Our webhook automatically detects when you open or update a pull request</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Bot className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>2. AI Analysis</CardTitle>
              <CardDescription>Advanced AI analyzes your code changes in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Our AI reviews code for bugs, security issues, performance, and best practices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>3. Instant Feedback</CardTitle>
              <CardDescription>Receive detailed comments directly in your pull request</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Get actionable suggestions and improvements posted as inline comments</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CodePullAI?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Instant Reviews</h3>
              <p className="text-slate-600 text-sm">Get feedback in seconds, not hours</p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Security Focus</h3>
              <p className="text-slate-600 text-sm">Identify vulnerabilities early</p>
            </div>
            <div className="text-center">
              <Code className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Best Practices</h3>
              <p className="text-slate-600 text-sm">Learn from AI-powered suggestions</p>
            </div>
            <div className="text-center">
              <Bot className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Always Available</h3>
              <p className="text-slate-600 text-sm">24/7 automated code reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Code Quality?</h2>
        <p className="text-xl text-slate-600 mb-8">Join thousands of developers using AI-powered code reviews</p>
        <Link href="/auth">
          <Button size="lg" className="text-lg px-8">
            Start Free Trial
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-6 w-6" />
            <span className="text-lg font-semibold">CodePullAI</span>
          </div>
          <p className="text-slate-400">AI-powered code reviews for better software development</p>
        </div>
      </footer>
    </div>
  )
}
