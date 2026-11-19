// 合成三张海报 + 三联展示图（v6：腕表广告式的艺术指导）
// 用法：python3 tools/compose/cutout.py && node tools/compose/compose.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const CUT = path.join(ROOT, 'build/cutouts');
const BRAND = path.join(ROOT, 'assets/brand');
const OUT = process.env.OUT_DIR || path.join(ROOT, 'output');
// 字体方案（可用环境变量切换，便于对比）
const F = {
  head: process.env.HEAD || 'MF LangSong', headW: +(process.env.HEADW || 400),
  en: process.env.EN || 'MF LangSong', enW: +(process.env.ENW || 400), enUp: process.env.ENUP === '1', enLs: +(process.env.ENLS || 0.5),
};
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
  `<text x="${x}" y="${y}" font-family="${o.font || (o.serif ? F.head : 'Source Han Sans CN')}" font-weight="${o.w || 300}" font-size="${o.size || 24}" fill="${o.fill || C.cream}" fill-opacity="${o.op ?? 1}" letter-spacing="${o.ls || 0}" text-anchor="${o.anchor || 'start'}" font-style="${o.italic ? 'italic' : 'normal'}" style="font-feature-settings:'halt','lnum'">${txt}</text>`;

function defs() {
  return `<defs>
    <radialGradient id="faceShade" cx="50%" cy="46%" r="50%">
      <stop offset="0.80" stop-color="${C.face}"/><stop offset="1" stop-color="${C.rim}"/>
    </radialGradient>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity=".18"/></filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="24" stdDeviation="40" flood-color="#000" flood-opacity=".55"/></filter>
    <radialGradient id="homeGlow"><stop offset="0" stop-color="#E7C27D" stop-opacity=".28"/><stop offset="1" stop-color="#E7C27D" stop-opacity="0"/></radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .29  0 0 0 0 .24  0 0 0 1.4 -.55"/></filter>
  </defs>`;
}

function dial(skip) {
  const s = [];
  // 细外圈（表圈）
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_FACE + 18}" fill="none" stroke="#3A3532" stroke-width="1.5"/>`);
  // 表盘
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_FACE}" fill="url(#faceShade)" filter="url(#glow)"/>`);
  // 骑手轨道（城市道路，极简为一条细虚线）
  s.push(`<circle cx="${CX}" cy="${CY}" r="${R_TRACK}" fill="none" stroke="#CDBFAE" stroke-width="1.5" stroke-dasharray="2 8" stroke-linecap="round"/>`);
  // 刻度
  for (let i = 0; i < 60; i++) {
    const d = Math.abs(((i * 6 - skip + 540) % 360) - 180);
    if (skip !== undefined && d < 9) continue; // 骑手所在处不画刻度
    const major = i % 5 === 0, quarter = i % 15 === 0;
    const r1 = 426, r0 = r1 - (quarter ? 30 : major ? 18 : 7);
    const [x0, y0] = pt(i * 6, r0), [x1, y1] = pt(i * 6, r1);
    s.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${C.tick}" stroke-width="${quarter ? 5 : major ? 3 : 1.2}" stroke-linecap="round" opacity="${major ? 0.9 : 0.35}"/>`);
  }
  return s.join('');
}

