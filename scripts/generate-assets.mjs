import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgLogo = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="40%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#0f243d" />
      <stop offset="50%" stop-color="#070f1e" />
      <stop offset="100%" stop-color="#02060d" />
    </radialGradient>

    <!-- Ambient Glow behind S -->
    <radialGradient id="ambientGlow" cx="50%" cy="50%" r="45%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.45" />
      <stop offset="45%" stop-color="#2563eb" stop-opacity="0.20" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- 3D Shadow filter -->
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="15" stdDeviation="15" flood-color="#00050f" flood-opacity="0.85" />
    </filter>

    <!-- Glass Body Fill Gradient -->
    <linearGradient id="glassFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.38" />
      <stop offset="40%" stop-color="#0ea5e9" stop-opacity="0.18" />
      <stop offset="80%" stop-color="#1e3a8a" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.30" />
    </linearGradient>

    <!-- Glass Rim Stroke Gradient -->
    <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="30%" stop-color="#38bdf8" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#0ea5e9" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.85" />
    </linearGradient>

    <!-- Sparkle Glow -->
    <filter id="sparkleGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" fill="url(#bgGrad)" />

  <!-- Subtle Tech Grid -->
  <g stroke="#38bdf8" stroke-opacity="0.035" stroke-width="1">
    <line x1="32" y1="0" x2="32" y2="512" /><line x1="64" y1="0" x2="64" y2="512" />
    <line x1="96" y1="0" x2="96" y2="512" /><line x1="128" y1="0" x2="128" y2="512" />
    <line x1="160" y1="0" x2="160" y2="512" /><line x1="192" y1="0" x2="192" y2="512" />
    <line x1="224" y1="0" x2="224" y2="512" /><line x1="256" y1="0" x2="256" y2="512" />
    <line x1="288" y1="0" x2="288" y2="512" /><line x1="320" y1="0" x2="320" y2="512" />
    <line x1="352" y1="0" x2="352" y2="512" /><line x1="384" y1="0" x2="384" y2="512" />
    <line x1="416" y1="0" x2="416" y2="512" /><line x1="448" y1="0" x2="448" y2="512" />
    <line x1="480" y1="0" x2="480" y2="512" />
    
    <line x1="0" y1="32" x2="512" y2="32" /><line x1="0" y1="64" x2="512" y2="64" />
    <line x1="0" y1="96" x2="512" y2="96" /><line x1="0" y1="128" x2="512" y2="128" />
    <line x1="0" y1="160" x2="512" y2="160" /><line x1="0" y1="192" x2="512" y2="192" />
    <line x1="0" y1="224" x2="512" y2="224" /><line x1="0" y1="256" x2="512" y2="256" />
    <line x1="0" y1="288" x2="512" y2="288" /><line x1="0" y1="320" x2="512" y2="320" />
    <line x1="0" y1="352" x2="512" y2="352" /><line x1="0" y1="384" x2="512" y2="384" />
    <line x1="0" y1="416" x2="512" y2="416" /><line x1="0" y1="448" x2="512" y2="448" />
    <line x1="0" y1="480" x2="512" y2="480" />
  </g>

  <!-- Ambient Glow -->
  <rect x="30" y="30" width="452" height="452" fill="url(#ambientGlow)" />

  <!-- 3D Glass S Mark -->
  <g filter="url(#dropShadow)">
    <!-- Main Glass Body Fill & Rim -->
    <path d="M 326, 146 C 326, 91 196, 91 196, 156 C 196, 206 321, 216 321, 301 C 321, 411 181, 411 181, 356 C 181, 336 201, 331 216, 351 C 226, 366 281, 371 281, 301 C 281, 211 156, 221 156, 151 C 156, 61 326, 61 326, 146 Z" 
          fill="url(#glassFill)" 
          stroke="url(#rimGrad)" 
          stroke-width="4.5" 
          stroke-linejoin="round" />

    <!-- Inner Caustic Reflection Highlights -->
    <path d="M 306, 121 C 306, 101 211, 101 211, 156 C 211, 191 301, 201 301, 301" 
          fill="none" 
          stroke="#bae6fd" 
          stroke-opacity="0.75" 
          stroke-width="3" 
          stroke-linecap="round" />

    <!-- Bottom Arc Accent -->
    <path d="M 301, 301 C 301, 381 201, 381 201, 351" 
          fill="none" 
          stroke="#38bdf8" 
          stroke-opacity="0.45" 
          stroke-width="2.5" 
          stroke-linecap="round" />

    <!-- Digital Light Flares -->
    <circle cx="318" cy="124" r="3" fill="#ffffff" filter="url(#sparkleGlow)" />
    <circle cx="208" cy="151" r="2.5" fill="#ffffff" filter="url(#sparkleGlow)" />
    <circle cx="298" cy="301" r="3" fill="#ffffff" filter="url(#sparkleGlow)" />
  </g>
