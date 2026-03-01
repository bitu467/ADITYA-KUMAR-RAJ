const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

(async () => {
    let scale = 1.0;
    const outputPath = 'Aditya_Kumar_Raj_BioData.pdf';

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const htmlPath = path.resolve(__dirname, 'Aditya_BioData/index.html');
        await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

        await page.evaluate(() => {
            const img = document.querySelector('img[src="photo.png"]');
            if(img) {
               img.style.backgroundColor = 'white';
            }
        });

        let pages = 2; // start with an assumption of > 1 page to enter loop

        while (pages > 1 && scale > 0.3) { // prevent infinite loop
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

            // Check the number of pages
            const pdfBytes = fs.readFileSync(outputPath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            pages = pdfDoc.getPageCount();

            if (pages > 1) {
                console.log(`Generated PDF had ${pages} pages. Reducing scale...`);
                scale -= 0.05; // reduce scale and try again
            } else {
                console.log(`Success! PDF fits on 1 page with scale: ${scale}`);
            }
        }

        await browser.close();

        // Final sanity check
        const pdfBytes = fs.readFileSync(outputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        console.log('Final page count:', pdfDoc.getPageCount());

    } catch (error) {
        console.error('Error generating PDF:', error);
    }
})();
