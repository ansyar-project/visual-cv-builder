import puppeteer from "puppeteer";
import path from "path";
import fs from "fs/promises";

export async function generatePDF(
  htmlContent: string,
  filename: string
): Promise<string> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the HTML content
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  // Generate PDF buffer
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "0.5in",
      right: "0.5in",
      bottom: "0.5in",
      left: "0.5in",
    },
  });

  await browser.close();

  // Save to file system
  const filePath = path.join(
    process.cwd(),
    "public",
    "cv-files",
    `${filename}.pdf`
  );
  await fs.writeFile(filePath, pdfBuffer);

  return `/cv-files/${filename}.pdf`;
}

export async function generateCVHTML(
  cvData: any,
  template: string = "default"
): Promise<string> {
  // This is a basic template - you can expand this with more sophisticated templates
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${cvData.personalInfo?.name || "CV"}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #3498db;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .name {
          font-size: 2.5em;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .contact-info {
          font-size: 1.1em;
          color: #7f8c8d;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 1.5em;
          font-weight: bold;
          color: #2c3e50;
          border-bottom: 1px solid #bdc3c7;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .experience-item, .education-item {
          margin-bottom: 20px;
        }
        .item-title {
          font-weight: bold;
          font-size: 1.2em;
          color: #34495e;
        }
        .item-subtitle {
          color: #7f8c8d;
          font-style: italic;
          margin-bottom: 5px;
        }
        .item-description {
          margin-top: 5px;
        }
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .skill-item {
          background: #3498db;
          color: white;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${cvData.personalInfo?.name || ""}</div>
        <div class="contact-info">
          ${cvData.personalInfo?.email || ""} | 
          ${cvData.personalInfo?.phone || ""} | 
          ${cvData.personalInfo?.location || ""}
        </div>
      </div>
      
      ${
        cvData.summary
          ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <p>${cvData.summary}</p>
        </div>
      `
          : ""
      }
      
      ${
        cvData.experience?.length
          ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${cvData.experience
            .map(
              (exp: any) => `
            <div class="experience-item">
              <div class="item-title">${exp.position}</div>
              <div class="item-subtitle">${exp.company} | ${exp.duration}</div>
              <div class="item-description">${exp.description || ""}</div>
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
              (edu: any) => `
            <div class="education-item">
              <div class="item-title">${edu.degree}</div>
              <div class="item-subtitle">${edu.institution} | ${edu.year}</div>
              <div class="item-description">${edu.description || ""}</div>
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
          <div class="section-title">Skills</div>
          <div class="skills-list">
            ${cvData.skills
              .map(
                (skill: string) => `
              <span class="skill-item">${skill}</span>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
    </body>
    </html>
  `;

  return html;
}
