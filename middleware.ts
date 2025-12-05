import { CookieOptions, createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options })
          res.cookies.set({ name, value: '', ...options })
        },
      },
      cookieEncoding: 'raw', 
    }
  )

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuth = !!session
  const isLoginPage = req.nextUrl.pathname === '/auth/login'
  const isRoot = req.nextUrl.pathname === '/'
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/home')

  if (isProtectedRoute && !isAuth) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (isAuth && (isRoot || isLoginPage)) {
    return NextResponse.redirect(new URL('/home', req.url))
  }


  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}