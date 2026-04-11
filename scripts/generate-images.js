const path = require('path');
const sharp = require('sharp');

const SIZE = 200;
const OUTPUT_DIR = path.join(__dirname, '../assets/images');

const entries = [
  { slug: 'sakura', label: '桜', background: ['#15001f', '#23004a'], neon: '#ff4fd8' },
  { slug: 'sushi', label: '寿司', background: ['#002b36', '#004f5a'], neon: '#00e5ff' },
  { slug: 'fujisan', label: '富士山', background: ['#140f1f', '#2a1247'], neon: '#ff8f33' },
  { slug: 'neko', label: '猫', background: ['#091226', '#1b2151'], neon: '#9d7bff' },
  { slug: 'ramen', label: 'ラーメン', background: ['#1a0d00', '#3d1d00'], neon: '#ffd95a' },
  { slug: 'shinkansen', label: '新幹線', background: ['#00192d', '#08334f'], neon: '#00f5ff' },
  { slug: 'torii', label: '鳥居', background: ['#1f0120', '#3a0044'], neon: '#ff4a57' },
  { slug: 'sakuranbo', label: 'さくらんぼ', background: ['#2d0015', '#560029'], neon: '#ff4f81' },
  { slug: 'taiyaki', label: 'たい焼き', background: ['#2a0904', '#4e1308'], neon: '#ffb347' },
  { slug: 'daruma', label: 'だるま', background: ['#1e1a00', '#3d3200'], neon: '#f5f07a' },
  { slug: 'tanuki', label: 'たぬき', background: ['#132100', '#244a00'], neon: '#8aff4f' },
  { slug: 'onigiri', label: 'おにぎり', background: ['#2a1a00', '#4f3400'], neon: '#ffcc6e' },
  { slug: 'koinobori', label: 'こいのぼり', background: ['#0a2140', '#103c71'], neon: '#5ef5ff' },
  { slug: 'ninja', label: '忍者', background: ['#0a0022', '#20003f'], neon: '#a77cff' },
  { slug: 'samurai', label: '侍', background: ['#3e0f00', '#6f1f00'], neon: '#ff6c00' },
];

function matrixTemplate(config) {
  return `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${config.background[0]}" />
      <stop offset="100%" stop-color="${config.background[1]}" />
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur" />
    </filter>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect x="8" y="8" width="184" height="184" fill="none" stroke="${config.neon}" stroke-width="2" opacity="0.9" />
  <g opacity="0.7" stroke="${config.neon}" stroke-width="0.9">
    <line x1="20" y1="20" x2="180" y2="20" />
    <line x1="20" y1="40" x2="180" y2="40" />
    <line x1="20" y1="60" x2="180" y2="60" />
    <line x1="20" y1="100" x2="180" y2="100" />
    <line x1="20" y1="120" x2="180" y2="120" />
    <line x1="20" y1="160" x2="180" y2="160" />
    <line x1="20" y1="180" x2="180" y2="180" />
    <line x1="20" y1="30" x2="20" y2="170" />
    <line x1="40" y1="30" x2="40" y2="170" />
    <line x1="80" y1="30" x2="80" y2="170" />
    <line x1="120" y1="30" x2="120" y2="170" />
    <line x1="160" y1="30" x2="160" y2="170" />
  </g>
  <circle cx="100" cy="100" r="28" fill="${config.neon}" opacity="0.18" filter="url(#glow)" />
  <text x="100" y="114" text-anchor="middle" fill="${config.neon}" font-size="46" font-family="Arial, sans-serif" font-weight="700">${config.label}</text>
  <text x="100" y="154" text-anchor="middle" fill="${config.neon}" opacity="0.85" font-size="15" font-family="Arial, sans-serif" letter-spacing="2">MATRIX</text>
</svg>
`;
}

async function generateImages() {
  for (const item of entries) {
    const svgBuffer = Buffer.from(matrixTemplate(item), 'utf8');
    const outputPath = path.join(OUTPUT_DIR, `${item.slug}.png`);
    await sharp(svgBuffer)
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
  }
  console.log('generated', entries.length, 'png images');
}

generateImages().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
