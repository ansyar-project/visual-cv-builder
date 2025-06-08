import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// In-memory fallback for development
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async get(key: string) {
    const item = this.store.get(key);
    if (!item || item.resetTime < Date.now()) {
      return null;
    }
    return item;
  }

  async set(key: string, value: { count: number; resetTime: number }) {
    this.store.set(key, value);
  }

  async delete(key: string) {
    this.store.delete(key);
  }
}

// Use Redis in production, fallback to memory in development
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (new MemoryStore() as any);

// Different rate limits for different endpoints
export const rateLimiters = {
  // User registration: 3 requests per 5 minutes
  register: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "5 m"),
    prefix: "ratelimit:register",
    analytics: true,
  }),

  // CV creation: 10 requests per minute
  cvCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "ratelimit:cv:create",
    analytics: true,
  }),

  // PDF generation: 5 requests per minute (more resource intensive)
  pdfGenerate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "ratelimit:pdf:generate",
    analytics: true,
  }),

  // CV updates: 20 requests per minute
  cvUpdate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    prefix: "ratelimit:cv:update",
    analytics: true,
  }),

  // File downloads: 15 requests per minute
  download: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, "1 m"),
    prefix: "ratelimit:download",
    analytics: true,
  }),

  // General API: 100 requests per minute
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    prefix: "ratelimit:general",
    analytics: true,
  }),
};

// Helper function to get client identifier
export function getClientIdentifier(request: NextRequest): string {
  // Use IP address as primary identifier
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0] : realIp || "unknown";

  // For authenticated requests, you could also use user ID
  // const userId = request.headers.get("x-user-id");
  // return userId ? `user:${userId}` : `ip:${ip}`;

  return `ip:${ip}`;
}

// Rate limit middleware function
export async function applyRateLimit(
  request: NextRequest,
  limiter: Ratelimit,
  customIdentifier?: string
): Promise<NextResponse | null> {
  const identifier = customIdentifier || getClientIdentifier(request);

  try {
    const { success, limit, reset } = await limiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          limit,
          remaining: 0,
          reset: new Date(reset),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Rate limit passed, return null to continue
    return null;
  } catch (error) {
    console.error("Rate limiting error:", error);
    // On error, allow the request to continue but log the issue
    return null;
  }
}

// Higher-order function to wrap API routes with rate limiting
export function withRateLimit(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  limiter: Ratelimit,
  options?: {
    customIdentifier?: (request: NextRequest) => string;
    skipAuthenticated?: boolean;
  }
) {
  return async (
    request: NextRequest,
    ...args: unknown[]
  ): Promise<NextResponse> => {
    // Apply rate limiting
    const identifier = options?.customIdentifier
      ? options.customIdentifier(request)
      : getClientIdentifier(request);

    const rateLimitResponse = await applyRateLimit(
      request,
      limiter,
      identifier
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Rate limit passed, call the original handler
    return handler(request, ...args);
  };
}

// Specific rate limit configurations for different actions
export const RateLimitConfig = {
  REGISTER: { requests: 3, window: "5m" },
  CV_CREATE: { requests: 10, window: "1m" },
  PDF_GENERATE: { requests: 5, window: "1m" },
  CV_UPDATE: { requests: 20, window: "1m" },
  DOWNLOAD: { requests: 15, window: "1m" },
  GENERAL: { requests: 100, window: "1m" },
} as const;

// Legacy compatibility function for existing code
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  // This function is kept for backward compatibility
  // New implementations should use the Upstash rate limiter above
  console.warn(
    "Using legacy rate limiting. Consider migrating to the new rate limiter."
  );

  const now = Date.now();
  const key = `legacy:${identifier}`;

  // Use a simple in-memory store for legacy support
  const store = new Map<string, { count: number; resetTime: number }>();
  const current = store.get(key);

  if (!current || current.resetTime < now) {
    // First request or window expired
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  current.count++;
  store.set(key, current);

  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime,
  };
}
