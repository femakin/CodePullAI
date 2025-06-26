import React from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Github, GitBranch, Settings, Activity, CheckCircle, Clock, AlertTriangle, User } from "lucide-react"
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/actions/auth'

const layout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  const user = session?.user
  return (
    <div className="h-screen bg-slate-50 overflow-scroll">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">CodePullAI</h1>
            </div>
            <Badge variant="secondary">Dashboard</Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} >
              <Settings className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}

export default layout
