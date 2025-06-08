// Debug script for failing XSS test cases
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  'data:text/html,<script>alert("XSS")</script>',
  '"><script>alert("XSS")</script>',
];

function createMaliciousUser(payload) {
  return {
    name: `User Name ${payload}`,
    email: `user${payload.replace(/[<>]/g, "")}@example.com`,
    password: `password123${payload}`,
  };
}

function sanitizeText(text) {
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

  // Strip all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  return sanitized;
}

console.log("🔍 Debugging Failing XSS Test Cases\n");

XSS_PAYLOADS.forEach((payload, index) => {
  console.log(`\n--- Test Case ${index + 1}: ${payload} ---`);

  const maliciousUser = createMaliciousUser(payload);
  console.log("Original user data:", JSON.stringify(maliciousUser, null, 2));

  const sanitizedName = sanitizeText(maliciousUser.name);
  const sanitizedEmail = maliciousUser.email; // Email would be rejected anyway due to format

  console.log("Sanitized name:", sanitizedName);
  console.log("Email (as-is):", sanitizedEmail);

  const containsScript =
    sanitizedName.includes("<script") || sanitizedEmail.includes("<script");
  console.log("Contains script tag:", containsScript);

  // The real issue is these tests are checking the final JSON string
  // which includes the email field that contains sanitized payload
  const finalData = { name: sanitizedName, email: sanitizedEmail };
  const jsonString = JSON.stringify(finalData);
  console.log("Final JSON string:", jsonString);
  console.log("JSON contains script:", jsonString.includes("<script"));
});
