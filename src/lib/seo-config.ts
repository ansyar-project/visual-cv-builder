/**
 * SEO Configuration Verification Script
 * Run this to check if all required environment variables are properly configured
 */

interface EnvConfig {
  NEXT_PUBLIC_BASE_URL: string;
  NEXT_PUBLIC_SITE_NAME: string;
  NEXT_PUBLIC_GA_ID: string;
  NEXT_PUBLIC_TWITTER_HANDLE: string;
  NEXT_PUBLIC_FACEBOOK_PAGE: string;
  NEXT_PUBLIC_LINKEDIN_COMPANY: string;
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  NEXT_PUBLIC_BING_SITE_VERIFICATION?: string;
}

export function validateSEOConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const required = [
    "NEXT_PUBLIC_BASE_URL",
    "NEXT_PUBLIC_SITE_NAME",
    "NEXT_PUBLIC_GA_ID",
    "NEXT_PUBLIC_TWITTER_HANDLE",
    "NEXT_PUBLIC_FACEBOOK_PAGE",
    "NEXT_PUBLIC_LINKEDIN_COMPANY",
  ];

  // Optional but recommended
  const optional = [
    "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION",
    "NEXT_PUBLIC_BING_SITE_VERIFICATION",
  ];

  // Check required variables
  required.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      errors.push(`Missing required environment variable: ${varName}`);
    } else if (value.includes("your-domain.com") || value === "G-XXXXXXXXXX") {
      errors.push(`Please update placeholder value for: ${varName}`);
    }
  });

  // Check optional variables
  optional.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value === "") {
      warnings.push(`Optional environment variable not set: ${varName}`);
    }
  });

  // URL validation
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl && !baseUrl.startsWith("http")) {
    errors.push("NEXT_PUBLIC_BASE_URL must start with http:// or https://");
  }

  // GA ID validation
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (gaId && !gaId.startsWith("G-") && gaId !== "G-XXXXXXXXXX") {
    warnings.push('NEXT_PUBLIC_GA_ID should start with "G-"');
  }

  // Twitter handle validation
  const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE;
  if (twitterHandle && !twitterHandle.startsWith("@")) {
    warnings.push('NEXT_PUBLIC_TWITTER_HANDLE should start with "@"');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getEnvConfig(): Partial<EnvConfig> {
  return {
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    NEXT_PUBLIC_SITE_NAME:
      process.env.NEXT_PUBLIC_SITE_NAME || "VisualCV Builder",
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX",
    NEXT_PUBLIC_TWITTER_HANDLE:
      process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@visualcvbuilder",
    NEXT_PUBLIC_FACEBOOK_PAGE:
      process.env.NEXT_PUBLIC_FACEBOOK_PAGE || "visualcvbuilder",
    NEXT_PUBLIC_LINKEDIN_COMPANY:
      process.env.NEXT_PUBLIC_LINKEDIN_COMPANY || "visualcvbuilder",
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    NEXT_PUBLIC_BING_SITE_VERIFICATION:
      process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  };
}

// Development helper
if (process.env.NODE_ENV === "development") {
  console.log("🔍 SEO Configuration Check:");
  const validation = validateSEOConfig();

  if (validation.isValid) {
    console.log("✅ All required SEO environment variables are configured");
  } else {
    console.log("❌ SEO configuration issues found:");
    validation.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.log("⚠️  SEO configuration warnings:");
    validation.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  console.log("\n📊 Current configuration:");
  console.table(getEnvConfig());
}
