// 合成三张海报 + 三联展示图
// 用法：python3 tools/compose/cutout.py && node tools/compose/compose.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const CUT = path.join(ROOT, 'build/cutouts');
const OUT = path.join(ROOT, 'output');
fs.mkdirSync(OUT, { recursive: true });

// face = 插画生成时的底色：表盘用它，抠图边缘与表盘天然融合
const C = { bg: '#E7DDD0', face: '#F3EDE6', road: '#DCCFBF', ink: '#2B2420', tick: '#5A4A3F', soft: '#8C7A6B', red: '#D7000F', paper: '#FBF8F4', black: '#1C1A19' };
const W = 1200, H = 1600, CX = 600, CY = 800;
const R_DIAL = 440, R_ROAD = 512;
const S = 0.54; // 姿势图像素 → 海报单位（三张统一，沙发大小一致）

const uri = (n) => 'data:image/png;base64,' + fs.readFileSync(path.join(CUT, n + '.png')).toString('base64');
const IMG = Object.fromEntries(['pose1-1445', 'pose2-1450', 'pose3-1500', 'cake', 'box', 'rider-sf', 'bakery', 'home'].map((n) => [n, uri(n)]));
const BRAND = path.join(ROOT, 'assets/brand');
const buri = (n) => 'data:image/png;base64,' + fs.readFileSync(path.join(BRAND, n + '.png')).toString('base64');
const LOGO = buri('logo-mark'), LOGO_W = buri('logo-mark-white'), LOGO_R = 249 / 272;
const logo = (x, y, h, white) => `<image href="${white ? LOGO_W : LOGO}" x="${x}" y="${y}" width="${h * LOGO_R}" height="${h}"/>`;
const pngSize = (n) => { const b = fs.readFileSync(path.join(CUT, n + '.png')); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const SIZE = Object.fromEntries(['cake', 'rider-sf', 'bakery', 'home'].map((n) => [n, pngSize(n)]));

const pt = (deg, r) => [CX + r * Math.sin((deg * Math.PI) / 180), CY - r * Math.cos((deg * Math.PI) / 180)];
const arc = (a0, a1, r) => {
  const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
  return `M${x0} ${y0} A${r} ${r} 0 ${(a1 - a0 + 360) % 360 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};
// 以中心点放置道具，w 为显示宽度
const prop = (name, cx, cy, w) => {
  const [iw, ih] = SIZE[name], h = (w * ih) / iw;
  return `<image href="${IMG[name]}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"/>`;
};

function defs() {
  return `<defs>
    <filter id="lift" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#5A4A3F" flood-opacity=".18"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .29  0 0 0 0 .24  0 0 0 1.4 -.55"/></filter>
  </defs>`;
}

function dial() {
  const s = [];
  // 外圈：环形街道（路面 + 车道线）
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_ROAD}" fill="none" stroke="${C.road}" stroke-width="44"/>`);
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_ROAD}" fill="none" stroke="${C.face}" stroke-width="2" stroke-dasharray="14 12" opacity=".9"/>`);
  // 表盘：实物感的圆盘
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_DIAL}" fill="${C.face}" filter="url(#lift)"/>`);
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_DIAL - 10}" fill="none" stroke="${C.tick}" stroke-width="1.2" opacity=".5"/>`);
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0, quarter = i % 15 === 0;
    const [x0, y0] = pt(i * 6, R_DIAL - 18 - (quarter ? 26 : major ? 16 : 6));
    const [x1, y1] = pt(i * 6, R_DIAL - 18);
    s.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${C.tick}" stroke-width="${quarter ? 5 : major ? 3 : 1.2}" stroke-linecap="round" opacity="${major ? 0.9 : 0.4}"/>`);
  }
  return s.join('');
}

function pose(name, hip) {
  const [hx, hy] = hip;
  return `<image href="${IMG[name]}" x="${CX - hx * S}" y="${CY - hy * S}" width="${1536 * S}" height="${1024 * S}"/>`;
}

// 表心：普通钟表轴钉（不再放 logo）
const pin = `<circle cx="${CX}" cy="${CY}" r="11" fill="${C.ink}" filter="url(#lift)"/><circle cx="${CX}" cy="${CY}" r="4" fill="${C.red}"/>`;