// 表盘外的城市：环形天际线（深灰楼群环绕表盘，零星暖光窗户；9 点蛋糕店、12 点她家）
function city(arrived) {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const r0 = R_FACE + 30;
  const maxH = (deg) => {
    for (let h = 92; h > 10; h -= 2) {
      const [x, y] = pt(deg, r0 + h);
      if (x > 24 && x < W - 24 && y > 150 && y < 1356) return h;
    }
    return 10;
  };
  const quad = (a0, a1, ra, rb, fill, extra = '') => {
    const p = [pt(a0, ra), pt(a1, ra), pt(a1, rb), pt(a0, rb)].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    return `<polygon points="${p}" fill="${fill}" ${extra}/>`;
  };
  const windows = (a0, a1, h, litP) => {
    const s = [];
    for (let r = r0 + 9; r < r0 + h - 6; r += 11)
      for (const f of [0.28, 0.72]) {
        const a = a0 + (a1 - a0) * f;
        const [x, y] = pt(a, r);
        const lit = rnd() < litP;
        s.push(`<rect x="${(x - 1.8).toFixed(1)}" y="${(y - 1.8).toFixed(1)}" width="3.6" height="3.6" fill="${lit ? '#E7C27D' : '#353029'}" opacity="${lit ? 0.85 : 1}"/>`);
      }
    return s.join('');
  };
  const s = [];
  // 12 点她家的暖光晕（送达时更亮）
  const [gx, gy] = pt(0, r0 + 40);
  s.push(`<circle cx="${gx}" cy="${gy}" r="120" fill="url(#homeGlow)" opacity="${arrived ? 1 : 0.45}"/>`);
  const tones = ['#24211F', '#292522', '#2E2926'];
  let a = 0;
  while (a < 360) {
    const w = 2.6 + rnd() * 3.4;
    const mid = a + w / 2;
    const nearShop = Math.abs(mid - 270) < 8, nearHome = mid < 6 || mid > 354;
    if (!nearShop && !nearHome) {
      const h = Math.min(maxH(mid), 24 + rnd() * 68);
      s.push(quad(a + 0.3, a + w - 0.3, r0, r0 + h, tones[Math.floor(rnd() * 3)]));
      s.push(windows(a + 0.3, a + w - 0.3, h, 0.16));
    }
    a += w;
  }
  // 9 点：蛋糕店（加宽的红白遮阳篷 + 亮着的橱窗）
  const hs = Math.min(maxH(270), 56);
  s.push(quad(263, 277, r0, r0 + hs, '#2E2926'));
  for (let i = 0; i < 7; i++) s.push(quad(263 + i * 2, 265 + i * 2, r0 + hs * 0.5, r0 + hs * 0.72, i % 2 ? C.cream : C.red));
  s.push(quad(265, 275, r0 + 6, r0 + hs * 0.42, '#E7C27D', 'opacity=".55"'));
  // 12 点：她家（送达时整栋亮灯）
  const hh = 84;
  s.push(quad(355.5, 364.5, r0, r0 + hh, '#302B28'));
  s.push(windows(355.5, 364.5, hh, arrived ? 1 : 0.35));
  return s.join('');
}

