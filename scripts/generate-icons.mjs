#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sizes = [16, 32, 48, 128];
const rootDir = process.cwd();
const iconsDir = path.join(rootDir, 'icons');

const iconSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="16" y1="12" x2="112" y2="116" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0EA5E9"/>
      <stop offset="1" stop-color="#2563EB"/>
    </linearGradient>
  </defs>

  <rect x="8" y="8" width="112" height="112" rx="24" fill="url(#bg)"/>

  <path d="M44 30C44 27.7909 45.7909 26 48 26H80C82.2091 26 84 27.7909 84 30V92L64 79.5L44 92V30Z" fill="white" fill-opacity="0.95"/>

  <path d="M28 61C29.8 50.2 39.5 42 51 42C56.2 42 60.9 43.7 64.7 46.6L61 50.3C60.2 51.1 60.8 52.5 61.9 52.5H75.8C76.5 52.5 77 52 77 51.3V37.4C77 36.3 75.6 35.7 74.8 36.5L70.8 40.5C65.6 36.1 58.9 33.5 51.6 33.5C35.8 33.5 22.7 44.6 20.6 59.6C20.4 61.1 21.6 62.5 23.2 62.5H26.8C27.4 62.5 27.9 62 28 61Z" fill="#BAE6FD"/>

  <path d="M100 67C98.2 77.8 88.5 86 77 86C71.8 86 67.1 84.3 63.3 81.4L67 77.7C67.8 76.9 67.2 75.5 66.1 75.5H52.2C51.5 75.5 51 76 51 76.7V90.6C51 91.7 52.4 92.3 53.2 91.5L57.2 87.5C62.4 91.9 69.1 94.5 76.4 94.5C92.2 94.5 105.3 83.4 107.4 68.4C107.6 66.9 106.4 65.5 104.8 65.5H101.2C100.6 65.5 100.1 66 100 67Z" fill="#DBF4FF"/>
</svg>
`;

async function generateIcon(size) {
  const outputPath = path.join(iconsDir, `icon${size}.png`);
  await sharp(Buffer.from(iconSvg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Generated ${path.relative(rootDir, outputPath)}`);
}

async function main() {
  fs.mkdirSync(iconsDir, { recursive: true });
  await Promise.all(sizes.map((size) => generateIcon(size)));
}

main().catch((error) => {
  console.error(`Icon generation failed: ${error.message}`);
  process.exit(1);
});

