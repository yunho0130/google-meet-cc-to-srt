/**
 * Icon Generator Script
 *
 * This script generates placeholder icons for the extension.
 * For production, use the generate-icons.html file in a browser
 * or create custom icons with a design tool.
 *
 * To generate icons with canvas:
 * 1. npm install canvas
 * 2. node scripts/generate-icons.js
 *
 * Alternative: Open scripts/generate-icons.html in a browser
 * and download the generated icons.
 */

const fs = require('fs');
const path = require('path');

// Try to use canvas if available
let createCanvas;
try {
  createCanvas = require('canvas').createCanvas;
} catch (e) {
  console.log('Canvas module not found. Creating placeholder icons...');
  createCanvas = null;
}

const sizes = [16, 32, 48, 128];
const outputDir = path.join(__dirname, '..', 'assets', 'icons');

function drawIcon(ctx, size) {
  const scale = size / 128;

  // Background gradient (simplified to solid color for canvas)
  ctx.fillStyle = '#1a73e8';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.47, 0, Math.PI * 2);
  ctx.fill();

  // Video camera body
  ctx.fillStyle = 'white';
  const bodyX = 24 * scale;
  const bodyY = 42 * scale;
  const bodyW = 56 * scale;
  const bodyH = 44 * scale;
  const radius = 8 * scale;

  // Simple rounded rect
  ctx.beginPath();
  ctx.moveTo(bodyX + radius, bodyY);
  ctx.lineTo(bodyX + bodyW - radius, bodyY);
  ctx.quadraticCurveTo(bodyX + bodyW, bodyY, bodyX + bodyW, bodyY + radius);
  ctx.lineTo(bodyX + bodyW, bodyY + bodyH - radius);
  ctx.quadraticCurveTo(bodyX + bodyW, bodyY + bodyH, bodyX + bodyW - radius, bodyY + bodyH);
  ctx.lineTo(bodyX + radius, bodyY + bodyH);
  ctx.quadraticCurveTo(bodyX, bodyY + bodyH, bodyX, bodyY + bodyH - radius);
  ctx.lineTo(bodyX, bodyY + radius);
  ctx.quadraticCurveTo(bodyX, bodyY, bodyX + radius, bodyY);
  ctx.closePath();
  ctx.fill();

  // Video camera lens (triangle)
  ctx.beginPath();
  ctx.moveTo(80 * scale, 52 * scale);
  ctx.lineTo(100 * scale, 38 * scale);
  ctx.lineTo(100 * scale, 90 * scale);
  ctx.lineTo(80 * scale, 76 * scale);
  ctx.closePath();
  ctx.fill();

  // Sound waves
  ctx.strokeStyle = '#1a73e8';
  ctx.lineWidth = Math.max(1, 3 * scale);
  ctx.lineCap = 'round';

  // Draw simple wave lines
  const waveX = [40, 51, 63];
  const waveH = [8, 12, 16];

  waveX.forEach((x, i) => {
    ctx.beginPath();
    ctx.moveTo(x * scale, (66 - waveH[i]) * scale);
    ctx.lineTo(x * scale, (66 + waveH[i]) * scale);
    ctx.stroke();
  });
}

if (createCanvas) {
  // Generate icons using canvas
  sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    drawIcon(ctx, size);

    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(outputDir, `icon${size}.png`);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Generated: ${outputPath}`);
  });

  console.log('All icons generated successfully!');
} else {
  // Create simple placeholder PNGs using minimal 1x1 colored pixels
  // These are just placeholders - use the HTML generator for real icons
  console.log('');
  console.log('To generate proper icons:');
  console.log('1. Open scripts/generate-icons.html in a browser');
  console.log('2. Right-click each canvas and save as PNG');
  console.log('3. Or install canvas: npm install canvas && node scripts/generate-icons.js');
  console.log('');

  // Create minimal placeholder files
  // This is a 1x1 blue pixel PNG encoded in base64
  const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkaM/4HwADggF/sVVHMgAAAABJRU5ErkJggg==';
  const placeholderBuffer = Buffer.from(placeholderBase64, 'base64');

  sizes.forEach(size => {
    const outputPath = path.join(outputDir, `icon${size}.png`);
    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, placeholderBuffer);
      console.log(`Created placeholder: ${outputPath}`);
    }
  });
}