// 副表盘：送达计时（0–15 分钟）
function subdial(min) {
  const x = CX, y = CY + 276, r = 70, s = [];
  s.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#EAE1D5"/><circle cx="${x}" cy="${y}" r="${r - 7}" fill="none" stroke="${C.tick}" stroke-width="1" opacity=".3"/>`);
  for (let i = 0; i < 15; i++) {
    const a = (i * 24 * Math.PI) / 180, major = i % 5 === 0;
    const r1 = r - 9, r0 = r1 - (i === 0 ? 16 : major ? 10 : 5);
    s.push(`<line x1="${x + r0 * Math.sin(a)}" y1="${y - r0 * Math.cos(a)}" x2="${x + r1 * Math.sin(a)}" y2="${y - r1 * Math.cos(a)}" stroke="${C.tick}" stroke-width="${major ? 2.2 : 1}" stroke-linecap="round" opacity="${major ? 0.9 : 0.5}"/>`);
  }
  [['5', 120], ['10', 240]].forEach(([t, d]) => {
    const a = (d * Math.PI) / 180, rr = r - 32;
    s.push(T(x + rr * Math.sin(a), y - rr * Math.cos(a) + 5, t, { size: 13, w: 400, fill: C.tick, anchor: 'middle' }));
  });
  s.push(T(x, y + 46, 'MIN', { size: 9, w: 400, fill: C.soft, anchor: 'middle', ls: 3 }));
  const a = (min * 24 * Math.PI) / 180;
  s.push(`<line x1="${x - 10 * Math.sin(a)}" y1="${y + 10 * Math.cos(a)}" x2="${x + (r - 14) * Math.sin(a)}" y2="${y - (r - 14) * Math.cos(a)}" stroke="${C.red}" stroke-width="2.6" stroke-linecap="round"/>`);
  s.push(`<circle cx="${x}" cy="${y}" r="4.5" fill="${C.ink}"/>`);
  s.push(T(x, y + r + 22, '送 达 计 时', { size: 11, w: 400, fill: C.soft, anchor: 'middle', ls: 2 }));
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

// 文字系统 v5：竖排 + 中轴对称（"圆月在上、竖排标题在下"的经典构图）
const STAGE = { k: 0.82, cx: CX, cy: 612 }; // 表盘场景缩放并上移
const stage = (inner) =>
  `<g transform="translate(${STAGE.cx - CX * STAGE.k} ${STAGE.cy - CY * STAGE.k}) scale(${STAGE.k})">${inner}</g>`;

function vcol(x, y0, chars, o) {
  return [...chars].map((ch, i) => T(x, y0 + i * o.step, ch, { serif: true, size: o.size, w: 500, anchor: 'middle' })).join('');
}

function seal(cx, y, size) {
  const f = size * 0.36, x = cx - size / 2;
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="3" fill="${C.red}"/>` +
    `<rect x="${x + 3}" y="${y + 3}" width="${size - 6}" height="${size - 6}" rx="2" fill="none" stroke="${C.cream}" stroke-width="1" opacity=".55"/>` +
    T(cx, y + size * 0.47, '同', { serif: true, size: f, w: 700, anchor: 'middle' }) +
    T(cx, y + size * 0.47 + f * 1.05, '城', { serif: true, size: f, w: 700, anchor: 'middle' });
}

// 竖排细字（旋转 90°），以 (x, yTop) 为起点，沿 x 居中
const vtext = (x, yTop, txt, o) => `<g transform="translate(${x - o.size * 0.33} ${yTop}) rotate(90)">${T(0, 0, txt, o)}</g>`;

function frame(p) {
  const size = 66, step = 82, top = 1170, gap = 88;
  const cols = p.cols, n = cols.length;
  const s = [];
  // 标题列：整体以中轴居中，自右向左
  cols.forEach((c, i) => s.push(vcol(CX + ((n - 1) / 2 - i) * gap, top + size, c, { size, step })));
  const longest = Math.max(...cols.map((c) => [...c].length));
  const bottom = top + longest * step;
  // 两侧对称的细竖排：左英文、右时间
  const flank = 150 + (n - 1) * gap / 2;
  s.push(vtext(CX - flank, top + 6, p.en, { font: F.en, size: 24, w: 400, op: 0.7, ls: 0.6 }));
  s.push(vtext(CX + flank, top + 6, p.time, { font: F.en, size: 24, w: 400, op: 0.85, ls: 3 }));
  s.push(`<circle cx="${CX + flank - 8}" cy="${top - 10}" r="3" fill="${C.red}"/>`);
  // 印章：标题正下方
  // 品牌签名：底部居中
  const lockH = 28, lockW = lockH * LOGO_R + 10 + 22 * 4 + 5 * 3;
  s.push(logo(CX - lockW / 2, 1528, lockH, true) + T(CX - lockW / 2 + lockH * LOGO_R + 10, 1551, '顺丰同城', { font: 'HYYakuHei', size: 22, w: 700, ls: 5 }));
  return s.join('');
}

const posters = [
  {
    file: 'poster-1-1445', cols: ['一念起'], beat: '一念起，', rd: 234, line: '一念起', en: 'A craving begins —', time: '14:45  p.m.',
    body: () =>
      subdial(0) + rider(234, 0) + pose('pose1-1445', [790, 575]) +
      `<g filter="url(#lift)"><circle cx="392" cy="${CY - 150}" r="7" fill="${C.paper}"/><circle cx="412" cy="${CY - 182}" r="11" fill="${C.paper}"/>` +
      `<circle cx="456" cy="${CY - 252}" r="60" fill="${C.paper}"/></g>` + prop('cake', 456, CY - 250, 80),
  },
  {
    file: 'poster-2-1450', cols: ['一刻至'], beat: '一刻至。', rd: 300, line: '一刻至', en: 'and arrives in a moment.', time: '14:50  p.m.',
    body: () =>
      subdial(5) + rider(300, 300) + pose('pose2-1450', [785, 640]) +
      `<g transform="translate(470 ${CY - 330})"><path d="M18 0 H282 a18 18 0 0 1 18 18 V66 a18 18 0 0 1 -18 18 H70 L-12 128 L40 84 H18 a18 18 0 0 1 -18 -18 V18 a18 18 0 0 1 18 -18 Z" fill="${C.paper}" filter="url(#lift)"/>` +
      `<rect x="14" y="16" width="52" height="52" rx="12" fill="${C.face}"/>` + logo(40 - 13 * LOGO_R, 29, 26) +
      T(80, 38, '顺丰同城', { font: 'HYYakuHei', size: 18, w: 700, fill: C.ink }) + T(286, 38, '刚刚', { size: 14, fill: C.soft, anchor: 'end' }) +
      T(80, 64, '骑手已取货，正在赶来', { size: 17, w: 400, fill: C.ink }) + `</g>`,
  },
  {
    file: 'poster-3-1500', cols: ['同城', '即同时'], beat: '同城，即同时。', rd: 0, arrived: true, line: '同城，即同时', en: 'Same city, same moment.', time: '15:00  p.m.',
    body: () =>
      subdial(15) + rider(0, 359.9) + pose('pose3-1500', [680, 795]) +
      `<ellipse cx="392" cy="${CY + 236}" rx="96" ry="10" fill="${C.ink}" opacity=".16"/>` +
      prop('box-sf', 388, CY + 236 - 156 * SIZE['box-sf'][1] / SIZE['box-sf'][0] / 2, 156),
  },
];


// ===== 展板：保留三张海报原样，无缝拼进同一个空间（16:9）=====
// 三张海报黑底同色，边对边拼接后成为一整片夜空；顶部加一条时间轴把三个时刻串起来
const BW = 1920, BH = 1080;
const BOARD = { pw: 640, top: 182 }; // 每张海报在展板上的宽度；顶部留给时间轴

function boardSvg(posterSvgs) {
  const ph = (BOARD.pw * H) / W, s = [];
  posterSvgs.forEach((ps, i) => {
    s.push(ps.replace(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
      `<svg x="${i * BOARD.pw}" y="${BOARD.top}" width="${BOARD.pw}" height="${ph}" viewBox="0 0 ${W} ${H}">`));
  });
  // 时间轴：节点对准三只表盘（海报内表盘中心 x = CX）
  const y = 112, xs = [0, 1, 2].map((i) => i * BOARD.pw + (STAGE.cx / W) * BOARD.pw);
  s.push(`<rect x="80" y="${y}" width="${BW - 160}" height="1" fill="${C.cream}" opacity=".2"/>`);
  s.push(`<rect x="80" y="${y - 1}" width="${xs[2] - 80}" height="3" fill="${C.red}"/>`);
  posters.forEach((p, i) => {
    s.push(`<circle cx="${xs[i]}" cy="${y + 0.5}" r="7" fill="${C.bg}" stroke="${C.red}" stroke-width="2.5"/><circle cx="${xs[i]}" cy="${y + 0.5}" r="2.5" fill="${C.red}"/>`);
    s.push(T(xs[i], y - 24, p.time.replace(/\s+p\.m\./, ''), { font: F.en, size: 28, w: 400, anchor: 'middle', ls: 3 }));
  });
  s.push(T(BW - 80, y - 24, 'p.m.', { font: F.en, size: 20, w: 400, op: 0.6, anchor: 'end' }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BW} ${BH}" width="${BW}" height="${BH}">${defs()}` +
    `<rect width="${BW}" height="${BH}" fill="${C.bg}"/>${s.join('')}</svg>`;
}

// ===== 竖版展板：之字形排布 + S 形配送路线（3:4）=====
const ZIG = { k: 0.43, pts: [[420, 372], [780, 820], [420, 1268]], side: ['right', 'left', 'right'] };

function zigScene(p, i) {
  const [x, y] = ZIG.pts[i], k = ZIG.k;
  return `<g transform="translate(${x - CX * k} ${y - CY * k}) scale(${k})">${city(p.arrived)}${dial(p.rd)}${p.body()}</g>`;
}

function zigText(p, i) {
  const [x, y] = ZIG.pts[i], right = ZIG.side[i] === 'right';
  const tx = right ? x + 316 : x - 316, a = right ? 'start' : 'end';
  const long = [...p.beat].length > 5;
  // 时间降级为注脚：与红色短线同一行，小字、淡色，像落款
  const ruleX = right ? tx : tx - 40, timeX = right ? tx + 54 : tx - 54;
  return [
    T(tx, y - 4, p.beat, { serif: true, size: long ? 52 : 62, w: F.headW, ls: long ? 5 : 10, anchor: a }),
    `<rect x="${ruleX}" y="${y + 33}" width="40" height="1.5" fill="${C.red}"/>`,
    T(timeX, y + 41, p.time, { font: F.en, size: 22, w: F.enW, ls: 2, op: 0.55, anchor: a }),
    T(tx, y + 88, F.enUp ? p.en.toUpperCase() : p.en, { font: F.en, size: F.enUp ? 19 : 27, w: F.enW, op: 0.72, ls: F.enUp ? 4 : F.enLs, anchor: a }),
  ].join('');
}

function zigSvg() {
  const [a, b, c] = ZIG.pts;
  const route = `M${a[0]} ${a[1]} C ${a[0] + 260} ${a[1] + 190}, ${b[0] - 260} ${b[1] - 190}, ${b[0]} ${b[1]} C ${b[0] - 260} ${b[1] + 190}, ${c[0] + 260} ${c[1] - 190}, ${c[0]} ${c[1]}`;
  const lockH = 30, lockW = lockH * LOGO_R + 10 + 24 * 4 + 5 * 3;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}` +
    `<rect width="${W}" height="${H}" fill="${C.bg}"/>` +
    `<path d="${route}" fill="none" stroke="${C.red}" stroke-width="3" stroke-dasharray="1 0" opacity=".9"/>` +
    posters.map(zigScene).join('') + posters.map(zigText).join('') +
    logo(1120 - lockW, 1528, lockH, true) + T(1120 - lockW + lockH * LOGO_R + 10, 1552, '顺丰同城', { font: 'HYYakuHei', size: 24, w: 700, ls: 5 }) +
    `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".22" style="mix-blend-mode:multiply"/></svg>`;
}

// ===== 竖版展板 B：居中纵向叠放；文字移到两侧竖排，填满左右 =====
// 左：竖排中文标题 / 中：表盘 / 右：竖排英文 + 红线 + 时间（注脚）
function stackSvg() {
  const k = 0.38, ys = [302, 800, 1298], s = [];
  const ringR = 0.38 * (R_FACE + 122), leftX = CX - ringR - 118, rightX = CX + ringR + 104;
  posters.forEach((p, i) => {
    const y = ys[i];
    s.push(`<g transform="translate(${CX - CX * k} ${y - CY * k}) scale(${k})">${city(p.arrived)}${dial(p.rd)}${p.body()}</g>`);
    // 左：竖排中文（多列时自右向左，整体以 leftX 居中）
    const size = 58, step = 74, gap = 74, cols = p.cols, n = cols.length;
    const longest = Math.max(...cols.map((c) => [...c].length));
    const top = y - (longest * step) / 2 + size * 0.86;
    cols.forEach((c, ci) => s.push(vcol(leftX + ((n - 1) / 2 - ci) * gap, top, c, { size, step })));
    // 右：竖排英文 + 红线 + 时间
    const en = { font: F.en, size: 26, w: 400, op: 0.72, ls: 0.6 };
    const enLen = p.en.length * 11.2;
    s.push(vtext(rightX, y - enLen / 2 - 40, p.en, en));
    s.push(`<rect x="${rightX + 44}" y="${y - enLen / 2 - 40}" width="1.5" height="34" fill="${C.red}"/>`);
    s.push(vtext(rightX + 52, y - enLen / 2 + 6, p.time, { font: F.en, size: 20, w: 400, op: 0.55, ls: 2 }));
  });
  const lockH = 32, lockW = lockH * LOGO_R + 10 + 26 * 4 + 5 * 3;
  s.push(logo(80, 60, lockH, true) + T(80 + lockH * LOGO_R + 10, 86, '顺丰同城', { font: 'HYYakuHei', size: 26, w: 700, ls: 5 }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}` +
    `<rect width="${W}" height="${H}" fill="${C.bg}"/>${s.join('')}` +
    `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".22" style="mix-blend-mode:multiply"/></svg>`;
}

