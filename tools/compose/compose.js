// 合成三张海报 + 三联展示图
// 用法：python3 tools/compose/cutout.py && node tools/compose/compose.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const CUT = path.join(ROOT, 'build/cutouts');
const OUT = path.join(ROOT, 'output');
fs.mkdirSync(OUT, { recursive: true });

const C = { bg: '#F3EDE6', ink: '#2B2420', soft: '#8C7A6B', line: '#CBBDAA', red: '#C93A3A', paper: '#FBF8F4' };
const W = 1200, H = 1600, CX = 600, CY = 820;
const R_DIAL = 430, R_ROAD = 505;
const S = 0.54; // 姿势图像素 → 海报单位（三张统一，沙发大小一致）

const uri = (n) => 'data:image/png;base64,' + fs.readFileSync(path.join(CUT, n + '.png')).toString('base64');
const IMG = Object.fromEntries(['pose1-1445', 'pose2-1450', 'pose3-1500', 'cake', 'box', 'rider', 'bakery', 'home'].map((n) => [n, uri(n)]));
const SIZE = { cake: [360, 339], box: [463, 338], rider: [388, 425], bakery: [508, 419], home: [467, 421] };

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

const pin = `<circle cx="${CX}" cy="${CY}" r="9" fill="${C.ink}" stroke="${C.paper}" stroke-width="3"/>`;

function road(riderDeg, progress) {
  const s = [];
  if (progress) s.push(`<path d="${arc(270, progress, R_ROAD)}" fill="none" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>`);
  const [bx, by] = pt(270, R_ROAD), [hx, hy] = pt(0, R_ROAD);
  s.push(`<circle cx="${bx}" cy="${by}" r="58" fill="${C.bg}"/>` + prop('bakery', bx, by, 96));
  s.push(`<circle cx="${hx}" cy="${hy}" r="58" fill="${C.bg}"/>` + prop('home', hx, hy, 88));
  const [rx, ry] = pt(riderDeg, R_ROAD);
  s.push(`<circle cx="${rx}" cy="${ry}" r="42" fill="${C.bg}"/>` + prop('rider', rx, ry, 72));
  return s.join('');
}

const T = (x, y, txt, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.serif ? 'Noto Serif CJK SC' : 'Noto Sans CJK SC'}" font-weight="${o.w || 300}" font-size="${o.size || 24}" fill="${o.fill || C.ink}" letter-spacing="${o.ls || 0}" text-anchor="${o.anchor || 'start'}" style="font-feature-settings:'halt'">${txt}</text>`;

function frame(p) {
  return [
    T(80, 150, p.time, { size: 76, w: 200, ls: 4 }),
    T(84, 196, p.tag, { size: 22, fill: C.soft, ls: 6 }),
    T(1120, 150, `${p.idx} / 03`, { size: 20, fill: C.soft, ls: 4, anchor: 'end' }),
    T(1120, 1508, '顺丰同城', { size: 30, w: 700, ls: 6, anchor: 'end' }),
    T(1120, 1540, 'SF INTRA-CITY', { size: 13, fill: C.soft, ls: 5, anchor: 'end' }),
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
      `<g transform="translate(560 560)"><rect x="0" y="-30" width="196" height="60" rx="30" fill="${C.paper}"/>` +
      `<circle cx="30" cy="0" r="7" fill="${C.red}"/>` +
      T(48, 8, '骑手已取货', { size: 22, w: 400 }) + `</g>`,
    foot: T(80, 1508, '那就，现在下单。', { serif: true, size: 34, w: 500, ls: 3 }),
  },
  {
    file: 'poster-3-1500', idx: '03', time: '15:00', tag: '到 嘴',
    body: () =>
      pose('pose3-1500', [680, 795]) + pin + road(14, 14) +
      `<ellipse cx="850" cy="930" rx="78" ry="9" fill="${C.ink}" opacity=".12"/>` +
      prop('box', 850, 878, 140) + T(850, 925, '顺丰同城', { size: 17, w: 700, ls: 3, anchor: 'middle', fill: C.paper }) +
      T(776, 318, '叮咚 ~', { size: 26, w: 400, ls: 4, fill: C.red }),
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
