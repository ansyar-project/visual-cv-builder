import DOMPurify from "isomorphic-dompurify";

// Input sanitization options
export interface SanitizationOptions {
  allowHTML?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  maxLength?: number;
  stripWhitespace?: boolean;
}

// Sanitize text content to prevent XSS
export function sanitizeText(
  input: string,
  options: SanitizationOptions = {}
): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  const {
    allowHTML = false,
    allowedTags = [],
    allowedAttributes = {},
    maxLength,
    stripWhitespace = true,
  } = options;

  let sanitized = input;

  // Decode HTML entities and URL encoding to catch encoded XSS attempts
  try {
    // Decode URL encoding
    sanitized = decodeURIComponent(sanitized);
  } catch {
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

  // Trim and normalize whitespace if requested
  if (stripWhitespace) {
    sanitized = sanitized.trim().replace(/\s+/g, " ");
  }

  // Truncate if max length specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  // Pre-sanitize dangerous content regardless of allowHTML setting
  sanitized = sanitized
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove dangerous protocols - be more aggressive
    .replace(/javascript\s*:/gi, "blocked:")
    .replace(/vbscript\s*:/gi, "blocked:")
    .replace(/data\s*:\s*text\/html/gi, "blocked:data")
    .replace(/data\s*:\s*application\/javascript/gi, "blocked:data")
    .replace(/data\s*:\s*text\/javascript/gi, "blocked:data")
    // Remove dangerous tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "") // Remove event handlers more aggressively
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^>\s]+/gi, "")
    // Remove dangerous function calls
    .replace(/alert\s*\(/gi, "blocked_alert(")
    .replace(/eval\s*\(/gi, "blocked_eval(")
    .replace(/document\./gi, "blocked_document.")
    .replace(/window\./gi, "blocked_window.")
    // Remove dangerous keywords in general
    .replace(/\bdocument\b/gi, "blocked_document")
    .replace(/\bwindow\b/gi, "blocked_window");

  // If HTML is not allowed, escape all HTML entities
  if (!allowHTML) {
    sanitized = sanitized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  } else {
    // Use DOMPurify for remaining HTML sanitization
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: Object.keys(allowedAttributes),
      KEEP_CONTENT: true,
    });
  }

  return sanitized;
}

// Sanitize email addresses
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  // Basic email format validation and sanitization
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeText(email, { stripWhitespace: true });

  return emailRegex.test(sanitized) ? sanitized.toLowerCase() : "";
}

// Sanitize phone numbers
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== "string") {
    return "";
  }

  // Remove all non-digit and non-common phone characters
  return phone.replace(/[^\d\s\-\(\)\+\.]/g, "").trim();
}

// Sanitize URLs
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const parsed = new URL(url);
    // Only allow HTTP and HTTPS protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

