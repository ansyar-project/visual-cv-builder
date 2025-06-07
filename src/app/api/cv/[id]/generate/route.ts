import { NextRequest, NextResponse } from "next/server";
import { cvOperations } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { generatePDF, generateCVHTML } from "@/lib/generate-pdf";
import { v4 as uuidv4 } from "uuid";

// POST - Generate PDF for CV
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Generate HTML from CV data
    const htmlContent = await generateCVHTML(cv.content, cv.template);

    // Generate unique filename
    const filename = `cv-${cv.id}-${uuidv4()}`;

    // Generate PDF
    const filePath = await generatePDF(htmlContent, filename); // Update CV with file path
    await cvOperations.updateFilePath(cv.id, filePath);

    return NextResponse.json({
      message: "PDF generated successfully",
      downloadUrl: `/api/cv/${cv.id}/download`,
      filePath: filePath,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
