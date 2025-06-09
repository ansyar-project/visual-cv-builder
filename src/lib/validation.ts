// Input validation utilities
import { sanitizeCVData, sanitizeText, sanitizeEmail } from "./sanitization";

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: unknown;
}

// Validate CV data structure and content
export function validateAndSanitizeCVData(data: unknown): ValidationResult {
  const errors: string[] = [];

  // Check if data exists
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Invalid data format"],
    };
  }

  // Use type assertion for validation
  const d = data as {
    title?: unknown;
    personalInfo?: { name?: unknown; email?: unknown };
    experience?: unknown;
    education?: unknown;
    skills?: unknown;
  };

  // Validate required fields
  if (!d.title || typeof d.title !== "string") {
    errors.push("CV title is required and must be a string");
  }

  if (!d.personalInfo || typeof d.personalInfo !== "object") {
    errors.push("Personal information is required");
  } else {
    const pi = d.personalInfo as Record<string, unknown>;
    if (!("name" in pi) || typeof pi.name !== "string") {
      errors.push("Name is required and must be a string");
    }
    if (!("email" in pi) || typeof pi.email !== "string") {
      errors.push("Email is required and must be a string");
    }
  }

  // Validate arrays
  if (d.experience && !Array.isArray(d.experience)) {
    errors.push("Experience must be an array");
  }

  if (d.education && !Array.isArray(d.education)) {
    errors.push("Education must be an array");
  }

  if (d.skills && !Array.isArray(d.skills)) {
    errors.push("Skills must be an array");
  }

  // If validation failed, return errors
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }
  // Sanitize the data
  try {
    const sanitizedData = sanitizeCVData(data);
    return {
      isValid: true,
      errors: [],
      sanitizedData,
    };
  } catch {
    return {
      isValid: false,
      errors: ["Failed to sanitize data"],
    };
  }
}

// Validate user registration data
export function validateUserRegistration(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Invalid data format"],
    };
  }

  // Use type assertion for validation
  const d = data as { name?: unknown; email?: unknown; password?: unknown };

  // Validate name
  if (!d.name || typeof d.name !== "string") {
    errors.push("Name is required and must be a string");
  } else if (d.name.length < 2) {
    errors.push("Name must be at least 2 characters long");
  } else if (d.name.length > 100) {
    errors.push("Name must be less than 100 characters long");
  }

  // Validate email
  if (!d.email || typeof d.email !== "string") {
    errors.push("Email is required and must be a string");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(d.email)) {
      errors.push("Invalid email format");
    }
  }

  // Validate password
  if (!d.password || typeof d.password !== "string") {
    errors.push("Password is required and must be a string");
  } else if (d.password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else if (d.password.length > 128) {
    errors.push("Password must be less than 128 characters long");
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  // Sanitize the data
  try {
    const sanitizedData = {
      name:
        typeof d.name === "string"
          ? sanitizeText(d.name, { maxLength: 100 })
          : "",
      email: typeof d.email === "string" ? sanitizeEmail(d.email) : "",
      password: typeof d.password === "string" ? d.password : "", // Don't sanitize password as it needs to be hashed
    };
    return {
      isValid: true,
      errors: [],
      sanitizedData,
    };
  } catch {
    return {
      isValid: false,
      errors: ["Failed to sanitize data"],
    };
  }
}

// Rate limiting validation
export function validateRateLimit(
  _identifier: string,
  _action: string
): boolean {
  // This would typically check against a rate limiting store
  // For now, we'll implement a simple check
  // Implementation would depend on your rate limiting strategy
  // This is a placeholder for the actual implementation
  void _identifier;
  void _action;
  return true;
}

// Content Security Policy validation
export function validateCSP(content: string): boolean {
  if (!content || typeof content !== "string") {
    return true; // Empty content is safe
  }

  let testContent = content;

  // Decode URL encoding and HTML entities to catch encoded XSS
  try {
    testContent = decodeURIComponent(testContent);
  } catch {
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

  // Check for potentially dangerous content
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
    /on\w+\s*=/i, // event handlers like onclick, onload, etc.
    /alert\s*\(/i, // direct alert calls
    /eval\s*\(/i, // eval calls
    /document\./i, // document object access
    /window\./i, // window object access
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(testContent));
}
