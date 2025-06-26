import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Define public routes that don't require authentication
const publicRoutes = ['/', '/demo', '/auth', '/bedrock', '/api/bedrock']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes to pass through without authentication
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // For all other routes, check authentication
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhook/github (GitHub webhook)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhook/github|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}