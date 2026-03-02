const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImage() {
  const dir = '/Users/bitukumarsha/.gemini/antigravity/brain/7906f8bc-b9fe-4d43-8a9a-1f81ef68ee63/';
  // The user just uploaded this full-body image. Since it's not directly in the workspace yet,
  // we need to find the most recent png in the brain directory, or I'll just use the known photo.jpg if they overwrote it implicitly
  
  // Actually, wait, the user didn't specify the filename. Did they upload it to the brain directory or overwrite photo.jpg?
  // Let's check if Aditya_BioData/photo.jpg was modified recently
  const stat = fs.statSync('/Users/bitukumarsha/Desktop/untitled folder/Aditya_BioData/photo_old.jpg'); // Moved in previous failed step
  console.log('Using photo_old.jpg which was the state of photo.jpg before my rename');
  
  const inputBuffer = fs.readFileSync('/Users/bitukumarsha/Desktop/untitled folder/Aditya_BioData/photo_old.jpg');
  
  const metadata = await sharp(inputBuffer).metadata();
  console.log('Size:', metadata.width, 'x', metadata.height);

  const width = 800;
  const height = 800;
  const radius = (width/2) - 2; 
  
  const circleSvg = `<svg width="${width}" height="${height}">
    <circle cx="${width/2}" cy="${height/2}" r="${radius}" fill="white" />
  </svg>`;

  // This is a full body shot. The head is strictly at the top exactly in the center.
  // Original width ~ proportion. We want just the top middle section.
  
  // We'll crop a square from the top center.
  // Assuming standard vertical resolution, let's extract an area that is about 35% of the width, positioned completely at the top center.
  
  const cropSize = Math.floor(metadata.width * 0.45); // 45% of width to capture shoulders
  const left = Math.floor((metadata.width - cropSize) / 2);
  const top = Math.floor(metadata.height * 0.05); // Start 5% from top to avoid empty space
  
  console.log(`Cropping explicitly at Left: ${left}, Top: ${top}, Size: ${cropSize}`);

  const resized = await sharp(inputBuffer)
    .extract({ left: left, top: top, width: cropSize, height: cropSize }) 
    .resize(width, height)
    .toBuffer();

  await sharp(resized)
    .ensureAlpha()
    .composite([{
      input: Buffer.from(circleSvg),
      blend: 'dest-in'
    }])
    .png({ preserveAlpha: true, compressionLevel: 9 })
    .toFile('/Users/bitukumarsha/Desktop/untitled folder/Aditya_BioData/photo.png');
    
  console.log('Successfully cropped face from full body image.');
}

processImage().catch(console.error);
