const puppeteer = require("puppeteer");

/**
 * Generates a PDF from HTML content
 * @param {string} htmlContent - The HTML content to convert to PDF
 * @returns {Promise<Buffer>} - The PDF file as a buffer
 */
async function generatePDF(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Add custom styles for better PDF formatting
    const styledHtml = `
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    padding: 40px;
                }
                h2 {
                    color: #2c3e50;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 10px;
                }
                h3 {
                    color: #34495e;
                    margin-top: 20px;
                }
                ul {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                li {
                    margin: 5px 0;
                }
                .score {
                    font-weight: bold;
                    color: #2980b9;
                }
                .recommendation {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-left: 4px solid #3498db;
                    margin: 20px 0;
                }
            </style>
            ${htmlContent}
        `;

    await page.setContent(styledHtml, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
      printBackground: true,
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

module.exports = {
  generatePDF,
};
