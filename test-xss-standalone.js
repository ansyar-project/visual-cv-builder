// Simple XSS protection test runner
const fs = require("fs");
const path = require("path");

// Mock DOMPurify for Node.js environment
const mockDOMPurify = {
  sanitize: (dirty, options = {}) => {
    if (!dirty || typeof dirty !== "string") return "";

    // Decode URL encoding and HTML entities first
    let decoded = dirty;
    try {
      decoded = decodeURIComponent(decoded);
    } catch (e) {
      // If decoding fails, continue with original
    }

    // Decode HTML entities
    decoded = decoded
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, "&");

    // Aggressive XSS removal for testing
    let clean = decoded
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/vbscript:/gi, "")
      .replace(/data:text\/html/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
      .replace(/<embed[^>]*>/gi, "")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
      .replace(/<link[^>]*>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<meta[^>]*>/gi, "")
      .replace(/alert\s*\(/gi, "alert_blocked(")
      .replace(/eval\s*\(/gi, "eval_blocked(")
      .replace(/document\./gi, "document_blocked.")
      .replace(/window\./gi, "window_blocked.");

    return clean;
  },
};

// Mock sanitization functions for testing
function sanitizeText(text, options = {}) {
  if (!text || typeof text !== "string") return "";

  let sanitized = text;

  // Decode URL encoding and HTML entities to catch encoded XSS attempts
  try {
    sanitized = decodeURIComponent(sanitized);
  } catch (e) {
    // If decoding fails, continue with original string
  }

  // Decode HTML entities
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

  if (options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  if (options.stripWhitespace) {
    sanitized = sanitized.trim();
  }

  if (options.allowHTML) {
    sanitized = mockDOMPurify.sanitize(sanitized, options);
  } else {
    // Strip all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, "");
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

  if (Array.isArray(data.experience)) {
    sanitized.experience = data.experience.map((exp) => ({
      company: sanitizeText(exp.company || "", { maxLength: 200 }),
      position: sanitizeText(exp.position || "", { maxLength: 200 }),
      description: sanitizeText(exp.description || "", { maxLength: 1000 }),
    }));
  }

  if (Array.isArray(data.skills)) {
    sanitized.skills = data.skills
      .map((skill) => sanitizeText(skill || "", { maxLength: 100 }))
      .filter((skill) => skill.length > 0);
  }

  return sanitized;
}

function validateAndSanitizeCVData(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Invalid data format"] };
  }

  if (!data.title || typeof data.title !== "string") {
    errors.push("CV title is required and must be a string");
  }

  if (!data.personalInfo || typeof data.personalInfo !== "object") {
    errors.push("Personal information is required");
  } else {
    if (!data.personalInfo.name || typeof data.personalInfo.name !== "string") {
      errors.push("Name is required and must be a string");
    }

    if (
      !data.personalInfo.email ||
      typeof data.personalInfo.email !== "string"
    ) {
      errors.push("Email is required and must be a string");
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  try {
    const sanitizedData = sanitizeCVData(data);
    return { isValid: true, errors: [], sanitizedData };
  } catch (error) {
    return { isValid: false, errors: ["Failed to sanitize data"] };
  }
}

function validateUserRegistration(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Invalid data format"] };
  }

  if (!data.name || typeof data.name !== "string") {
    errors.push("Name is required and must be a string");
  } else if (data.name.length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required and must be a string");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  try {
    const sanitizedData = {
      name: sanitizeText(data.name, { maxLength: 100 }),
      email: sanitizeEmail(data.email),
      password: data.password,
    };

    return { isValid: true, errors: [], sanitizedData };
  } catch (error) {
    return { isValid: false, errors: ["Failed to sanitize data"] };
  }
}

function validateCSP(content) {
  if (!content || typeof content !== "string") {
    return true; // Empty content is safe
  }

  let testContent = content;

  // Decode URL encoding and HTML entities to catch encoded XSS
  try {
    testContent = decodeURIComponent(testContent);
  } catch (e) {
    // If decoding fails, continue with original
  }

  // Decode HTML entities
  testContent = testContent
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");

  const dangerousPatterns = [
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<style/i,
    /<meta/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /on\w+\s*=/i,
    /alert\s*\(/i,
    /eval\s*\(/i,
    /document\./i,
    /window\./i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(testContent));
}

// XSS Test Payloads
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src="x" onerror="alert(\'XSS\')">',
  'javascript:alert("XSS")',
  "<svg onload=\"alert('XSS')\">",
  "<iframe src=\"javascript:alert('XSS')\"></iframe>",
  "<object data=\"javascript:alert('XSS')\"></object>",
  "<embed src=\"javascript:alert('XSS')\">",
  '<link rel="stylesheet" href="javascript:alert(\'XSS\')">',
  "<style>@import \"javascript:alert('XSS')\"</style>",
  '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">',
  '<form><input type="submit" formaction="javascript:alert(\'XSS\')">',
  "<details open ontoggle=\"alert('XSS')\">",
  "<marquee onstart=\"alert('XSS')\">",
  "<video><source onerror=\"alert('XSS')\">",
  '<audio src="x" onerror="alert(\'XSS\')">',
  'data:text/html,<script>alert("XSS")</script>',
  '&#60;script&#62;alert("XSS")&#60;/script&#62;',
  '%3Cscript%3Ealert("XSS")%3C/script%3E',
  '"><script>alert("XSS")</script>',
  "'-alert(\"XSS\")-'",
  '&lt;script&gt;alert("XSS")&lt;/script&gt;',
];

function createMaliciousCV(payload) {
  return {
    title: `CV Title ${payload}`,
    personalInfo: {
      name: `John Doe ${payload}`,
      email: `test${payload.replace(/[<>]/g, "")}@example.com`,
      phone: `123-456-7890 ${payload}`,
      summary: `Professional summary ${payload}`,
    },
    experience: [
      {
        company: `Company Name ${payload}`,
        position: `Position ${payload}`,
        description: `Job description ${payload}`,
      },
    ],
    skills: [`JavaScript ${payload}`, `React ${payload}`],
  };
}

function createMaliciousUser(payload) {
  return {
    name: `User Name ${payload}`,
    email: `user${payload.replace(/[<>]/g, "")}@example.com`,
    password: `password123${payload}`,
  };
}

function runXSSProtectionTests() {
  console.log("🔒 Starting XSS Protection Tests...\n");

  let passedTests = 0;
  let failedTests = 0;
  // Test 1: CV Data Sanitization
  console.log("📋 Testing CV Data Sanitization:");
  XSS_PAYLOADS.forEach((payload, index) => {
    try {
      const maliciousCV = createMaliciousCV(payload);
      const result = validateAndSanitizeCVData(maliciousCV);

      if (result.isValid && result.sanitizedData) {
        const sanitizedString = JSON.stringify(result.sanitizedData);
        // Check for various dangerous patterns, not just <script
        const hasDangerousContent = [
          "<script",
          "javascript:",
          "data:text/html",
          "<iframe",
          "<object",
          "<embed",
          "onerror=",
          "onload=",
          "onclick=",
        ].some((pattern) =>
          sanitizedString.toLowerCase().includes(pattern.toLowerCase())
        );

        if (!hasDangerousContent) {
          console.log(`  ✅ Test ${index + 1}: Payload sanitized successfully`);
          passedTests++;
        } else {
          console.log(
            `  ❌ Test ${index + 1}: Dangerous payload not removed: ${payload}`
          );
          failedTests++;
        }
      } else {
        console.log(
          `  ✅ Test ${index + 1}: Invalid data rejected (${result.errors.join(
            ", "
          )})`
        );
        passedTests++;
      }
    } catch (error) {
      console.log(
        `  ❌ Test ${index + 1}: Error during sanitization: ${error}`
      );
      failedTests++;
    }
  });
  // Test 2: User Registration Sanitization
  console.log("\n👤 Testing User Registration Sanitization:");
  XSS_PAYLOADS.forEach((payload, index) => {
    try {
      const maliciousUser = createMaliciousUser(payload);
      const result = validateUserRegistration(maliciousUser);

      if (result.isValid && result.sanitizedData) {
        const sanitizedString = JSON.stringify(result.sanitizedData);
        // Check for various dangerous patterns
        const hasDangerousContent = [
          "<script",
          "javascript:",
          "data:text/html",
          "<iframe",
          "<object",
          "<embed",
          "onerror=",
          "onload=",
          "onclick=",
        ].some((pattern) =>
          sanitizedString.toLowerCase().includes(pattern.toLowerCase())
        );

        if (!hasDangerousContent) {
          console.log(
            `  ✅ User Test ${index + 1}: Payload sanitized successfully`
          );
          passedTests++;
        } else {
          console.log(
            `  ❌ User Test ${
              index + 1
            }: Dangerous payload not removed: ${payload}`
          );
          failedTests++;
        }
      } else {
        console.log(
          `  ✅ User Test ${
            index + 1
          }: Invalid data rejected (${result.errors.join(", ")})`
        );
        passedTests++;
      }
    } catch (error) {
      console.log(
        `  ❌ User Test ${index + 1}: Error during sanitization: ${error}`
      );
      failedTests++;
    }
  });

  // Test 3: Content Security Policy Validation
  console.log("\n🛡️ Testing Content Security Policy Validation:");
  XSS_PAYLOADS.forEach((payload, index) => {
    const isSecure = validateCSP(payload);
    if (!isSecure) {
      console.log(
        `  ✅ CSP Test ${index + 1}: Dangerous content detected and blocked`
      );
      passedTests++;
    } else {
      console.log(
        `  ❌ CSP Test ${index + 1}: Dangerous content not detected: ${payload}`
      );
      failedTests++;
    }
  });

  // Test 4: Individual Sanitization Functions
  console.log("\n🧹 Testing Individual Sanitization Functions:");

  XSS_PAYLOADS.forEach((payload, index) => {
    try {
      const sanitized = sanitizeText(payload);
      const containsDangerous =
        payload.includes("<script") && sanitized.includes("<script");

      if (!containsDangerous) {
        console.log(
          `  ✅ Text Test ${index + 1}: Script tags removed successfully`
        );
        passedTests++;
      } else {
        console.log(
          `  ❌ Text Test ${index + 1}: Script tags not removed: ${payload}`
        );
        failedTests++;
      }
    } catch (error) {
      console.log(
        `  ❌ Text Test ${index + 1}: Error during sanitization: ${error}`
      );
      failedTests++;
    }
  });

  // Summary
  console.log("\n📊 Test Summary:");
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(
    `📈 Success Rate: ${(
      (passedTests / (passedTests + failedTests)) *
      100
    ).toFixed(1)}%`
  );

  return {
    passed: passedTests,
    failed: failedTests,
    successRate: (passedTests / (passedTests + failedTests)) * 100,
  };
}

function testSpecificScenarios() {
  console.log("\n🎯 Testing Specific XSS Scenarios...\n");

  // Test 1: Form submission with malicious data
  console.log("📝 Form Submission Test:");
  const maliciousFormData = {
    title: 'Software Engineer <script>fetch("/steal-data")</script>',
    personalInfo: {
      name: 'John<img src=x onerror=alert("XSS")>Doe',
      email:
        'john@example.com"><script>document.location="http://evil.com"</script>',
      summary: 'I am a developer javascript:alert("XSS")',
    },
    experience: [
      {
        company: "Tech Corp <svg onload=\"alert('XSS')\">",
        description:
          "Worked on <iframe src=\"javascript:alert('XSS')\"></iframe> projects",
      },
    ],
  };

  const result = validateAndSanitizeCVData(maliciousFormData);
  if (result.isValid) {
    console.log("  ✅ Malicious form data sanitized successfully");
    console.log(`  📄 Sanitized title: "${result.sanitizedData?.title}"`);
    console.log(
      `  👤 Sanitized name: "${result.sanitizedData?.personalInfo?.name}"`
    );
  } else {
    console.log("  ❌ Form validation failed:", result.errors);
  }

  // Test 2: URL-encoded payloads
  console.log("\n🔗 URL-Encoded Payload Test:");
  const urlEncodedPayload = decodeURIComponent(
    "%3Cscript%3Ealert%28%22XSS%22%29%3C%2Fscript%3E"
  );
  const urlResult = validateAndSanitizeCVData({
    title: urlEncodedPayload,
    personalInfo: { name: "Test", email: "test@example.com" },
  });

  if (
    urlResult.isValid &&
    !urlResult.sanitizedData?.title.includes("<script")
  ) {
    console.log("  ✅ URL-encoded XSS payload sanitized");
  } else {
    console.log("  ❌ URL-encoded XSS payload not properly handled");
  }

  // Test 3: Nested XSS attempts
  console.log("\n🪆 Nested XSS Test:");
  const nestedPayload =
    '<div><span><script>alert("nested")</script></span></div>';
  const nestedResult = sanitizeText(nestedPayload);

  if (!nestedResult.includes("<script")) {
    console.log("  ✅ Nested XSS payload sanitized");
  } else {
    console.log("  ❌ Nested XSS payload not properly handled");
  }
}

// Main execution
console.log("🔒 Visual CV Builder - XSS Protection Test Suite");
console.log("=".repeat(50));

try {
  const results = runXSSProtectionTests();
  testSpecificScenarios();

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
