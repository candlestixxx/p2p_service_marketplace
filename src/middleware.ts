import NextAuth from "next-auth"
import authConfig from "./auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export default middleware((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = nextUrl.pathname.startsWith("/services") || nextUrl.pathname === "/"
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register"
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(req.auth?.user?.role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/client", nextUrl))
    }
    return;
  }

  // Role-based route protection
  if (isLoggedIn && isDashboardRoute) {
    const role = req.auth?.user?.role;
    if (nextUrl.pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return Response.redirect(new URL("/services", nextUrl));
    }
    if (nextUrl.pathname.startsWith("/dashboard/provider") && role !== "PROVIDER") {
      return Response.redirect(new URL("/services", nextUrl));
    }
    if (nextUrl.pathname.startsWith("/dashboard/client") && role !== "CLIENT") {
      return Response.redirect(new URL("/services", nextUrl));
    }
  }

  if (!isLoggedIn && isDashboardRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    )
  }

  return;
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
