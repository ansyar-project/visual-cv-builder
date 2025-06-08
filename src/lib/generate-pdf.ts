import puppeteer, { Browser } from "puppeteer";
import path from "path";
import fs from "fs/promises";

// PDF generation options interface
export interface PDFGenerationOptions {
  format?: "A4" | "Letter" | "Legal";
  template?: string;
  quality?: "low" | "medium" | "high";
  includeBackground?: boolean;
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

// Enhanced PDF generation result
export interface PDFResult {
  success: boolean;
  filePath?: string;
  downloadUrl?: string;
  fileSize?: number;
  error?: string;
  generationTime?: number;
}

export async function generatePDF(
  htmlContent: string,
  filename: string,
  options: PDFGenerationOptions = {},
  retries: number = 3
): Promise<PDFResult> {
  const startTime = Date.now();
  let browser: Browser | null = null;

  // Default options
  const {
    format = "A4",
    quality = "high",
    includeBackground = true,
    margins = {
      top: "0.5in",
      right: "0.5in",
      bottom: "0.5in",
      left: "0.5in",
    },
  } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Launch browser with optimized settings
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
        ],
        timeout: 30000,
      });

      const page = await browser.newPage();

      // Set viewport based on quality setting
      const viewportConfig = {
        low: { width: 800, height: 1100, deviceScaleFactor: 1 },
        medium: { width: 1000, height: 1400, deviceScaleFactor: 1.5 },
        high: { width: 1200, height: 1600, deviceScaleFactor: 2 },
      };

      await page.setViewport(viewportConfig[quality]);

      // Set content with enhanced options
      await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Wait for any custom fonts or images to load
      await page.evaluateHandle("document.fonts.ready");

      // Ensure cv-files directory exists
      const cvFilesDir = path.join(process.cwd(), "public", "cv-files");
      await fs.mkdir(cvFilesDir, { recursive: true });

      // Generate PDF with enhanced options
      const pdfBuffer = await page.pdf({
        format,
        printBackground: includeBackground,
        margin: margins,
        timeout: 30000,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
      });

      await browser.close();
      browser = null;

      // Save file
      const filePath = path.join(cvFilesDir, `${filename}.pdf`);
      await fs.writeFile(filePath, pdfBuffer);

      // Get file stats
      const stats = await fs.stat(filePath);
      const generationTime = Date.now() - startTime;

      return {
        success: true,
        filePath: `/cv-files/${filename}.pdf`,
        downloadUrl: `/cv-files/${filename}.pdf`,
        fileSize: stats.size,
        generationTime,
      };
    } catch (error) {
      console.error(`PDF generation attempt ${attempt} failed:`, error);

      if (browser) {
        await browser.close().catch(() => {});
        browser = null;
      }

      if (attempt === retries) {
        return {
          success: false,
          error: `PDF generation failed after ${retries} attempts: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          generationTime: Date.now() - startTime,
        };
      }

      // Exponential backoff for retries
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
      );
    }
  }

  return {
    success: false,
    error: "PDF generation failed",
    generationTime: Date.now() - startTime,
  };
}

// Legacy function for backward compatibility
export async function generatePDFLegacy(
  htmlContent: string,
  filename: string,
  retries: number = 3
): Promise<string> {
  const result = await generatePDF(htmlContent, filename, {}, retries);

  if (!result.success || !result.filePath) {
    throw new Error(result.error || "PDF generation failed");
  }

  return result.filePath;
}

export async function generateCVHTML(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cvData: any
): Promise<string> {
  // Sanitize input data
  const sanitizeText = (text: string) =>
    text ? text.replace(/[<>]/g, "") : "";

  // Enhanced HTML template with better styling and responsiveness
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${sanitizeText(cvData.personalInfo?.name || "CV")}</title>
      <style>
        @page {
          margin: 0.5in;
          size: A4;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          font-size: 14px;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #3498db;
          padding-bottom: 20px;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 30px 20px 20px;
          border-radius: 8px 8px 0 0;
        }
        
        .name {
          font-size: 2.5em;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        
        .contact-info {
          font-size: 1.1em;
          color: #7f8c8d;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .section {
          margin-bottom: 35px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 1.4em;
          font-weight: 600;
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 8px;
          margin-bottom: 20px;
          position: relative;
        }
        
        .section-title::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 50px;
          height: 2px;
          background: #e74c3c;
        }
        
        .experience-item, .education-item {
          margin-bottom: 25px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #3498db;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .item-title {
          font-weight: 600;
          font-size: 1.2em;
          color: #2c3e50;
          margin-bottom: 5px;
        }
        
        .item-subtitle {
          color: #7f8c8d;
          font-style: italic;
          margin-bottom: 10px;
          font-size: 1em;
        }
        
        .item-description {
          margin-top: 10px;
          line-height: 1.7;
          color: #555;
        }
        
        .summary {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 8px;
          border-left: 4px solid #27ae60;
          font-style: italic;
          font-size: 1.05em;
          line-height: 1.7;
          color: #2c3e50;
        }
        
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 15px;
        }
        
        .skill-item {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
        }
        
        /* Print optimizations */
        @media print {
          body {
            font-size: 12px;
            line-height: 1.4;
          }
          
          .header {
            background: none !important;
            border-bottom: 2px solid #3498db;
          }
          
          .experience-item, .education-item {
            background: none !important;
            box-shadow: none !important;
            border: 1px solid #ddd;
          }
          
          .summary {
            background: none !important;
            border: 1px solid #27ae60;
          }
          
          .skill-item {
            background: #3498db !important;
            box-shadow: none !important;
          }
        }
        
        /* Ensure no page breaks in the middle of items */
        .experience-item, .education-item, .summary {
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${sanitizeText(cvData.personalInfo?.name || "")}</div>
        <div class="contact-info">
          ${
            cvData.personalInfo?.email
              ? `<span class="contact-item">📧 ${sanitizeText(
                  cvData.personalInfo.email
                )}</span>`
              : ""
          }
          ${
            cvData.personalInfo?.phone
              ? `<span class="contact-item">📱 ${sanitizeText(
                  cvData.personalInfo.phone
                )}</span>`
              : ""
          }
          ${
            cvData.personalInfo?.location
              ? `<span class="contact-item">📍 ${sanitizeText(
                  cvData.personalInfo.location
                )}</span>`
              : ""
          }
          ${
            cvData.personalInfo?.website
              ? `<span class="contact-item">🌐 ${sanitizeText(
                  cvData.personalInfo.website
                )}</span>`
              : ""
          }
        </div>
      </div>
      
      ${
        cvData.summary
          ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="summary">${sanitizeText(cvData.summary)}</div>
        </div>
      `
          : ""
      }
      
      ${
        cvData.experience?.length
          ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>          ${cvData.experience
            .map(
              (exp: {
                position?: string;
                title?: string;
                company?: string;
                duration?: string;
                period?: string;
                location?: string;
                description?: string;
              }) => `
            <div class="experience-item">
              <div class="item-title">${sanitizeText(
                exp.position || exp.title || ""
              )}</div>
              <div class="item-subtitle">
                ${sanitizeText(exp.company || "")}                ${
                exp.duration || exp.period
                  ? ` • ${sanitizeText(exp.duration || exp.period || "")}`
                  : ""
              }
                ${exp.location ? ` • ${sanitizeText(exp.location || "")}` : ""}
              </div>
              ${
                exp.description
                  ? `<div class="item-description">${sanitizeText(
                      exp.description
                    )}</div>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      
      ${
        cvData.education?.length
          ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${cvData.education
            .map(
              (edu: {
                degree?: string;
                title?: string;
                institution?: string;
                school?: string;
                year?: string;
                period?: string;
                location?: string;
                gpa?: string;
                description?: string;
              }) => `
            <div class="education-item">
              <div class="item-title">${sanitizeText(
                edu.degree || edu.title || ""
              )}</div>
              <div class="item-subtitle">
                ${sanitizeText(
                  edu.institution || edu.school || ""
                )}                ${
                edu.year || edu.period
                  ? ` • ${sanitizeText(edu.year || edu.period || "")}`
                  : ""
              }                ${
                edu.location ? ` • ${sanitizeText(edu.location || "")}` : ""
              }
                ${edu.gpa ? ` • GPA: ${sanitizeText(edu.gpa || "")}` : ""}
              </div>
              ${
                edu.description
                  ? `<div class="item-description">${sanitizeText(
                      edu.description
                    )}</div>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      
      ${
        cvData.skills?.length
          ? `
        <div class="section">
          <div class="section-title">Skills & Technologies</div>
          <div class="skills-list">
            ${cvData.skills
              .map(
                (skill: string) => `
              <span class="skill-item">${sanitizeText(skill)}</span>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
      
      ${
        cvData.certifications?.length
          ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          ${cvData.certifications
            .map(
              (cert: {
                name?: string;
                title?: string;
                issuer?: string;
                organization?: string;
                date?: string;
                year?: string;
                credentialId?: string;
                url?: string;
                description?: string;
              }) => `
            <div class="education-item">
              <div class="item-title">${sanitizeText(
                cert.name || cert.title || ""
              )}</div>
              <div class="item-subtitle">
                ${sanitizeText(
                  cert.issuer || cert.organization || ""
                )}                ${
                cert.date || cert.year
                  ? ` • ${sanitizeText(cert.date || cert.year || "")}`
                  : ""
              }
                ${
                  cert.credentialId
                    ? ` • ID: ${sanitizeText(cert.credentialId)}`
                    : ""
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      
      ${
        cvData.projects?.length
          ? `
        <div class="section">
          <div class="section-title">Notable Projects</div>
          ${cvData.projects
            .map(
              (project: {
                name?: string;
                title?: string;
                technologies?: string;
                period?: string;
                description?: string;
                url?: string;
              }) => `
            <div class="experience-item">
              <div class="item-title">${sanitizeText(
                project.name || project.title || ""
              )}</div>
              <div class="item-subtitle">
                ${
                  project.technologies
                    ? `Technologies: ${sanitizeText(project.technologies)}`
                    : ""
                }
                ${project.period ? ` • ${sanitizeText(project.period)}` : ""}
              </div>
              ${
                project.description
                  ? `<div class="item-description">${sanitizeText(
                      project.description
                    )}</div>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
    </body>
    </html>
  `;

  return html;
}

// Utility function to validate CV data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateCVData(cvData: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!cvData.personalInfo?.name) {
    errors.push("Name is required");
  }

  if (!cvData.personalInfo?.email) {
    errors.push("Email is required");
  }

  if (
    cvData.personalInfo?.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cvData.personalInfo.email)
  ) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Utility function to sanitize HTML content
export function sanitizeHTML(html: string): string {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
