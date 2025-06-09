import { NextRequest, NextResponse } from "next/server";
import { cvOperations } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import {
  generatePDF,
  generateCVHTML,
  validateCVData,
} from "@/lib/generate-pdf";
import { sanitizeCVData } from "@/lib/sanitization";
import { rateLimiters, applyRateLimit } from "@/lib/rate-limit";
import { v4 as uuidv4 } from "uuid";

// POST - Generate PDF for CV
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting for PDF generation
  const rateLimitResponse = await applyRateLimit(
    request,
    rateLimiters.pdfGenerate
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

    // Sanitize CV data before processing
    const sanitizedContent = sanitizeCVData(cv.content);

    // Validate CV data before generation
    const validation = validateCVData(sanitizedContent);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Invalid CV data",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Get generation options from request body
    const body = await request.json().catch(() => ({}));
    const options = {
      format: body.format || "A4",
      quality: body.quality || "high",
      template: cv.template || "default",
      includeBackground: body.includeBackground !== false,
    }; // Generate HTML from CV data using sanitized content
    const htmlContent = await generateCVHTML(sanitizedContent);

    // Generate unique filename
    const filename = `cv-${cv.id}-${uuidv4()}`;

    // Generate PDF with enhanced options
    const result = await generatePDF(htmlContent, filename, options);

    if (!result.success) {
      console.error("PDF generation failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Failed to generate PDF" },
        { status: 500 }
      );
    }

    // Update CV with file path
    if (result.filePath) {
      await cvOperations.updateFilePath(cv.id, result.filePath);
    }

    return NextResponse.json({
      message: "PDF generated successfully",
      downloadUrl: `/api/cv/${cv.id}/download`,
      filePath: result.filePath,
      fileSize: result.fileSize,
      generationTime: result.generationTime,
      quality: options.quality,
      format: options.format,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
