// Input validation utilities
import { sanitizeCVData, sanitizeText, sanitizeEmail } from "./sanitization";

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

// Validate CV data structure and content
export function validateAndSanitizeCVData(data: any): ValidationResult {
  const errors: string[] = [];

  // Check if data exists
  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Invalid data format"],
    };
  }

  // Validate required fields
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

  // Validate arrays
  if (data.experience && !Array.isArray(data.experience)) {
    errors.push("Experience must be an array");
  }

  if (data.education && !Array.isArray(data.education)) {
    errors.push("Education must be an array");
  }

  if (data.skills && !Array.isArray(data.skills)) {
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
  } catch (error) {
    return {
      isValid: false,
      errors: ["Failed to sanitize data"],
    };
  }
}

// Validate user registration data
export function validateUserRegistration(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Invalid data format"],
    };
  }

  // Validate name
  if (!data.name || typeof data.name !== "string") {
    errors.push("Name is required and must be a string");
  } else if (data.name.length < 2) {
    errors.push("Name must be at least 2 characters long");
  } else if (data.name.length > 100) {
    errors.push("Name must be less than 100 characters long");
  }

  // Validate email
  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required and must be a string");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }

  // Validate password
  if (!data.password || typeof data.password !== "string") {
    errors.push("Password is required and must be a string");
  } else if (data.password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else if (data.password.length > 128) {
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
      name: sanitizeText(data.name, { maxLength: 100 }),
      email: sanitizeEmail(data.email),
      password: data.password, // Don't sanitize password as it needs to be hashed
    };

    return {
      isValid: true,
      errors: [],
      sanitizedData,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ["Failed to sanitize data"],
    };
  }
}

// Rate limiting validation
export function validateRateLimit(identifier: string, action: string): boolean {
  // This would typically check against a rate limiting store
  // For now, we'll implement a simple check
  const rateLimits = {
    cv_creation: { maxRequests: 10, windowMs: 60000 }, // 10 CVs per minute
    pdf_generation: { maxRequests: 5, windowMs: 60000 }, // 5 PDFs per minute
    user_registration: { maxRequests: 3, windowMs: 300000 }, // 3 registrations per 5 minutes
  };

  // Implementation would depend on your rate limiting strategy
  // This is a placeholder for the actual implementation
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

  return !dangerousPatterns.some((pattern) => pattern.test(content));
}
