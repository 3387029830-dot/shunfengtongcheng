# 阶段 1 · 视觉开发

## v1（已生成，已审查）

素材：`assets/generated/phase1-v1/`

### 审查结论：人物身份对了，风格不够高级

**保留**
- 人物识别度：丸子头 + 红卫衣 + 深色裤 + 毛绒拖鞋，一眼能认出
- 道具：沙发、结绳抱枕、草莓蛋糕、纸箱的造型都可用

**问题**
1. **整体是"治愈系插画"，不是"品牌广告"**：Q 版比例、星星眼、吐舌头、细碎发丝，可爱有余、格调不足。
2. **全图米黄滤镜，缺对比**：底、人、道具都在同一个暖调明度里，画面发闷，放到海报上没有冲击力。
3. **细节太多**：毛绒纹理遍布卫衣、裤子；店铺和楼门口像绘本场景。外圈里这些元素只有拇指大，需要的是简洁图标。
4. **姿势不满足指针要求**：
   - 躺姿：手枕在脑后，而不是伸直过头顶 → 分针不够长、不够直；膝盖抬太高 → 时针变形。
   - 坐姿：腿伸得笔直，和"上半身 + 手臂"差不多长 → 时针分针分不出来。应改为盘腿或屈膝。
   - 这两点在阶段 3 生成正式姿势时控制，设定图阶段先解决风格。

## v2 · 先定风格（3 张风格样张，挑 1）

商业项目惯例：先用同一个画面试 2–3 种风格，选定后再重画设定图。
三张都画**画3 的高光时刻**，方便直接比较。

在**同一个 ChatGPT 对话**中依次发送（模型能参考前面的人物设定）。

### 共用画面描述（已包含在每段提示词里）

同一位女主角，侧面，盘腿坐直在一张长沙发上，双臂向上伸直把一个完整的草莓奶油蛋糕举过头顶，嘴角沾一点奶油，平静满足的微笑。

### 风格 A · 编辑插画（推荐）

```
Keep the same character identity from the character sheet above (messy high bun, oversized red hoodie, dark lounge pants, cream fluffy slippers), but completely change the art style.

SCENE: side view. She sits upright, cross-legged, on a long low cream sofa. Both arms raised straight up, holding a whole strawberry cream cake high above her head. A small dab of cream on her lips, a calm, satisfied smile.

STYLE: contemporary editorial illustration for a premium brand campaign. Bold simplified shapes, large flat color areas, NO outlines, crisp clean edges. Mature, elegant proportions (about 7 heads tall), minimal facial features. Limited palette only: warm off-white #F5F1EA, oat #E3D7C6, deep ink brown #2B2420, one accent red #C93A3A. Only a very subtle paper grain. Sophisticated and calm, like a magazine cover illustration. NOT cute, NOT chibi, NOT a storybook.

COMPOSITION: plain off-white background, generous empty space, the figure and sofa occupy only the central 40% of the canvas. Portrait 3:4. No text.
```

### 风格 B · 孔版印刷（Risograph）

```
Same character, same scene as before: side view, sitting upright cross-legged on a long low cream sofa, both arms raised straight up holding a whole strawberry cream cake high above her head, a dab of cream on her lips, calm satisfied smile.

STYLE: risograph print illustration. Limited three-ink palette — warm red #C93A3A, ink brown #2B2420, oat #E3D7C6 — on off-white paper. Visible print grain and slight ink misregistration. Flat simplified shapes, mature proportions (about 7 heads tall), minimal facial features. Modern design-studio poster aesthetic, not cute, not chibi.

COMPOSITION: plain off-white background, generous empty space, the figure and sofa occupy only the central 40% of the canvas. Portrait 3:4. No text.
```

### 风格 C · 精致线描

```
Same character, same scene as before: side view, sitting upright cross-legged on a long low cream sofa, both arms raised straight up holding a whole strawberry cream cake high above her head, a dab of cream on her lips, calm satisfied smile.

STYLE: minimal Japanese editorial illustration. Fine, uniform hairline outlines in dark brown #2B2420, flat muted fills (off-white, oat #E3D7C6, one accent red #C93A3A), very restrained details, small precise facial features, mature proportions (about 7 heads tall). Quiet, elegant, high-end lifestyle brand look. Not cute, not chibi.

COMPOSITION: plain off-white background, generous empty space, the figure and sofa occupy only the central 40% of the canvas. Portrait 3:4. No text.
```

### 选定后

用选中的风格重画：人物设定图（含指针姿势）+ 道具设定图（外圈元素改为简洁图标）。提示词在选定后给出。

## v2 · 风格样张审查

素材：`assets/generated/phase1-v2-style/`

| | A 编辑插画 | B 孔版印刷 | C 精致线描 |
|---|---|---|---|
| 高级感 | ★★★★ 平涂干净、配色克制，最像品牌广告 | ★★★ 有态度、有设计感，但偏"艺术海报" | ★★ 细线显得单薄，像通用素材插画 |
| 产品（蛋糕）诱人度 | 最好：奶油、草莓清晰 | 颗粒吃掉了细节 | 一般 |
| 与代码钟面合成 | 最好：无描边平涂，和矢量几何天然契合 | 难：重颗粒与干净矢量线冲突 | 可以，但线条粗细难统一 |
| 三张一致性 | 高 | 低（颗粒每次随机） | 中 |

**结论：选 A**，并做两点微调：
1. 再平一点：减少柔和渐变，边缘更利落（向 B 借一点点颗粒即可）。
2. 底色在合成时统一替换为 `#F5F1EA`，生成图只需纯色底方便抠图。

**一个修正（我此前的设计问题）**：盘腿正面坐时，腿收在身体正下方，**时针消失了**。
时针必须沿沙发向右（3 点）伸出。阶段 3 的坐姿改为：**侧身坐在沙发上，上身直立，双腿沿坐垫向右伸、膝盖微屈**（屈膝让腿变短，保持 1 : 0.64）。

**合成策略**：每张"人物 + 沙发"一起生成（坐、靠的接触关系更自然），沙发保持正面、水平；
我把胯部对齐表心、按刻度微调缩放和位置。其余道具单独生成。

## v3 · 道具设定（风格 A）

```
Using exactly the same illustration style as the FIRST of the three style images (style A: flat shapes, no outlines, crisp clean edges, very subtle grain, limited palette of off-white #F5F1EA, oat #E3D7C6, ink brown #2B2420, accent red #C93A3A), create a prop sheet. Make it slightly flatter than before — fewer soft gradients, crisper edges.

Plain solid off-white #F5F1EA background. Each object separate with wide spacing, no overlapping, no text, no logos:

1) the same whole strawberry cream cake, side-front view, on a thin dark cake board
2) an opened delivery box with the flaps open: matte off-white box with one deep ink-brown band, a large blank front panel
3) a delivery rider on a small electric scooter with an insulated box on the back, side view, facing RIGHT, ink-brown uniform and helmet, highly simplified
4) a minimal bakery storefront: flat front facade, red and off-white striped awning, one window with a simple cake silhouette — almost iconographic, very few details
5) a minimal apartment entrance: flat front facade with one door and a small step — almost iconographic, very few details

Landscape 3:2.
```
