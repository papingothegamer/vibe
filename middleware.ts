import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { env } from "@/lib/env"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create supabase middleware client with explicit URL and key
  const supabase = createMiddlewareClient({
    req,
    res,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If accessing a protected route and not logged in, redirect to login
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - auth (auth routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|auth).*)",
  ],
}

