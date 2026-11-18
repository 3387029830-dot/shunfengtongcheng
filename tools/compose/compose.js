// 合成三张海报 + 三联展示图（v6：腕表广告式的艺术指导）
// 用法：python3 tools/compose/cutout.py && node tools/compose/compose.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const CUT = path.join(ROOT, 'build/cutouts');
const BRAND = path.join(ROOT, 'assets/brand');
const OUT = path.join(ROOT, 'output');
fs.mkdirSync(OUT, { recursive: true });

// face = 插画生成时的底色；表盘用它，抠图边缘与表盘天然融合
const C = {
  bg: '#1A1817', face: '#F3EDE6', rim: '#E2D8CB', tick: '#4A3F37',
  cream: '#F3EDE6', soft: '#8F847A', red: '#D7000F', paper: '#FBF8F4', ink: '#2B2420',
};
const W = 1200, H = 1600, CX = 600, CY = 760;
const R_FACE = 520, R_TRACK = 448; // 表盘半径；骑手行驶的内圈轨道
const S = 0.61; // 姿势图像素 → 海报单位（三张统一）

const b64 = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
const IMG = Object.fromEntries(['pose1-1445', 'pose2-1450', 'pose3-1500', 'cake', 'rider-sf', 'box-sf'].map((n) => [n, b64(path.join(CUT, n + '.png'))]));
const pngSize = (n) => { const b = fs.readFileSync(path.join(CUT, n + '.png')); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const SIZE = Object.fromEntries(['cake', 'rider-sf', 'box-sf'].map((n) => [n, pngSize(n)]));
const LOGO = b64(path.join(BRAND, 'logo-mark.png')), LOGO_W = b64(path.join(BRAND, 'logo-mark-white.png')), LOGO_R = 249 / 272;
const logo = (x, y, h, white) => `<image href="${white ? LOGO_W : LOGO}" x="${x}" y="${y}" width="${h * LOGO_R}" height="${h}"/>`;

const pt = (deg, r) => [CX + r * Math.sin((deg * Math.PI) / 180), CY - r * Math.cos((deg * Math.PI) / 180)];
const arc = (a0, a1, r) => {
  const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
  return `M${x0} ${y0} A${r} ${r} 0 ${(a1 - a0 + 360) % 360 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};
const prop = (name, cx, cy, w) => {
  const [iw, ih] = SIZE[name], h = (w * ih) / iw;
  return `<image href="${IMG[name]}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"/>`;
};
const T = (x, y, txt, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.serif ? 'Noto Serif CJK SC' : 'Noto Sans CJK SC'}" font-weight="${o.w || 300}" font-size="${o.size || 24}" fill="${o.fill || C.cream}" letter-spacing="${o.ls || 0}" text-anchor="${o.anchor || 'start'}" style="font-feature-settings:'halt'">${txt}</text>`;

function defs() {
  return `<defs>
    <radialGradient id="faceShade" cx="50%" cy="46%" r="50%">
      <stop offset="0.80" stop-color="${C.face}"/><stop offset="1" stop-color="${C.rim}"/>
    </radialGradient>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity=".18"/></filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="24" stdDeviation="40" flood-color="#000" flood-opacity=".55"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .29  0 0 0 0 .24  0 0 0 1.4 -.55"/></filter>
  </defs>`;
}

function dial() {
  const s = [];
  // 细外圈（表圈）
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_FACE + 18}" fill="none" stroke="#3A3532" stroke-width="1.5"/>`);
  // 表盘
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_FACE}" fill="url(#faceShade)" filter="url(#glow)"/>`);
  // 骑手轨道（城市道路，极简为一条细虚线）
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_TRACK}" fill="none" stroke="#CDBFAE" stroke-width="1.5" stroke-dasharray="2 8" stroke-linecap="round"/>`);
  // 刻度
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0, quarter = i % 15 === 0;
    const r1 = 426, r0 = r1 - (quarter ? 30 : major ? 18 : 7);
    const [x0, y0] = pt(i * 6, r0), [x1, y1] = pt(i * 6, r1);
    s.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${C.tick}" stroke-width="${quarter ? 5 : major ? 3 : 1.2}" stroke-linecap="round" opacity="${major ? 0.9 : 0.35}"/>`);
  }
  return s.join('');
}

const pose = (name, [hx, hy]) =>
  `<image href="${IMG[name]}" x="${CX - hx * S}" y="${CY - hy * S}" width="${1536 * S}" height="${1024 * S}"/>`;

