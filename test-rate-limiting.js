#!/usr/bin/env node

/**
 * Simple rate limiting test script
 * Tests the rate limiting functionality of the API endpoints
 */

const BASE_URL = "http://localhost:3000";

async function testRateLimit(
  endpoint,
  method = "POST",
  data = {},
  expectedLimit = 5
) {
  console.log(`\n🧪 Testing rate limit for ${method} ${endpoint}`);
  console.log(`Expected limit: ${expectedLimit} requests`);

  const results = [];

  for (let i = 1; i <= expectedLimit + 2; i++) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body:
          method === "POST"
            ? JSON.stringify({
                ...data,
                timestamp: Date.now(), // Make each request unique
              })
            : undefined,
      });

      const responseData = await response.text();

      results.push({
        attempt: i,
        status: response.status,
        rateLimitHeaders: {
          limit: response.headers.get("X-RateLimit-Limit"),
          remaining: response.headers.get("X-RateLimit-Remaining"),
          reset: response.headers.get("X-RateLimit-Reset"),
        },
        success: response.status !== 429,
      });

      console.log(
        `Attempt ${i}: Status ${response.status} | Remaining: ${
          response.headers.get("X-RateLimit-Remaining") || "N/A"
        }`
      );

      if (response.status === 429) {
        console.log(`✅ Rate limit triggered on attempt ${i}`);
        break;
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Request ${i} failed:`, error.message);
    }
  }

  return results;
}

async function runTests() {
  console.log("🚀 Starting Rate Limiting Tests");
  console.log(
    "Make sure your development server is running on http://localhost:3000\n"
  );

  try {
    // Test PDF generation rate limiting (5 per minute)
    await testRateLimit(
      "/api/cv/generate",
      "POST",
      {
        title: "Test CV",
        personalInfo: { name: "Test User", email: "test@example.com" },
        summary: "Test summary",
        experience: [],
        education: [],
        skills: [],
      },
      5
    );

    // Wait a bit before next test
    console.log("\n⏳ Waiting 2 seconds before next test...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test registration rate limiting (3 per 5 minutes)
    await testRateLimit(
      "/api/auth/register",
      "POST",
      {
        name: "Test User",
        email: `test-${Date.now()}@example.com`,
        password: "testpassword123",
      },
      3
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => {
      console.log("\n✅ Rate limiting tests completed");
    })
    .catch((error) => {
      console.error("❌ Test runner failed:", error);
      process.exit(1);
    });
}

module.exports = { testRateLimit, runTests };
