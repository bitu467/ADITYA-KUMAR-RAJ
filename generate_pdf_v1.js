const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

(async () => {
    // Modify index.html to point to photo_v1.png
    const htmlPath = path.resolve(__dirname, 'Aditya_BioData/index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace('src="photo.png"', 'src="photo_v1.png"');
    fs.writeFileSync(htmlPath, htmlContent);

    let scale = 1.0;
    const outputPath = 'Aditya_Kumar_Raj_BioData_OriginalPhoto.pdf';

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

        let pages = 2;

        while (pages > 1 && scale > 0.3) {
            console.log(`Trying to generate PDF with scale: ${scale}`);
            await page.pdf({
                path: outputPath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px'
                },
                scale: scale
            });

            const pdfBytes = fs.readFileSync(outputPath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            pages = pdfDoc.getPageCount();

            if (pages > 1) {
                console.log(`Generated PDF had ${pages} pages. Reducing scale...`);
                scale -= 0.05;
            } else {
                console.log(`Success! PDF fits on 1 page with scale: ${scale}`);
            }
        }

        await browser.close();
        console.log('Final page count for original photo PDF:', pages);

    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        // Revert index.html back to photo.png
        htmlContent = fs.readFileSync(htmlPath, 'utf8');
        htmlContent = htmlContent.replace('src="photo_v1.png"', 'src="photo.png"');
        fs.writeFileSync(htmlPath, htmlContent);
    }
})();
