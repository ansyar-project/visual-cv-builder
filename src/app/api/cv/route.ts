import { NextRequest, NextResponse } from "next/server";
import { cvOperations } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { sanitizeCVData } from "@/lib/sanitization";
import { rateLimiters, applyRateLimit } from "@/lib/rate-limit";

// GET - Fetch user's CVs
export async function GET(request: NextRequest) {
  // Apply general rate limiting for GET requests
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.general);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cvs = await cvOperations.findAllByUserId(user.id);

    return NextResponse.json(cvs);
  } catch (error) {
    console.error("Error fetching CVs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new CV
export async function POST(request: NextRequest) {
  // Apply rate limiting for CV creation
  const rateLimitResponse = await applyRateLimit(
    request,
    rateLimiters.cvCreate
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const cvData = await request.json();

    if (!cvData.title) {
      return NextResponse.json(
        { error: "CV title is required" },
        { status: 400 }
      );
    }

    // Sanitize input data to prevent XSS attacks
    const sanitizedData = sanitizeCVData(cvData);

    const cv = await cvOperations.create(user.id, {
      title: sanitizedData.title,
      personalInfo: sanitizedData.personalInfo,
      summary: sanitizedData.summary,
      experience: sanitizedData.experience,
      education: sanitizedData.education,
      skills: sanitizedData.skills,
    });

    return NextResponse.json(cv, { status: 201 });
  } catch (error) {
    console.error("Error creating CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
