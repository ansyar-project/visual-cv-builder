import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple edge-compatible rate limiting for critical endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function simpleRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
) {
  const now = Date.now();
  const key = identifier;

  // Clean expired entries
  for (const [k, v] of rateLimitMap.entries()) {
    if (v.resetTime < now) {
      rateLimitMap.delete(k);
    }
  }

  const current = rateLimitMap.get(key);

  if (!current || current.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  current.count++;
  rateLimitMap.set(key, current);

  return { allowed: true, remaining: maxRequests - current.count };
}

export default withAuth(
  function middleware(req: NextRequest) {
    // Get client identifier
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwarded ? forwarded.split(",")[0] : realIp || "unknown";
    const identifier = `ip:${ip}`;

    // Apply stricter rate limiting for registration endpoint at edge
    if (req.nextUrl.pathname === "/api/auth/register") {
      const { allowed } = simpleRateLimit(identifier, 3, 5 * 60 * 1000); // 3 per 5 minutes

      if (!allowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: "Too many registration attempts. Please try again later.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": "300", // 5 minutes
            },
          }
        );
      }
    }

    // Apply rate limiting for PDF generation at edge (backup to API-level limiting)
    if (req.nextUrl.pathname.includes("/generate")) {
      const { allowed } = simpleRateLimit(identifier, 10, 60 * 1000); // 10 per minute

      if (!allowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message:
              "Too many PDF generation requests. Please try again later.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": "60", // 1 minute
            },
          }
        );
      }
    }

    // Add rate limit headers for monitoring
    const response = NextResponse.next();
    response.headers.set("X-Rate-Limit-Applied", "edge-middleware");

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const publicPaths = ["/", "/auth/signin", "/auth/signup"];
        // Allow public access to auth routes, sign in/up, and root
        if (
          req.nextUrl.pathname.startsWith("/api/auth") ||
          publicPaths.includes(req.nextUrl.pathname)
        ) {
          return true;
        }
        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/cv/:path*",
    "/api/cv/:path*",
    "/api/auth/register",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
