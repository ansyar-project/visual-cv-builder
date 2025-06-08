import { NextRequest, NextResponse } from "next/server";
import { userOperations } from "@/lib/db";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitization";
import { rateLimiters, applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Apply rate limiting for user registration
  const rateLimitResponse = await applyRateLimit(
    request,
    rateLimiters.register
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sanitize input data to prevent XSS attacks
    const sanitizedName = sanitizeText(name, { maxLength: 100 });
    const sanitizedEmail = sanitizeEmail(email);

    if (!sanitizedName || !sanitizedEmail) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const userExists = await userOperations.existsByEmail(sanitizedEmail);

    if (userExists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    } // Create user
    const user = await userOperations.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password,
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