// 表心轴钉
const pin = `<circle cx="${CX}" cy="${CY}" r="11" fill="${C.ink}" filter="url(#lift)"/><circle cx="${CX}" cy="${CY}" r="4" fill="${C.red}"/>`;

// 骑手：沿内圈轨道，红线是已走过的路（起点 9 点 = 蛋糕店）
function rider(deg, progress, w = 82) {
  const s = [];
  const [sx, sy] = pt(270, R_TRACK);
  s.push(`<circle cx="${sx}" cy="${sy}" r="6" fill="${C.red}"/>`);
  if (progress) s.push(`<path d="${arc(270, progress, R_TRACK)}" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round"/>`);
  const [rx, ry] = pt(deg, R_TRACK); // 骑手骑在路线上
  s.push(`<g filter="url(#lift)">${prop('rider-sf', rx, ry, w)}</g>`);
  return s.join('');
}

function frame(p) {
  return [
    logo(80, 76, 44, true),
    T(80 + 44 * LOGO_R + 12, 112, '顺丰同城', { size: 32, w: 700, ls: 3 }),
    T(76, 1452, p.line, { serif: true, size: 92, w: 700, ls: 8 }),
    T(1120, 1452, p.time, { size: 40, w: 200, ls: 4, anchor: 'end', fill: C.soft }),
  ].join('');
}

const posters = [
  {
    file: 'poster-1-1445', line: '一念起，', time: '14:45',
    body: () =>
      rider(234, 0) + pose('pose1-1445', [790, 575]) + pin +
      `<g filter="url(#lift)"><circle cx="392" cy="${CY - 150}" r="7" fill="${C.paper}"/><circle cx="412" cy="${CY - 182}" r="11" fill="${C.paper}"/>` +
      `<circle cx="456" cy="${CY - 252}" r="60" fill="${C.paper}"/></g>` + prop('cake', 456, CY - 250, 80),
  },
  {
    file: 'poster-2-1450', line: '一刻至。', time: '14:50',
    body: () =>
      rider(300, 300) + pose('pose2-1450', [785, 640]) + pin +
      `<g transform="translate(470 ${CY - 330})"><path d="M18 0 H282 a18 18 0 0 1 18 18 V66 a18 18 0 0 1 -18 18 H70 L-12 128 L40 84 H18 a18 18 0 0 1 -18 -18 V18 a18 18 0 0 1 18 -18 Z" fill="${C.paper}" filter="url(#lift)"/>` +
      `<rect x="14" y="16" width="52" height="52" rx="12" fill="${C.face}"/>` + logo(40 - 13 * LOGO_R, 29, 26) +
      T(80, 38, '顺丰同城', { size: 18, w: 700, fill: C.ink }) + T(286, 38, '刚刚', { size: 14, fill: C.soft, anchor: 'end' }) +
      T(80, 64, '骑手已取货，正在赶来', { size: 17, w: 400, fill: C.ink }) + `</g>`,
  },
  {
    file: 'poster-3-1500', line: '同城，即同时。', time: '15:00',
    body: () =>
      rider(0, 359.9) + pose('pose3-1500', [680, 795]) + pin +
      `<ellipse cx="392" cy="${CY + 236}" rx="96" ry="10" fill="${C.ink}" opacity=".16"/>` +
      prop('box-sf', 388, CY + 236 - 156 * SIZE['box-sf'][1] / SIZE['box-sf'][0] / 2, 156) +
      T(664, CY - 420, '叮咚 ~', { size: 26, w: 400, ls: 4, fill: C.red }),
  },
];

function svg(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}` +
    `<rect width="${W}" height="${H}" fill="${C.bg}"/>${dial()}${p.body()}${frame(p)}` +
    `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".22" style="mix-blend-mode:multiply"/></svg>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const svgs = [];
  for (const p of posters) {
    const s = svg(p);
    svgs.push(s);
    await page.setContent(`<html><body style="margin:0">${s}</body></html>`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, p.file + '.png') });
    console.log('poster', p.file);
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  const thumbs = svgs.map((s) => s.replace(`width="${W}" height="${H}"`, 'width="570" height="760"')).join('');
  await page.setContent(`<html><body style="margin:0;background:#0F0E0D">
    <div style="display:flex;gap:40px;justify-content:center;align-items:center;height:1080px">${thumbs}</div></body></html>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, 'triptych.png') });
  await browser.close();
})();
