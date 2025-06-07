#!/usr/bin/env node

/**
 * SEO Validation Script
 * Tests all SEO implementations for the VisualCV Builder
 */

const https = require("https");
const http = require("http");

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

console.log("🔍 Validating SEO Implementation for VisualCV Builder");
console.log("================================================\n");

const tests = [
  {
    name: "Homepage Response",
    url: BASE_URL,
    check: (html) => html.includes("<title>") && html.includes("description"),
  },
  {
    name: "Sitemap XML",
    url: `${BASE_URL}/sitemap.xml`,
    check: (xml) => xml.includes("<?xml") && xml.includes("<urlset"),
  },
  {
    name: "Robots.txt",
    url: `${BASE_URL}/robots.txt`,
    check: (txt) => txt.includes("User-Agent:") && txt.includes("Sitemap:"),
  },
  {
    name: "Manifest.json",
    url: `${BASE_URL}/manifest.json`,
    check: (json) => {
      try {
        const manifest = JSON.parse(json);
        return manifest.name && manifest.short_name && manifest.icons;
      } catch {
        return false;
      }
    },
  },
];

async function fetchContent(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    client
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, data }));
      })
      .on("error", reject);
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const { status, data } = await fetchContent(test.url);

      if (status === 200 && test.check(data)) {
        console.log(`✅ ${test.name} - PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAILED (Status: ${status})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      failed++;
    }
    console.log("");
  }

  console.log("================================================");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(
    `📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`
  );

  if (failed === 0) {
    console.log("\n🎉 All SEO validations passed! Your app is SEO-ready.");
  } else {
    console.log("\n⚠️  Some tests failed. Please check the issues above.");
  }
}

runTests().catch(console.error);