// ===== 竖版展板 C："品"字形——两个铺垫 + 一个高潮（3:4）=====
// 上排：画1、画2 小表盘并排（铺垫）；下方：画3 大表盘（高潮）；主标语只出现一次
function pyramidSvg() {
  const OUTER = R_FACE + 122; // 含城市环的外半径（表盘场景单位）
  const scene = (p, x, y, r) => {
    const k = r / OUTER;
    return `<g transform="translate(${x - CX * k} ${y - CY * k}) scale(${k})">${city(p.arrived)}${dial(p.rd)}${p.body()}</g>`;
  };
  const s = [];
  const small = 232, big = 306, row = 372, bigY = 1118;
  const xs = [318, 882];
  // 上排两张：小表盘 + 下方小标题、时间注脚、英文
  [0, 1].forEach((i) => {
    const p = posters[i], x = xs[i];
    s.push(scene(p, x, row, small));
    s.push(T(x + 5, row + small + 64, p.line, { serif: true, size: 46, w: 500, ls: 14, anchor: 'middle' }));
    s.push(T(x, row + small + 98, `${p.en}`, { font: F.en, size: 21, w: 400, op: 0.7, anchor: 'middle' }));
  });
  // 时间注脚：放在小表盘上方
  [0, 1].forEach((i) => s.push(T(xs[i], row - small - 22, posters[i].time, { font: F.en, size: 20, w: 400, op: 0.55, ls: 3, anchor: 'middle' })));
  // 下方：高潮大表盘
  const p3 = posters[2];
  s.push(scene(p3, CX, bigY, big));
  s.push(T(CX, bigY - big - 26, p3.time, { font: F.en, size: 22, w: 400, op: 0.6, ls: 3, anchor: 'middle' }));
  // 主标语：全板唯一的大字
  s.push(T(CX + 8, 1506, '同城，即同时', { serif: true, size: 64, w: 600, ls: 18, anchor: 'middle' }));
  s.push(`<rect x="${CX - 20}" y="1530" width="40" height="1.5" fill="${C.red}"/>`);
  s.push(T(CX, 1568, p3.en, { font: F.en, size: 24, w: 400, op: 0.72, anchor: 'middle' }));
  // 品牌：左上
  s.push(logo(80, 56, 30, true) + T(80 + 30 * LOGO_R + 10, 80, '顺丰同城', { font: 'HYYakuHei', size: 24, w: 700, ls: 5 }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}` +
    `<rect width="${W}" height="${H}" fill="${C.bg}"/>${s.join('')}` +
    `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".22" style="mix-blend-mode:multiply"/></svg>`;
}

// ===== 竖版展板 D：计时码表——主表盘是结局，两只副表盘是前两拍（3:4）=====
function chronoSvg() {
  const s = [];
  const M = { x: CX, y: 610, r: 380 }; // 主表盘（表面半径）
  const SUB = [{ x: 236, y: 1128, r: 166 }, { x: 964, y: 1128, r: 166 }];
  const sceneAt = (inner, x, y, r) => {
    const k = r / R_FACE;
    return `<g transform="translate(${x - CX * k} ${y - CY * k}) scale(${k})">${inner}</g>`;
  };
  // 主表盘：环形城市 + 结局画面
  const p3 = posters[2];
  s.push(sceneAt(city(true) + dial(p3.rd) + p3.body(), M.x, M.y, M.r));
  // 副表盘：金属感表圈 + 前两拍画面
  SUB.forEach((d, i) => {
    const p = posters[i];
    s.push(`<circle cx="${d.x}" cy="${d.y}" r="${d.r + 22}" fill="${C.bg}" filter="url(#glow)"/>`);
    s.push(`<circle cx="${d.x}" cy="${d.y}" r="${d.r + 14}" fill="none" stroke="#3B3632" stroke-width="10"/>`);
    s.push(`<circle cx="${d.x}" cy="${d.y}" r="${d.r + 19}" fill="none" stroke="${C.cream}" stroke-width="1" opacity=".25"/>`);
    s.push(sceneAt(dial(p.rd) + p.body(), d.x, d.y, d.r));
  });
  // 文字：副表盘下的小标题 + 时间注脚
  SUB.forEach((d, i) => {
    const p = posters[i], y = d.y + d.r + 74;
    s.push(T(d.x + 6, y, p.line, { serif: true, size: 34, w: 500, ls: 12, anchor: 'middle' }));
    s.push(T(d.x, y + 32, `${p.time}`, { font: F.en, size: 17, w: 400, op: 0.55, ls: 3, anchor: 'middle' }));
  });
  // 主表盘时间：顶部居中
  s.push(T(CX, 98, p3.time, { font: F.en, size: 22, w: 400, op: 0.6, ls: 4, anchor: 'middle' }));
  // 主标语：全板唯一的大字
  s.push(T(CX + 9, 1494, '同城，即同时', { serif: true, size: 66, w: 600, ls: 18, anchor: 'middle' }));
  s.push(`<rect x="${CX - 20}" y="1520" width="40" height="1.5" fill="${C.red}"/>`);
  s.push(T(CX, 1560, 'A craving begins — and arrives in a moment. Same city, same moment.', { font: F.en, size: 21, w: 400, op: 0.68, anchor: 'middle' }));
  s.push(logo(80, 56, 30, true) + T(80 + 30 * LOGO_R + 10, 80, '顺丰同城', { font: 'HYYakuHei', size: 24, w: 700, ls: 5 }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}` +
    `<rect width="${W}" height="${H}" fill="${C.bg}"/>${s.join('')}` +
    `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".22" style="mix-blend-mode:multiply"/></svg>`;
}

function svg(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}` +
    `<rect width="${W}" height="${H}" fill="${C.bg}"/>${stage(city(p.arrived) + dial(p.rd) + p.body())}${frame(p)}` +
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
  await page.setContent(`<html><body style="margin:0">${boardSvg(svgs)}</body></html>`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'board.png') });
  console.log('board');
  await page.setViewportSize({ width: W, height: H });
  await page.setContent(`<html><body style="margin:0">${zigSvg()}</body></html>`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'board-vertical.png') });
  console.log('board-vertical');
  await page.setContent(`<html><body style="margin:0">${stackSvg()}</body></html>`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'board-stack.png') });
  await page.setContent(`<html><body style="margin:0">${pyramidSvg()}</body></html>`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'board-pyramid.png') });
  await page.setContent(`<html><body style="margin:0">${chronoSvg()}</body></html>`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'board-chrono.png') });
  await browser.close();
})();