</svg>
`;

// Foreground-only SVG for Adaptive Icons (transparent background)
const svgForeground = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Ambient Glow behind S -->
    <radialGradient id="ambientGlow" cx="50%" cy="50%" r="45%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5" />
      <stop offset="45%" stop-color="#2563eb" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- 3D Shadow filter -->
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="15" stdDeviation="15" flood-color="#00050f" flood-opacity="0.9" />
    </filter>

    <!-- Glass Body Fill Gradient -->
    <linearGradient id="glassFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4" />
      <stop offset="40%" stop-color="#0ea5e9" stop-opacity="0.2" />
      <stop offset="80%" stop-color="#1e3a8a" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.3" />
    </linearGradient>

    <!-- Glass Rim Stroke Gradient -->
    <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="30%" stop-color="#38bdf8" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#0ea5e9" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.85" />
    </linearGradient>

    <filter id="sparkleGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Ambient Glow -->
  <rect x="50" y="50" width="412" height="412" fill="url(#ambientGlow)" />

  <!-- 3D Glass S Mark -->
  <g filter="url(#dropShadow)">
    <path d="M 326, 146 C 326, 91 196, 91 196, 156 C 196, 206 321, 216 321, 301 C 321, 411 181, 411 181, 356 C 181, 336 201, 331 216, 351 C 226, 366 281, 371 281, 301 C 281, 211 156, 221 156, 151 C 156, 61 326, 61 326, 146 Z" 
          fill="url(#glassFill)" 
          stroke="url(#rimGrad)" 
          stroke-width="5" 
          stroke-linejoin="round" />

    <path d="M 306, 121 C 306, 101 211, 101 211, 156 C 211, 191 301, 201 301, 301" 
          fill="none" 
          stroke="#bae6fd" 
          stroke-opacity="0.75" 
          stroke-width="3" 
          stroke-linecap="round" />

    <path d="M 301, 301 C 301, 381 201, 381 201, 351" 
          fill="none" 
          stroke="#38bdf8" 
          stroke-opacity="0.45" 
          stroke-width="2.5" 
          stroke-linecap="round" />

    <circle cx="318" cy="124" r="3" fill="#ffffff" filter="url(#sparkleGlow)" />
    <circle cx="208" cy="151" r="2.5" fill="#ffffff" filter="url(#sparkleGlow)" />
    <circle cx="298" cy="301" r="3" fill="#ffffff" filter="url(#sparkleGlow)" />
  </g>
</svg>
`;

