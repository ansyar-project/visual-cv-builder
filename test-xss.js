#!/usr/bin/env node

// XSS Protection Test Runner
// This script tests the XSS protection implementation

import runAllTests from "./test/xss-protection.test.js";

console.log("🔒 Visual CV Builder - XSS Protection Test Suite");
console.log("=".repeat(50));

try {
  const results = runAllTests();

  console.log("\n" + "=".repeat(50));
  console.log("🏁 Test Execution Complete");

  if (results.failed === 0) {
    console.log("🎉 All tests passed! XSS protection is working correctly.");
    process.exit(0);
  } else {
    console.log(
      `⚠️  ${results.failed} tests failed. Please review the implementation.`
    );
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Error running tests:", error);
  process.exit(1);
}
