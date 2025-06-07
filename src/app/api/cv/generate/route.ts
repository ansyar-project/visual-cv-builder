import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { generatePDF, generateCVHTML } from "@/lib/generate-pdf";
import { v4 as uuidv4 } from "uuid";

// POST - Generate PDF from CV data (without saving to database)
export async function POST(request: NextRequest) {
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

    // Generate HTML from CV data
    const htmlContent = await generateCVHTML(cvData);

    // Generate unique filename
    const filename = `cv-preview-${uuidv4()}`;

    // Generate PDF
    const filePath = await generatePDF(htmlContent, filename);

    // Return the file path for immediate download
    return NextResponse.json({
      message: "PDF generated successfully",
      downloadUrl: filePath,
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
