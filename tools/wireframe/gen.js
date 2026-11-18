// 生成三张构图线框 + 三联总览
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '../../wireframes');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  bg: '#F4EDE4', dial: '#EADFD1', oat: '#E6DACA', gray: '#BFB2A2',
  red: '#D6454A', cocoa: '#4A3A33', sofa: '#FBF7F1', note: '#4F74B0', line: '#8C7A6B',
};
const W = 1200, H = 1600, cx = 600, cy = 800;
const R_DIAL = 430, R_TICK = 400, R_ST_IN = 450, R_ST_OUT = 520, R_ST = 485;
const LM = 360, LH = 230; // 分针 / 时针 长度

const pt = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};
const f = (n) => n.toFixed(1);

function arc(a0, a1, r) {
  const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
  const large = ((a1 - a0 + 360) % 360) > 180 ? 1 : 0;
  return `M${f(x0)} ${f(y0)} A${r} ${r} 0 ${large} 1 ${f(x1)} ${f(y1)}`;
}

function note(x, y, text, anchor = 'start', size = 22) {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${C.note}" text-anchor="${anchor}" font-family="WenQuanYi Zen Hei">${text}</text>`;
}

function panel(p) {
  const s = [];
  s.push(`<rect width="${W}" height="${H}" fill="${C.bg}"/>`);
  // 外圈街道
  s.push(`<circle cx="${cx}" cy="${cy}" r="${(R_ST_IN + R_ST_OUT) / 2}" fill="none" stroke="${C.oat}" stroke-width="${R_ST_OUT - R_ST_IN}"/>`);
  s.push(`<circle cx="${cx}" cy="${cy}" r="${R_ST}" fill="none" stroke="${C.gray}" stroke-width="3" stroke-dasharray="14 12"/>`);
  if (p.rider !== 270) s.push(`<path d="${arc(270, p.rider === 0 ? 360 : p.rider, R_ST)}" fill="none" stroke="${C.red}" stroke-width="8" stroke-linecap="round" opacity=".55"/>`);
  // 蛋糕店（9点）与家（12点）
  const [bx, by] = pt(270, R_ST);
  s.push(`<rect x="${bx - 34}" y="${by - 34}" width="68" height="68" rx="10" fill="${C.sofa}" stroke="${C.line}" stroke-width="3"/>`);
  s.push(`<text x="${bx}" y="${by + 9}" font-size="24" text-anchor="middle" fill="${C.line}" font-family="WenQuanYi Zen Hei">店</text>`);
  const [hx, hy] = pt(0, R_ST);
  s.push(`<path d="M${hx - 34} ${hy + 30} V${hy - 6} L${hx} ${hy - 36} L${hx + 34} ${hy - 6} V${hy + 30} Z" fill="${C.sofa}" stroke="${C.line}" stroke-width="3"/>`);
  s.push(`<text x="${hx}" y="${hy + 20}" font-size="24" text-anchor="middle" fill="${C.line}" font-family="WenQuanYi Zen Hei">家</text>`);
  // 表盘
  s.push(`<circle cx="${cx}" cy="${cy}" r="${R_DIAL}" fill="${C.dial}"/>`);
  for (let i = 0; i < 12; i++) {
    const [x, y] = pt(i * 30, R_TICK);
    s.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${i % 3 === 0 ? 13 : 7}" fill="${C.gray}"/>`);
  }
  // 沙发（9-3 轴）
  s.push(`<rect x="215" y="${cy - 105}" width="770" height="120" rx="40" fill="${C.sofa}" stroke="${C.gray}" stroke-width="3"/>`);
  s.push(`<rect x="235" y="${cy + 10}" width="730" height="70" rx="22" fill="${C.sofa}" stroke="${C.gray}" stroke-width="3"/>`);
  s.push(`<rect x="195" y="${cy - 40}" width="70" height="125" rx="30" fill="${C.sofa}" stroke="${C.gray}" stroke-width="3"/>`);
  s.push(`<rect x="935" y="${cy - 40}" width="70" height="125" rx="30" fill="${C.sofa}" stroke="${C.gray}" stroke-width="3"/>`);
  // 道具（每张不同，放在人物下层）
  s.push(p.under || '');
  // 时针：腿
  const [lx, ly] = pt(p.h, LH);
  s.push(`<line x1="${cx}" y1="${cy}" x2="${f(lx)}" y2="${f(ly)}" stroke="${C.cocoa}" stroke-width="40" stroke-linecap="round"/>`);
  const [sx, sy] = pt(p.h, LH + 10);
  s.push(`<ellipse cx="${f(sx)}" cy="${f(sy)}" rx="30" ry="22" fill="${C.sofa}" stroke="${C.gray}" stroke-width="3" transform="rotate(${p.h - 90} ${f(sx)} ${f(sy)})"/>`);
  // 分针：上半身 + 头 + 丸子
  const [tx, ty] = pt(p.m, 270);
  s.push(`<line x1="${cx}" y1="${cy}" x2="${f(tx)}" y2="${f(ty)}" stroke="${C.red}" stroke-width="52" stroke-linecap="round"/>`);
  const [kx, ky] = pt(p.m, 318);
  s.push(`<circle cx="${f(kx)}" cy="${f(ky)}" r="34" fill="#F1D3BC" stroke="${C.line}" stroke-width="3"/>`);
  const [ux, uy] = pt(p.m, LM - 6);
  s.push(`<circle cx="${f(ux)}" cy="${f(uy)}" r="17" fill="#6B4A3A"/>`);
  // 轴心
  s.push(`<circle cx="${cx}" cy="${cy}" r="16" fill="${C.cocoa}" stroke="${C.sofa}" stroke-width="5"/>`);
  // 骑手
  const [rx, ry] = pt(p.rider, R_ST);
  const rOff = p.rider === 0 ? -50 : p.rider === 270 ? 0 : 0;
  s.push(`<circle cx="${f(p.rider === 0 ? rx + 62 : rx)}" cy="${f(p.rider === 270 ? ry + 58 : p.rider === 0 ? ry + 8 : ry)}" r="20" fill="${C.cocoa}" stroke="${C.sofa}" stroke-width="4"/>`);
  s.push(p.over || '');
  // ---- 标注（蓝色，最终稿删除） ----
  const [gx, gy] = pt(p.m, R_TICK);
  s.push(`<line x1="${cx}" y1="${cy}" x2="${f(gx)}" y2="${f(gy)}" stroke="${C.note}" stroke-width="2" stroke-dasharray="6 6"/>`);
  s.push(p.notes || '');
  // 时间戳
  s.push(`<text x="80" y="150" font-size="56" fill="${C.cocoa}" font-family="Noto Sans CJK SC" font-weight="300" letter-spacing="4">${p.time}</text>`);
  s.push(note(80, 192, p.timeNote));
  // logo 占位
  s.push(`<rect x="980" y="1470" width="140" height="60" rx="8" fill="none" stroke="${C.line}" stroke-width="2" stroke-dasharray="6 5"/>`);
  s.push(`<text x="1050" y="1508" font-size="20" text-anchor="middle" fill="${C.line}" font-family="WenQuanYi Zen Hei">LOGO</text>`);
  s.push(p.text || '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${s.join('\n')}</svg>`;
}

const panels = [
  {
    name: 'panel1_1445', time: '14:45', m: 270, h: 82.5, rider: 270,
    timeNote: '画1 · 馋了',
    over: `<ellipse cx="420" cy="540" rx="120" ry="90" fill="#FFFFFF" stroke="${C.gray}" stroke-width="3"/>
      <circle cx="300" cy="640" r="16" fill="#FFF" stroke="${C.gray}" stroke-width="3"/><circle cx="275" cy="675" r="9" fill="#FFF" stroke="${C.gray}" stroke-width="3"/>
      <text x="420" y="550" font-size="26" text-anchor="middle" fill="${C.line}" font-family="WenQuanYi Zen Hei">草莓蛋糕</text>`,
    notes: note(130, 1395, '分针 = 上半身+伸直双臂，丸子头碰 9 点刻度（长 ≈ 表盘半径 84%）')
      + note(130, 1430, '时针 = 腿，膝盖微屈，长度约为分针的 0.64，指向 3 点略偏上（2:45）')
      + note(130, 1465, '外圈：骑手停在 9 点蛋糕店门口，橱窗里是同一个蛋糕'),
  },
  {
    name: 'panel2_1450', time: '14:50', m: 300, h: 85, rider: 300,
    timeNote: '画2 · 下单',
    under: `<ellipse cx="380" cy="700" rx="85" ry="55" fill="#F3E9D8" stroke="${C.gray}" stroke-width="3" transform="rotate(-30 380 700)"/>`,
    over: `<rect x="390" y="470" width="70" height="120" rx="12" fill="${C.cocoa}" transform="rotate(-20 425 530)"/>
      <rect x="400" y="483" width="50" height="90" rx="6" fill="#FFF6E5" transform="rotate(-20 425 530)"/>
      <text x="520" y="470" font-size="22" fill="${C.line}" font-family="WenQuanYi Zen Hei">「骑手已取货」</text>`,
    notes: note(130, 1395, '分针抬到 10 点：靠在泡泡球抱枕上半躺，单手举手机（手臂顺带拉长分针）')
      + note(130, 1430, '外圈：骑手已出发，走到 10 点，与她的上半身同一角度（红色 = 已走路程）')
      + note(130, 1465, '手机屏幕：简化的顺丰同城订单界面'),
  },
  {
    name: 'panel3_1500', time: '15:00', m: 0, h: 90, rider: 0,
    timeNote: '画3 · 到嘴',
    over: `<ellipse cx="600" cy="392" rx="78" ry="22" fill="#FFF" stroke="${C.gray}" stroke-width="3"/>
      <rect x="522" y="392" width="156" height="50" fill="#FFF" stroke="${C.gray}" stroke-width="3"/>
      <ellipse cx="600" cy="442" rx="78" ry="14" fill="#FFF" stroke="${C.gray}" stroke-width="3"/>
      <circle cx="575" cy="385" r="10" fill="${C.red}"/><circle cx="605" cy="380" r="10" fill="${C.red}"/><circle cx="632" cy="387" r="10" fill="${C.red}"/>
      <path d="M780 860 h120 v80 h-120 z M780 860 l-25 -40 h120 l25 40" fill="#FBF7F1" stroke="${C.line}" stroke-width="3"/>
      <text x="840" y="912" font-size="20" text-anchor="middle" fill="${C.line}" font-family="WenQuanYi Zen Hei">顺丰盒</text>
      <text x="700" y="300" font-size="30" fill="${C.cocoa}" font-family="WenQuanYi Zen Hei">叮咚~</text>`,
    notes: note(80, 240, '双手举整个蛋糕过头顶 → 分针指 12；嘴边鼻尖沾奶油；腿搭沙发指 3', 'start', 20),
    text: `<text x="80" y="1430" font-size="64" fill="${C.cocoa}" font-family="Noto Serif CJK SC" font-weight="700" letter-spacing="10">同城，即同时。</text>
      <text x="84" y="1490" font-size="26" fill="${C.line}" font-family="Noto Sans CJK SC" font-weight="300" letter-spacing="4">一念起，一刻至 —— 顺丰同城</text>`,
  },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const svgs = [];
  for (const p of panels) {
    const svg = panel(p);
    svgs.push(svg);
    fs.writeFileSync(path.join(OUT, p.name + '.svg'), svg);
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await page.screenshot({ path: path.join(OUT, p.name + '.png'), clip: { x: 0, y: 0, width: W, height: H } });
  }
  // 三联总览 16:9
  const TW = 1920, TH = 1080;
  await page.setViewportSize({ width: TW, height: TH });
  const thumbs = svgs.map((s) => s.replace(`width="${W}" height="${H}"`, 'width="540" height="720"')).join('');
  await page.setContent(`<html><body style="margin:0;background:#EFE6DA;font-family:'Noto Sans CJK SC'">
    <div style="padding:70px 90px 0;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="font-family:'Noto Serif CJK SC';font-weight:700;font-size:44px;color:#4A3A33;letter-spacing:6px">同城，即同时。</div>
      <div style="font-size:20px;color:#8C7A6B;letter-spacing:2px">顺丰同城系列海报 · 构图线框 v1</div></div>
    <div style="display:flex;gap:60px;justify-content:center;margin-top:60px">${thumbs}</div></body></html>`);
  await page.screenshot({ path: path.join(OUT, 'triptych_overview.png') });
  await browser.close();
  console.log('done');
})();