// 顺丰同城专属配送箱（参照官方广告）：黑色立方体 + 斜向红色色带 + logo
function sfBox(cx, by, w) {
  const h = w * 0.86, d = w * 0.3, x = cx - w / 2, y = by - h;
  const dx = d * 0.55, dy = d * 0.45; // 斜向透视偏移
  return `<g>` +
    `<ellipse cx="${cx + dx / 2}" cy="${by + 3}" rx="${w * 0.64}" ry="${w * 0.055}" fill="${C.ink}" opacity=".16"/>` +
    // 顶面
    `<path d="M${x} ${y} L${x + dx} ${y - dy} L${x + w + dx} ${y - dy} L${x + w} ${y} Z" fill="#3A3633"/>` +
    // 侧面
    `<path d="M${x + w} ${y} L${x + w + dx} ${y - dy} L${x + w + dx} ${by - dy} L${x + w} ${by} Z" fill="#0F0E0D"/>` +
    // 正面
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.black}"/>` +
    // 斜向红色色带：正面右下 → 侧面
    `<path d="M${x + w * 0.58} ${by} L${x + w} ${y + h * 0.38} L${x + w} ${y + h * 0.62} L${x + w * 0.84} ${by} Z" fill="${C.red}"/>` +
    `<path d="M${x + w} ${y + h * 0.38} L${x + w + dx} ${y + h * 0.38 - dy * 1.6} L${x + w + dx} ${y + h * 0.62 - dy * 1.6} L${x + w} ${y + h * 0.62} Z" fill="#9E000B"/>` +
    logo(x + w * 0.1, y + h * 0.16, h * 0.2, true) +
    T(x + w * 0.1 + h * 0.2 * LOGO_R + 5, y + h * 0.16 + h * 0.155, '顺丰同城', { size: h * 0.14, w: 700, fill: C.paper, ls: 1 }) +
    T(x + w * 0.1, y + h * 0.5, '专业同城急送', { size: h * 0.075, w: 400, fill: '#B9B1A8', ls: 3 }) +
    `</g>`;
}

function road(riderDeg, progress, riderW = 104) {
  const s = [];
  if (progress) s.push(`<path d="${arc(270, progress, R_ROAD)}" fill="none" stroke="${C.red}" stroke-width="6" stroke-linecap="round"/>`);
  const [bx, by] = pt(270, R_ROAD), [hx, hy] = pt(0, R_ROAD);
  s.push(prop('bakery', bx, by - 18, 104));
  s.push(prop('home', hx, hy - 22, 96));
  const [rx, ry] = pt(riderDeg, R_ROAD);
  s.push(prop('rider-sf', rx, ry - riderW * 0.3, riderW));
  return s.join('');
}

const T = (x, y, txt, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.serif ? 'Noto Serif CJK SC' : 'Noto Sans CJK SC'}" font-weight="${o.w || 300}" font-size="${o.size || 24}" fill="${o.fill || C.ink}" letter-spacing="${o.ls || 0}" text-anchor="${o.anchor || 'start'}" style="font-feature-settings:'halt'">${txt}</text>`;

function frame(p) {
  return [
    logo(80, 78, 46),
    T(80 + 46 * LOGO_R + 12, 116, '顺丰同城', { size: 34, w: 700, ls: 3, fill: C.black }),
    T(1120, 124, p.time, { size: 64, w: 200, ls: 3, anchor: 'end' }),
    T(76, 1452, '同城，即同时。', { serif: true, size: 76, w: 700, ls: 6 }),
    T(80, 1512, '一念起，一刻至 —— 顺丰同城', { size: 26, fill: C.soft, ls: 6 }),
  ].join('');
}

const posters = [
  {
    file: 'poster-1-1445', idx: '01', time: '14:45', tag: '馋 了',
    body: () =>
      pose('pose1-1445', [790, 575]) + pin + road(255, 0) +
      // 想象泡泡
      `<g filter="url(#lift)"><circle cx="452" cy="${CY - 184}" r="7" fill="${C.paper}"/><circle cx="474" cy="${CY - 216}" r="11" fill="${C.paper}"/>` +
      `<circle cx="520" cy="${CY - 280}" r="62" fill="${C.paper}"/></g>` + prop('cake', 520, CY - 278, 84),
  },
  {
    file: 'poster-2-1450', idx: '02', time: '14:50', tag: '下 单',
    body: () =>
      pose('pose2-1450', [785, 640]) + pin + road(300, 300) +
      `<g transform="translate(500 ${CY - 300})"><path d="M18 0 H282 a18 18 0 0 1 18 18 V66 a18 18 0 0 1 -18 18 H70 L-22 128 L40 84 H18 a18 18 0 0 1 -18 -18 V18 a18 18 0 0 1 18 -18 Z" fill="${C.paper}" filter="url(#lift)"/>` +
      `<rect x="14" y="16" width="52" height="52" rx="12" fill="${C.bg}"/>` + logo(40 - 13 * LOGO_R, 29, 26) +
      T(80, 38, '顺丰同城', { size: 18, w: 700, fill: C.black }) + T(286, 38, '刚刚', { size: 14, fill: C.soft, anchor: 'end' }) +
      T(80, 64, '骑手已取货，正在赶来', { size: 17, w: 400 }) + `</g>`,
  },
  {
    file: 'poster-3-1500', idx: '03', time: '15:00', tag: '到 嘴',
    body: () =>
      pose('pose3-1500', [680, 795]) + pin + road(19, 19, 128) +
      sfBox(318, CY + 110, 108) +
      T(842, CY - 548, '叮咚 ~', { size: 26, w: 400, ls: 4, fill: C.red }),
  },
];

function svg(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `${defs()}<rect width="${W}" height="${H}" fill="${C.bg}"/>${dial()}${p.body()}${frame(p)}` +
    `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".5" style="mix-blend-mode:multiply"/></svg>`;
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
  await page.setContent(`<html><body style="margin:0;background:#E9E1D6">
    <div style="display:flex;gap:48px;justify-content:center;align-items:center;height:1080px">${thumbs}</div></body></html>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, 'triptych.png') });
  await browser.close();
})();
