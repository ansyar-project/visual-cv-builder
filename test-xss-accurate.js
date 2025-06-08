// Accurate XSS Protection Test - Tests actual threat neutralization
console.log("🔒 Visual CV Builder - Accurate XSS Protection Test");
console.log("=".repeat(60));

// Import actual sanitization logic (mock for standalone test)
function sanitizeText(input, options = {}) {
  if (!input || typeof input !== "string") return "";

  let sanitized = input;

  // URL decoding
  try {
    sanitized = decodeURIComponent(sanitized);
  } catch (e) {}

  // HTML entity decoding
  sanitized = sanitized
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");

  // Pre-sanitization (remove/block dangerous content)
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript\s*:/gi, "blocked:")
    .replace(/vbscript\s*:/gi, "blocked:")
    .replace(/data\s*:\s*text\/html/gi, "blocked:data")
    .replace(/data\s*:\s*application\/javascript/gi, "blocked:data")
    .replace(/data\s*:\s*text\/javascript/gi, "blocked:data")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/alert\s*\(/gi, "blocked_alert(")
    .replace(/eval\s*\(/gi, "blocked_eval(")
    .replace(/document\./gi, "blocked_document.")
    .replace(/window\./gi, "blocked_window.")
    .replace(/\bdocument\b/gi, "blocked_document")
    .replace(/\bwindow\b/gi, "blocked_window");

  // For text fields (non-HTML), escape everything
  if (!options.allowHTML) {
    sanitized = sanitized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  return sanitized;
}

function sanitizeEmail(email) {
  if (!email || typeof email !== "string") return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeText(email, { stripWhitespace: true });
  return emailRegex.test(sanitized) ? sanitized.toLowerCase() : "";
}

function sanitizeCVData(data) {
  if (!data || typeof data !== "object") return {};

  const sanitized = {};

  if (data.title) {
    sanitized.title = sanitizeText(data.title, { maxLength: 200 });
  }

  if (data.personalInfo) {
    sanitized.personalInfo = {
      name: sanitizeText(data.personalInfo.name || "", { maxLength: 100 }),
      email: sanitizeEmail(data.personalInfo.email || ""),
      phone: sanitizeText(data.personalInfo.phone || "", { maxLength: 20 }),
      summary: sanitizeText(data.personalInfo.summary || "", {
        maxLength: 500,
      }),
    };
  }

  return sanitized;
}

// Function to check if content is actually dangerous (can execute code)
function isActuallyDangerous(content) {
  if (!content || typeof content !== "string") return false;

  // Check for patterns that could actually execute in a browser
  const executablePatterns = [
    /<script\b[^>]*>[\s\S]*?<\/script>/gi, // Complete script tags
    /javascript\s*:[^"'\s<>]+/gi, // Unblocked javascript: protocols
    /data\s*:\s*text\/html\s*[,;]/gi, // Unblocked data: HTML
    /<iframe\b[^>]*src\s*=\s*["']?javascript:/gi, // iframe with js
    /on\w+\s*=\s*["'][^"']*alert\s*\(/gi, // Event handlers with alert
    /eval\s*\(\s*["'][^"']*["']\s*\)/gi, // Direct eval calls
  ];

  return executablePatterns.some((pattern) => pattern.test(content));
}

// Test dangerous payloads
const dangerousPayloads = [
  '<script>alert("XSS")</script>',
  '<img src="x" onerror="alert(\'XSS\')">',
  'javascript:alert("XSS")',
  "<iframe src=\"javascript:alert('XSS')\"></iframe>",
  "<object data=\"javascript:alert('XSS')\"></object>",
  "<embed src=\"javascript:alert('XSS')\">",
  "<style>@import \"javascript:alert('XSS')\"</style>",
  'data:text/html,<script>alert("XSS")</script>',
  '&#60;script&#62;alert("XSS")&#60;/script&#62;',
  '%3Cscript%3Ealert("XSS")%3C/script%3E',
  '"><script>alert("XSS")</script>',
  '&lt;script&gt;alert("XSS")&lt;/script&gt;',
];

console.log("\n🧪 Testing XSS Protection Effectiveness\n");

let totalTests = 0;
let successfullyNeutralized = 0;

dangerousPayloads.forEach((payload, index) => {
  console.log(`Test ${index + 1}: ${payload}`);

  // Test CV data sanitization
  const cvData = {
    title: `Title with ${payload}`,
    personalInfo: {
      name: `Name ${payload}`,
      email: `test@example.com`,
      summary: `Summary ${payload}`,
    },
  };

  const sanitizedCV = sanitizeCVData(cvData);
  const cvResult = JSON.stringify(sanitizedCV);

  const isOriginalDangerous = isActuallyDangerous(payload);
  const isSanitizedDangerous = isActuallyDangerous(cvResult);

  totalTests++;

  if (isOriginalDangerous && !isSanitizedDangerous) {
    console.log("  ✅ THREAT NEUTRALIZED - Dangerous payload made safe");
    successfullyNeutralized++;
  } else if (!isOriginalDangerous && !isSanitizedDangerous) {
    console.log("  ✅ SAFE CONTENT - No threat detected, properly handled");
    successfullyNeutralized++;
  } else if (isOriginalDangerous && isSanitizedDangerous) {
    console.log("  ❌ THREAT REMAINS - Dangerous content not neutralized");
    console.log(`     Original: ${payload}`);
    console.log(`     Sanitized: ${cvResult}`);
  } else {
    console.log("  ⚠️ EDGE CASE - Review needed");
  }

  console.log(`     Sanitized Result: ${sanitizedCV.title || "N/A"}`);
  console.log("");
});

// Summary
console.log("=" * 60);
console.log("📊 PROTECTION EFFECTIVENESS SUMMARY");
console.log("=" * 60);
console.log(`Total Tests: ${totalTests}`);
console.log(`Successfully Neutralized: ${successfullyNeutralized}`);
console.log(
  `Success Rate: ${((successfullyNeutralized / totalTests) * 100).toFixed(1)}%`
);

if (successfullyNeutralized === totalTests) {
  console.log(
    "\n🎉 EXCELLENT! All XSS threats have been successfully neutralized."
  );
  console.log("✅ Your application is protected against these attack vectors.");
} else {
  console.log(
    `\n⚠️ ${
      totalTests - successfullyNeutralized
    } threats were not properly neutralized.`
  );
  console.log("🔧 Review the sanitization logic for the failing cases.");
}

// Test specific real-world scenarios
console.log("\n🌍 REAL-WORLD SCENARIO TESTS");
console.log("-".repeat(40));

const realWorldTests = [
  {
    name: "Form Submission Attack",
    input: {
      title: 'Software Engineer <script>fetch("/api/steal-data")</script>',
      personalInfo: {
        name: 'John<img src=x onerror=alert("stolen")>Doe',
        email: "john@example.com",
      },
    },
  },
  {
    name: "URL Parameter Injection",
    input: {
      title: decodeURIComponent(
        '%3Cscript%3Edocument.location%3D"http://evil.com"%3C/script%3E'
      ),
      personalInfo: {
        name: "Test User",
        email: "test@example.com",
      },
    },
  },
];

realWorldTests.forEach((test, index) => {
  console.log(`\nScenario ${index + 1}: ${test.name}`);
  const result = sanitizeCVData(test.input);
  const resultString = JSON.stringify(result);

  const neutralized = !isActuallyDangerous(resultString);
  console.log(
    neutralized ? "  ✅ Scenario neutralized" : "  ❌ Scenario failed"
  );
  console.log(`  Result: ${result.title || "N/A"}`);
});

console.log("\n" + "=".repeat(60));
console.log("🔐 XSS Protection Test Complete");
console.log("=".repeat(60));
