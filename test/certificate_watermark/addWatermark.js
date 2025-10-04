const sharp = require('sharp');

const inputImage = 'certificate.jpg'; // your certificate image
const outputImage = 'certificate_watermarked.jpg';
const issuingAuthority = 'XYZ Authority';
const timestamp = new Date().toLocaleString(); // e.g., "10/4/2025, 4:30 PM"

async function addDiagonalWatermark() {
  try {
    const image = sharp(inputImage);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;

    // Adjust font size relative to image width
    const fontSize = Math.floor(width / 12);

    // Precompute Y positions for two lines
    const yLine1 = height / 2 - fontSize / 2;
    const yLine2 = height / 2 + fontSize / 1.5;

    // Create SVG watermark with 2 lines
    const svg = `
      <svg width="${width}" height="${height}">
        <text 
          x="${width / 2}" 
          y="${yLine1}" 
          font-size="${fontSize}" 
          font-family="Arial" 
          font-weight="bold" 
          fill="rgba(0,0,0,0.15)" 
          text-anchor="middle"
          dominant-baseline="middle"
          transform="rotate(-45 ${width / 2} ${height / 2})"
        >
          ${issuingAuthority}
        </text>
        <text 
          x="${width / 2}" 
          y="${yLine2}" 
          font-size="${Math.floor(fontSize*0.8)}" 
          font-family="Arial" 
          font-weight="bold" 
          fill="rgba(0,0,0,0.15)" 
          text-anchor="middle"
          dominant-baseline="middle"
          transform="rotate(-45 ${width / 2} ${height / 2})"
        >
          ${timestamp}
        </text>
      </svg>
    `;

    // Composite watermark onto image
    await image
      .composite([{ input: Buffer.from(svg), gravity: 'center' }])
      .toFile(outputImage);

    console.log('Beautiful diagonal watermark added successfully!');
  } catch (err) {
    console.error('Error adding watermark:', err);
  }
}

addDiagonalWatermark();
