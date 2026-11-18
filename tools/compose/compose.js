// 合成三张海报 + 三联展示图
// 用法：python3 tools/compose/cutout.py && node tools/compose/compose.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const CUT = path.join(ROOT, 'build/cutouts');
const OUT = path.join(ROOT, 'output');
fs.mkdirSync(OUT, { recursive: true });

const C = { bg: '#F3EDE6', ink: '#2B2420', soft: '#8C7A6B', line: '#CBBDAA', red: '#D7000F', paper: '#FBF8F4', black: '#1C1A19' };
const W = 1200, H = 1600, CX = 600, CY = 820;
const R_DIAL = 430, R_ROAD = 505;
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

function dial() {
  const s = [];
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_DIAL}" fill="none" stroke="${C.ink}" stroke-width="2"/>`);
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0, quarter = i % 15 === 0;
    const [x0, y0] = pt(i * 6, R_DIAL - (quarter ? 30 : major ? 20 : 9));
    const [x1, y1] = pt(i * 6, R_DIAL - 4);
    s.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${C.ink}" stroke-width="${quarter ? 5 : major ? 3 : 1.2}" stroke-linecap="round" opacity="${major ? 1 : 0.55}"/>`);
  }
  // 外圈：城市道路
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_ROAD}" fill="none" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="2 9" stroke-linecap="round"/>`);
  return s.join('');
}

function pose(name, hip) {
  const [hx, hy] = hip;
  return `<image href="${IMG[name]}" x="${CX - hx * S}" y="${CY - hy * S}" width="${1536 * S}" height="${1024 * S}"/>`;
}

const pin = `<circle cx="${CX}" cy="${CY}" r="22" fill="${C.paper}"/>` + logo(CX - 14 * LOGO_R, CY - 14, 28);

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
  if (progress) s.push(`<path d="${arc(270, progress, R_ROAD)}" fill="none" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>`);
  const [bx, by] = pt(270, R_ROAD), [hx, hy] = pt(0, R_ROAD);
  s.push(`<circle cx="${bx}" cy="${by}" r="58" fill="${C.bg}"/>` + prop('bakery', bx, by, 96));
  s.push(`<circle cx="${hx}" cy="${hy}" r="58" fill="${C.bg}"/>` + prop('home', hx, hy, 88));
  const [rx, ry] = pt(riderDeg, R_ROAD);
  s.push(`<circle cx="${rx}" cy="${ry}" r="${riderW * 0.52}" fill="${C.bg}"/>` + prop('rider-sf', rx, ry, riderW));
  return s.join('');
}

const T = (x, y, txt, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.serif ? 'Noto Serif CJK SC' : 'Noto Sans CJK SC'}" font-weight="${o.w || 300}" font-size="${o.size || 24}" fill="${o.fill || C.ink}" letter-spacing="${o.ls || 0}" text-anchor="${o.anchor || 'start'}" style="font-feature-settings:'halt'">${txt}</text>`;

function frame(p) {
  return [
    T(80, 150, p.time, { size: 76, w: 200, ls: 4 }),
    T(84, 196, p.tag, { size: 22, fill: C.soft, ls: 6 }),
    T(1120, 150, `${p.idx} / 03`, { size: 20, fill: C.soft, ls: 4, anchor: 'end' }),
    logo(1120 - 168 - 50 * LOGO_R - 14, 1470, 50),
    T(1120, 1508, '顺丰同城', { size: 38, w: 700, ls: 4, anchor: 'end', fill: C.black }),
    T(1120, 1540, '专业同城急送 · 又快又稳', { size: 15, fill: C.soft, ls: 4, anchor: 'end' }),
  ].join('');
}

const posters = [
  {
    file: 'poster-1-1445', idx: '01', time: '14:45', tag: '馋 了',
    body: () =>
      pose('pose1-1445', [790, 575]) + pin + road(255, 0) +
      // 想象泡泡
      `<circle cx="452" cy="636" r="7" fill="${C.paper}"/><circle cx="474" cy="604" r="11" fill="${C.paper}"/>` +
      `<circle cx="520" cy="540" r="62" fill="${C.paper}"/>` + prop('cake', 520, 542, 84),
    foot: T(80, 1508, '忽然，想吃一块蛋糕。', { serif: true, size: 34, w: 500, ls: 3 }),
  },
  {
    file: 'poster-2-1450', idx: '02', time: '14:50', tag: '下 单',
    body: () =>
      pose('pose2-1450', [785, 640]) + pin + road(300, 300) +
      `<g transform="translate(560 520)"><rect x="0" y="0" width="300" height="84" rx="18" fill="${C.paper}"/>` +
      `<rect x="14" y="16" width="52" height="52" rx="12" fill="${C.bg}"/>` + logo(40 - 13 * LOGO_R, 29, 26) +
      T(80, 38, '顺丰同城', { size: 18, w: 700, fill: C.black }) + T(286, 38, '刚刚', { size: 14, fill: C.soft, anchor: 'end' }) +
      T(80, 64, '骑手已取货，正在赶来', { size: 17, w: 400 }) + `</g>`,
    foot: T(80, 1508, '那就，现在下单。', { serif: true, size: 34, w: 500, ls: 3 }),
  },
  {
    file: 'poster-3-1500', idx: '03', time: '15:00', tag: '到 嘴',
    body: () =>
      pose('pose3-1500', [680, 795]) + pin + road(19, 19, 128) +
      sfBox(318, 930, 112) +
      T(812, 290, '叮咚 ~', { size: 26, w: 400, ls: 4, fill: C.red }),
    foot:
      T(76, 1478, '同城，即同时。', { serif: true, size: 76, w: 700, ls: 6 }) +
      T(80, 1530, '一念起，一刻至', { size: 24, fill: C.soft, ls: 8 }),
  },
];

function svg(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="${C.bg}"/>${dial()}${p.body()}${frame(p)}${p.foot}</svg>`;
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
