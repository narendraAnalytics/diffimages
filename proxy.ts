import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',               // Landing page is public
  '/sign-in(.*)',    // Sign-in page and sub-routes
  '/sign-up(.*)',    // Sign-up page and sub-routes (if separate)
])

export default clerkMiddleware(async (auth, req) => {
  // Only protect routes that are NOT public
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