// Sanitize CV data object
export function sanitizeCVData(data: unknown): unknown {
  if (!data || typeof data !== "object") {
    return {};
  }
  const d = data as {
    title?: unknown;
    personalInfo?: {
      name?: unknown;
      email?: unknown;
      phone?: unknown;
      location?: unknown;
      linkedin?: unknown;
      github?: unknown;
    };
    summary?: unknown;
    experience?: unknown;
    education?: unknown;
    skills?: unknown;
    projects?: unknown;
    certifications?: unknown;
  };
  const sanitized: Record<string, unknown> = {};

  // Sanitize title
  if (typeof d.title === "string") {
    sanitized.title = sanitizeText(d.title, { maxLength: 200 });
  }
  // Sanitize personal info
  if (d.personalInfo && typeof d.personalInfo === "object") {
    sanitized.personalInfo = {
      name:
        typeof d.personalInfo.name === "string"
          ? sanitizeText(d.personalInfo.name, { maxLength: 100 })
          : "",
      email:
        typeof d.personalInfo.email === "string"
          ? sanitizeEmail(d.personalInfo.email)
          : "",
      phone:
        typeof d.personalInfo.phone === "string"
          ? sanitizePhone(d.personalInfo.phone)
          : "",
      location:
        typeof d.personalInfo.location === "string"
          ? sanitizeText(d.personalInfo.location, { maxLength: 200 })
          : "",
      linkedin:
        typeof d.personalInfo.linkedin === "string"
          ? sanitizeUrl(d.personalInfo.linkedin)
          : "",
      github:
        typeof d.personalInfo.github === "string"
          ? sanitizeUrl(d.personalInfo.github)
          : "",
    };
  }
  // Sanitize summary
  if (typeof d.summary === "string") {
    sanitized.summary = sanitizeText(d.summary, {
      maxLength: 2000,
      allowHTML: true,
      allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li"],
      allowedAttributes: {},
    });
  }
  // Sanitize experience array
  if (Array.isArray(d.experience)) {
    sanitized.experience = d.experience.map(
      (exp): Record<string, unknown> => ({
        position:
          typeof exp.position === "string"
            ? sanitizeText(exp.position, { maxLength: 200 })
            : "",
        company:
          typeof exp.company === "string"
            ? sanitizeText(exp.company, { maxLength: 200 })
            : "",
        duration:
          typeof exp.duration === "string"
            ? sanitizeText(exp.duration, { maxLength: 100 })
            : "",
        description:
          typeof exp.description === "string"
            ? sanitizeText(exp.description, {
                maxLength: 1000,
                allowHTML: true,
                allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li"],
                allowedAttributes: {},
              })
            : "",
      })
    );
  }
  // Sanitize education array
  if (Array.isArray(d.education)) {
    sanitized.education = d.education.map(
      (edu): Record<string, unknown> => ({
        degree:
          typeof edu.degree === "string"
            ? sanitizeText(edu.degree, { maxLength: 200 })
            : "",
        institution:
          typeof edu.institution === "string"
            ? sanitizeText(edu.institution, { maxLength: 200 })
            : "",
        year:
          typeof edu.year === "string"
            ? sanitizeText(edu.year, { maxLength: 50 })
            : "",
        description:
          typeof edu.description === "string"
            ? sanitizeText(edu.description, {
                maxLength: 1000,
                allowHTML: true,
              })
            : "",
      })
    );
  }
  // Sanitize skills array
  if (Array.isArray(d.skills)) {
    sanitized.skills = d.skills
      .map((skill: unknown) =>
        typeof skill === "string" ? sanitizeText(skill, { maxLength: 100 }) : ""
      )
      .filter(
        (skill: unknown) => typeof skill === "string" && skill.length > 0
      );
  }
  // Sanitize certifications array if present
  if (Array.isArray(d.certifications)) {
    sanitized.certifications = d.certifications.map(
      (cert): Record<string, unknown> => ({
        name:
          typeof cert.name === "string"
            ? sanitizeText(cert.name, { maxLength: 200 })
            : "",
        issuer:
          typeof cert.issuer === "string"
            ? sanitizeText(cert.issuer, { maxLength: 200 })
            : "",
        date:
          typeof cert.date === "string"
            ? sanitizeText(cert.date, { maxLength: 50 })
            : "",
        url: typeof cert.url === "string" ? sanitizeUrl(cert.url) : "",
      })
    );
  }
  // Sanitize projects array if present
  if (Array.isArray(d.projects)) {
    sanitized.projects = d.projects.map(
      (proj): Record<string, unknown> => ({
        name:
          typeof proj.name === "string"
            ? sanitizeText(proj.name, { maxLength: 200 })
            : "",
        description:
          typeof proj.description === "string"
            ? sanitizeText(proj.description, {
                maxLength: 1000,
                allowHTML: true,
                allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li"],
                allowedAttributes: {},
              })
            : "",
        technologies: Array.isArray(proj.technologies)
          ? proj.technologies
              .map((tech: unknown) =>
                typeof tech === "string"
                  ? sanitizeText(tech, { maxLength: 50 })
                  : ""
              )
              .filter(
                (tech: unknown) => typeof tech === "string" && tech.length > 0
              )
          : [],
        url: typeof proj.url === "string" ? sanitizeUrl(proj.url) : "",
      })
    );
  }
  return sanitized;
}

// Validate and sanitize file paths to prevent directory traversal
export function sanitizeFilePath(filePath: string): string {
  if (!filePath || typeof filePath !== "string") {
    return "";
  }

  // Remove any path traversal attempts
  const sanitized = filePath
    .replace(/\.\./g, "") // Remove ..
    .replace(/[\/\\]/g, "") // Remove path separators
    .replace(/[^\w\-\.]/g, ""); // Only allow word chars, hyphens, and dots

  return sanitized;
}

// Rate limiting store (in-memory for development, should use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Simple rate limiting function
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(identifier);

  if (!current) {
    // First request in window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (current.resetTime < now) {
    // Window has expired, reset
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (current.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  // Increment count
  current.count++;
  rateLimitStore.set(identifier, current);

  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime,
  };
}
