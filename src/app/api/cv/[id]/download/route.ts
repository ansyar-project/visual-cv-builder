import { NextRequest, NextResponse } from "next/server";
import { cvOperations } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { rateLimiters, applyRateLimit } from "@/lib/rate-limit";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting for file downloads
  const rateLimitResponse = await applyRateLimit(
    request,
    rateLimiters.download
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

    const cv = await cvOperations.findByIdAndUserId(id, user.id);

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    if (!cv.filePath) {
      return NextResponse.json(
        {
          error: "PDF not generated",
          message: "Please generate the PDF first",
        },
        { status: 404 }
      );
    }

    // Security: Validate file path to prevent directory traversal
    const normalizedPath = path.normalize(cv.filePath);
    if (
      !normalizedPath.startsWith("/cv-files/") ||
      normalizedPath.includes("..")
    ) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", normalizedPath);

    try {
      // Check if file exists and get stats
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const fileBuffer = await fs.readFile(filePath);

      // Generate safe filename for download
      const safeTitle = cv.title.replace(/[^a-zA-Z0-9\-_\s]/g, "").trim();
      const downloadFilename = `${safeTitle || "CV"}.pdf`;

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${downloadFilename}"`,
          "Content-Length": stats.size.toString(),
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    } catch (fileError) {
      console.error("File read error:", fileError);
      return NextResponse.json(
        {
          error: "File not found",
          message: "The PDF file may have been deleted or moved",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error downloading CV:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while downloading the CV",
      },
      { status: 500 }
    );
  }
}
