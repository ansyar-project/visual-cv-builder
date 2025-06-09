import { NextRequest, NextResponse } from "next/server";
import { cvOperations } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { sanitizeCVData } from "@/lib/sanitization";
import { rateLimiters, applyRateLimit } from "@/lib/rate-limit";

// GET - Fetch specific CV
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply general rate limiting for GET requests
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.general);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cv = await cvOperations.findByIdAndUserId(id, user.id);

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    return NextResponse.json(cv);
  } catch (error) {
    console.error("Error fetching CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update CV
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting for CV updates
  const rateLimitResponse = await applyRateLimit(
    request,
    rateLimiters.cvUpdate
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { id } = await params;
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

    // Ensure theme is present for CVData
    const sanitizedData = sanitizeCVData(cvData) as import("@/lib/db").CVData;
    if (!sanitizedData.theme) {
      sanitizedData.theme = "default";
    }

    const cv = await cvOperations.update(id, user.id, sanitizedData);

    return NextResponse.json(cv);
  } catch (error) {
    console.error("Error updating CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete CV
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply general rate limiting for DELETE requests
  const rateLimitResponse = await applyRateLimit(request, rateLimiters.general);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await cvOperations.delete(id, user.id);

    return NextResponse.json({ message: "CV deleted successfully" });
  } catch (error) {
    console.error("Error deleting CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
