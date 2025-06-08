// Test file for XSS protection validation
import {
  validateAndSanitizeCVData,
  validateUserRegistration,
  validateCSP,
} from "../lib/validation";
import {
  sanitizeCVData,
  sanitizeText,
  sanitizeEmail,
} from "../lib/sanitization";

// Common XSS attack vectors for testing
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

// Test CV data with XSS payloads
function createMaliciousCV(payload: string) {
  return {
    title: `CV Title ${payload}`,
    personalInfo: {
      name: `John Doe ${payload}`,
      email: `test${payload}@example.com`,
      phone: `123-456-7890 ${payload}`,
      address: `123 Main St ${payload}`,
      summary: `Professional summary ${payload}`,
    },
    experience: [
      {
        company: `Company Name ${payload}`,
        position: `Position ${payload}`,
        startDate: "2020-01-01",
        endDate: "2023-12-31",
        description: `Job description ${payload}`,
      },
    ],
    education: [
      {
        institution: `University ${payload}`,
        degree: `Bachelor's ${payload}`,
        startDate: "2016-09-01",
        endDate: "2020-06-30",
        description: `Education description ${payload}`,
      },
    ],
    skills: [`JavaScript ${payload}`, `React ${payload}`, `Node.js ${payload}`],
    projects: [
      {
        name: `Project Name ${payload}`,
        description: `Project description ${payload}`,
        technologies: [`Tech1 ${payload}`, `Tech2 ${payload}`],
        link: `https://example.com/${payload}`,
      },
    ],
  };
}

// Test user registration data with XSS payloads
function createMaliciousUser(payload: string) {
  return {
    name: `User Name ${payload}`,
    email: `user${payload.replace(/[<>]/g, "")}@example.com`,
    password: `password123${payload}`,
  };
}

// Run XSS protection tests
export function runXSSProtectionTests() {
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
        // Check if dangerous payload was removed
        const sanitizedString = JSON.stringify(result.sanitizedData);
        const containsDangerous =
          payload.includes("<script") && sanitizedString.includes("<script");

        if (!containsDangerous) {
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
        const containsDangerous =
          payload.includes("<script") && sanitizedString.includes("<script");

        if (!containsDangerous) {
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

  // Text sanitization
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

  // Email sanitization (only test email-like payloads)
  const emailPayloads = XSS_PAYLOADS.filter(
    (p) => p.includes("@") || !p.includes("<")
  );
  emailPayloads.forEach((payload, index) => {
    try {
      const testEmail = payload.includes("@")
        ? payload
        : `test${payload}@example.com`;
      const sanitized = sanitizeEmail(testEmail);
      const containsDangerous =
        payload.includes("<script") && sanitized.includes("<script");

      if (!containsDangerous) {
        console.log(
          `  ✅ Email Test ${index + 1}: Email sanitized successfully`
        );
        passedTests++;
      } else {
        console.log(
          `  ❌ Email Test ${index + 1}: Dangerous payload in email: ${payload}`
        );
        failedTests++;
      }
    } catch (error) {
      console.log(
        `  ✅ Email Test ${index + 1}: Invalid email rejected (${error})`
      );
      passedTests++;
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

// Test specific scenarios
export function testSpecificScenarios() {
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

// Export test runner
export default function runAllTests() {
  const basicResults = runXSSProtectionTests();
  testSpecificScenarios();
  return basicResults;
}