async function generateAllAssets() {
  console.log('Generating Android icons and Splash screens with exact Adaptive Icon specifications...');
  
  // Adaptive Icon Foreground dimensions (108dp base: mdpi=108, hdpi=162, xhdpi=216, xxhdpi=324, xxxhdpi=432)
  const adaptiveIconSizes = [
    { dir: 'mipmap-mdpi', size: 108, innerSize: 72 },
    { dir: 'mipmap-hdpi', size: 162, innerSize: 108 },
    { dir: 'mipmap-xhdpi', size: 216, innerSize: 144 },
    { dir: 'mipmap-xxhdpi', size: 324, innerSize: 216 },
    { dir: 'mipmap-xxxhdpi', size: 432, innerSize: 288 },
  ];

  // Legacy Icon dimensions (48dp base: mdpi=48, hdpi=72, xhdpi=96, xxhdpi=144, xxxhdpi=192)
  const legacyIconSizes = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 },
  ];

  const resBase = path.join(process.cwd(), 'android/app/src/main/res');

  // 1. Generate Mipmap Icons
  for (let i = 0; i < legacyIconSizes.length; i++) {
    const { dir, size: legacySize } = legacyIconSizes[i];
    const { size: adaptiveSize, innerSize } = adaptiveIconSizes[i];
    const targetDir = path.join(resBase, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Standard Legacy Icon (with full dark background)
    await sharp(Buffer.from(svgLogo))
      .resize(legacySize, legacySize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // Round Legacy Icon (with circular clip)
    const circleBuffer = Buffer.from(
      `<svg width="${legacySize}" height="${legacySize}"><circle cx="${legacySize/2}" cy="${legacySize/2}" r="${legacySize/2}" fill="#ffffff"/></svg>`
    );
    await sharp(Buffer.from(svgLogo))
      .resize(legacySize, legacySize)
      .composite([{ input: circleBuffer, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // Adaptive Foreground Icon (108dp standard with 72dp safe zone)
    const pad = Math.round((adaptiveSize - innerSize) / 2);
    const fgInner = await sharp(Buffer.from(svgForeground)).resize(innerSize, innerSize).png().toBuffer();

    await sharp({
      create: {
        width: adaptiveSize,
        height: adaptiveSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: fgInner, top: pad, left: pad }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    // Also mirror to drawable folders for safety
    const drawableDirName = dir.replace('mipmap-', 'drawable-');
    const targetDrawableDir = path.join(resBase, drawableDirName);
    if (!fs.existsSync(targetDrawableDir)) fs.mkdirSync(targetDrawableDir, { recursive: true });

    fs.copyFileSync(path.join(targetDir, 'ic_launcher.png'), path.join(targetDrawableDir, 'ic_launcher.png'));
    fs.copyFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), path.join(targetDrawableDir, 'ic_launcher_foreground.png'));
    fs.copyFileSync(path.join(targetDir, 'ic_launcher_round.png'), path.join(targetDrawableDir, 'ic_launcher_round.png'));
  }

  // Root drawable fallback
  const rootDrawableDir = path.join(resBase, 'drawable');
  if (!fs.existsSync(rootDrawableDir)) fs.mkdirSync(rootDrawableDir, { recursive: true });
  await sharp(Buffer.from(svgLogo)).resize(512, 512).png().toFile(path.join(rootDrawableDir, 'ic_launcher.png'));
  await sharp(Buffer.from(svgForeground)).resize(512, 512).png().toFile(path.join(rootDrawableDir, 'ic_launcher_foreground.png'));

  // 2. Generate Splash Screens (Portrait & Landscape)
  const splashConfigs = [
    { dir: 'drawable', w: 1080, h: 1920 },
    { dir: 'drawable-port-mdpi', w: 320, h: 480 },
    { dir: 'drawable-port-hdpi', w: 480, h: 800 },
    { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 1080, h: 1920 },
    { dir: 'drawable-port-xxxhdpi', w: 1440, h: 2560 },
    { dir: 'drawable-land-mdpi', w: 480, h: 320 },
    { dir: 'drawable-land-hdpi', w: 800, h: 480 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1920, h: 1080 },
    { dir: 'drawable-land-xxxhdpi', w: 2560, h: 1440 },
  ];

  for (const { dir, w, h } of splashConfigs) {
    const targetDir = path.join(resBase, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Logo overlay centered inside dark splash screen background
    const logoSize = Math.min(Math.round(Math.min(w, h) * 0.42), 512);
    const logoPng = await sharp(Buffer.from(svgLogo)).resize(logoSize, logoSize).png().toBuffer();

    // Create background with radial dark gradient
    const bgSvg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="splashBg" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stop-color="#0f243d" />
            <stop offset="55%" stop-color="#070f1e" />
            <stop offset="100%" stop-color="#02060d" />
          </radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#splashBg)" />
      </svg>
    `;

    const bgBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer();

    const topPos = Math.round((h - logoSize) / 2);
    const leftPos = Math.round((w - logoSize) / 2);

    await sharp(bgBuffer)
      .composite([{ input: logoPng, top: topPos, left: leftPos }])
      .png()
      .toFile(path.join(targetDir, 'splash.png'));
  }

  // Also save public icon
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  await sharp(Buffer.from(svgLogo)).resize(512, 512).png().toFile(path.join(publicDir, 'icon.png'));
  await sharp(Buffer.from(svgLogo)).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(Buffer.from(svgLogo)).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.png'));

  console.log('✅ Successfully generated all Android icons, Adaptive Icons, Splash Screens, and Web assets!');
}

generateAllAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
