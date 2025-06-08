# Rate Limiting Implementation

This document describes the comprehensive rate limiting system implemented for the Visual CV Builder application.

## Overview

The rate limiting system uses a multi-layer approach:

1. **Edge Middleware** - Basic rate limiting at the Next.js middleware level
2. **API Route Protection** - Detailed rate limiting per endpoint using Upstash Ratelimit
3. **Fallback System** - In-memory store for development/fallback scenarios

## Rate Limits by Endpoint

### Authentication

- **User Registration**: 3 requests per 5 minutes per IP
- **Login**: Protected by NextAuth.js built-in mechanisms

### CV Operations

- **CV Creation**: 10 requests per minute per IP
- **CV Updates**: 20 requests per minute per IP
- **CV Fetching**: 100 requests per minute per IP (general limit)
- **CV Deletion**: 100 requests per minute per IP (general limit)

### PDF Generation

- **PDF Generation**: 5 requests per minute per IP (resource-intensive operation)

### File Operations

- **File Downloads**: 15 requests per minute per IP

## Configuration

### Environment Variables

Add these optional variables to your `.env.local` file for production Redis-based rate limiting:

```bash
# Rate Limiting (Optional - uses in-memory store if not provided)
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
```

### Development vs Production

- **Development**: Uses in-memory Map for rate limiting (single instance)
- **Production**: Uses Upstash Redis for distributed rate limiting across multiple instances

## Implementation Details

### 1. Edge Middleware (`src/middleware.ts`)

Provides first-line defense with basic rate limiting for critical endpoints:

- Registration endpoint protection
- PDF generation endpoint protection
- IP-based identification

### 2. API Route Protection (`src/lib/rate-limit.ts`)

Comprehensive rate limiting library with:

- Multiple rate limiters for different operations
- Sliding window algorithm
- Proper HTTP headers for rate limit status
- Error handling and fallback mechanisms

### 3. Individual API Routes

Each API route is protected with appropriate rate limiting:

- `/api/auth/register` - Registration rate limiter
- `/api/cv/generate` - PDF generation rate limiter
- `/api/cv` - CV creation rate limiter
- `/api/cv/[id]` - CV update/general rate limiters
- `/api/cv/[id]/download` - Download rate limiter

## Usage Examples

### Using the Rate Limit Helper

```typescript
import { rateLimiters, applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(
    request,
    rateLimiters.cvCreate
  );
  if (rateLimitResponse) {
    return rateLimitResponse; // Rate limit exceeded
  }

  // Continue with normal request processing
}
```

### Using the Higher-Order Function

```typescript
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";

const handler = async (request: NextRequest) => {
  // Your API logic here
};

export const POST = withRateLimit(handler, rateLimiters.cvCreate);
```

## Rate Limit Headers

When rate limits are applied, the following headers are included in responses:

- `X-RateLimit-Limit`: Maximum number of requests allowed
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets
- `Retry-After`: Seconds until the client can retry (for 429 responses)

## Error Responses

When rate limits are exceeded, a 429 status code is returned with:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "limit": 10,
  "remaining": 0,
  "reset": "2025-06-08T10:30:00.000Z"
}
```

## Monitoring and Analytics

The Upstash Ratelimit library includes built-in analytics when `analytics: true` is set. This allows monitoring of:

- Request patterns
- Rate limit violations
- Usage statistics

## Security Considerations

1. **IP-based identification**: Uses forwarded headers and fallback to connection IP
2. **DDoS protection**: Multiple layers prevent abuse
3. **Resource protection**: PDF generation has stricter limits due to CPU/memory usage
4. **Graceful degradation**: Fallback to in-memory store if Redis is unavailable

## Testing Rate Limits

To test rate limits locally:

1. Make rapid requests to protected endpoints
2. Check for 429 responses after exceeding limits
3. Verify rate limit headers in responses
4. Test different endpoints have different limits

Example using curl:

```bash
# Test registration rate limit (should fail after 3 requests within 5 minutes)
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"test","email":"test'$i'@example.com","password":"password"}'
done
```

## Migration Notes

- Legacy `checkRateLimit` function is kept for backward compatibility
- New implementations should use the Upstash-based rate limiters
- Existing sanitization.ts functions remain unchanged for compatibility

## Dependencies

- `@upstash/ratelimit`: Modern rate limiting library
- `@upstash/redis`: Redis client for distributed rate limiting
- Built-in Next.js middleware for edge-level protection
