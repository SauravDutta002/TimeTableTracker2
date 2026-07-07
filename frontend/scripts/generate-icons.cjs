const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

// Full-bleed icon: two overlapping gradient "person" circles on black,
// representing you + a friend, with a thin clock ring on top.
const iconSvg = (contentScale, contentOffsetY = 0) => `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0a0a0a"/>
      <stop offset="1" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="g1" x1="60" y1="170" x2="340" y2="450" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fb7185"/>
      <stop offset="0.5" stop-color="#ec4899"/>
      <stop offset="1" stop-color="#c026d3"/>
    </linearGradient>
    <linearGradient id="g2" x1="172" y1="170" x2="452" y2="450" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#38bdf8"/>
      <stop offset="0.5" stop-color="#06b6d4"/>
      <stop offset="1" stop-color="#10b981"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(256 ${256 + contentOffsetY}) scale(${contentScale}) translate(-256 -256)">
    <circle cx="194" cy="256" r="120" fill="url(#g1)"/>
    <circle cx="318" cy="256" r="120" fill="url(#g2)"/>
  </g>
</svg>`;

const targets = [
  { name: "icon-192.png", size: 192, svg: iconSvg(1) },
  { name: "icon-512.png", size: 512, svg: iconSvg(1) },
  { name: "maskable-512.png", size: 512, svg: iconSvg(0.62, 10) },
  { name: "apple-touch-icon.png", size: 180, svg: iconSvg(0.92) },
  { name: "favicon-32.png", size: 32, svg: iconSvg(1) },
  { name: "favicon-16.png", size: 16, svg: iconSvg(1) },
];

(async () => {
  for (const t of targets) {
    await sharp(Buffer.from(t.svg)).resize(t.size, t.size).png().toFile(path.join(outDir, t.name));
    console.log("wrote", t.name);
  }
})();
