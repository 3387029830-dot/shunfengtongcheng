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
