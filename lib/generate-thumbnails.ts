/* eslint-disable @typescript-eslint/no-unused-vars */
import puppeteer from 'puppeteer'; 

export async function generateThumbnail(htmlContent: string, documentId: string): Promise<string> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], 
    });

    const page = await browser.newPage();
    
    // Set viewport to match thumbnail dimensions
    await page.setViewport({ width: 400, height: 300 });
    
    // Create a simple HTML page that renders the content (mimic your /document page styling minimally)
    // Customize this HTML template to match your edit page's content rendering (e.g., add your CSS classes)
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              margin: 0px; 
              padding: 16px; 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              background: white; 
              overflow: hidden; 
            }
            .document-content { 
              width: 100%; 
              height: 100%; 
              box-sizing: border-box; 
              /* Add your edit page's global styles here if needed */
            }
          </style>
        </head>
        <body>
          <div class="document-content">${htmlContent}</div>
        </body>
      </html>
    `;
    
    // Set content and wait for render
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    });

    // Convert to base64 data URL for DB storage
    const base64 = (screenshot as Buffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return dataUrl;
  } finally {
    if (browser) await browser.close();
  }
}