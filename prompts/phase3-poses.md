# 阶段 3 · 三张姿势图

## 阶段 1 收尾：道具设定（风格 A）审查 ✅ 通过

素材：`assets/generated/phase1-v3-props/props-sheet-styleA.webp`

- 风格与样张 A 一致，平、利落、图标化程度正好，适合缩小放在外圈。
- 骑手的红色保温箱与红色路径呼应，保留。
- 纸箱正面留白够大，logo 合成时加。

## 生成规则（三张通用）

- **人物和沙发一起生成**；沙发与风格样张 A 是同一张：奶白色毛圈面料、圆润扶手、**正面视角、水平放置、居中**。
- **三张画布、沙发大小和位置完全一致**：横版 3:2，沙发居中，约占画面宽度 70%。
- **她的胯部在沙发水平方向的正中间**（这是表心）。头永远在左侧、脚在右侧。
- 纯色底 `#F5F1EA`，只允许沙发下一点点接触阴影。
- 指针比例：**上半身 + 头 + 手臂** 明显长于 **腿**（约 3 : 2）。

## 画1 · 14:45 · 馋了（分针指 9 = 水平向左）

```
Same character and same sofa as the style A image, same illustration style (flat shapes, no outlines, crisp edges, very subtle grain, palette off-white #F5F1EA, oat #E3D7C6, ink brown #2B2420, accent red #C93A3A).

SCENE: straight front view of the long cream sofa, perfectly horizontal and centered, taking about 70% of the canvas width. She lies flat on her back along the seat cushion, body seen in side profile. Her head is toward the LEFT end, feet toward the RIGHT end. Her hips are exactly at the horizontal center of the sofa.
Both arms are stretched straight beyond her head toward the left, forming one straight horizontal line with her torso (arms may extend past the left armrest). Legs extend to the right with knees only slightly bent, feet resting on the cushion, not raised high. Her torso + arms are clearly longer than her legs (about 3:2).
Expression: bored, daydreaming, eyes looking up.

Plain solid off-white #F5F1EA background, only a faint contact shadow under the sofa. No cake, no other objects, no text. Landscape 3:2.
```

## 画2 · 14:50 · 下单（分针指 10 = 向左上 30°）

```
Same character, same sofa, same style, same canvas size, same sofa size and position as the previous image.

SCENE: front view of the same sofa, horizontal and centered. A round beige knot pillow sits near the LEFT end of the seat. She is half-reclined: her upper back leans on the knot pillow, her upper body raised at about 30 degrees above horizontal, pointing toward the upper LEFT. Her hips stay exactly at the horizontal center of the sofa. One arm holds a smartphone up in front of her face; the phone screen is blank and softly glowing. Legs extend to the right along the seat, knees slightly bent. Upper body + head clearly longer than her legs.
Expression: excited, eyes sparkling, looking at the phone.

Plain solid off-white #F5F1EA background, only a faint contact shadow under the sofa. No text. Landscape 3:2.
```

## 画3 · 15:00 · 到嘴（分针指 12 = 竖直向上）

```
Same character, same sofa, same style, same canvas size, same sofa size and position as the previous images.

SCENE: front view of the same sofa, horizontal and centered. She sits upright, sideways on the seat, body in side profile facing RIGHT. Her hips are exactly at the horizontal center of the sofa. Torso perfectly vertical; both arms raised straight up, holding the whole strawberry cream cake high above her head (the same cake as the prop sheet). Her legs extend to the RIGHT along the seat cushion, knees slightly bent, slippers near the right armrest — her legs point horizontally, NOT crossed, NOT dangling down. Torso + arms + cake are clearly longer than her legs.
Expression: blissful, eyes closed, a small dab of whipped cream on her lips and nose tip, calm satisfied smile.

Plain solid off-white #F5F1EA background, only a faint contact shadow under the sofa. No text. Landscape 3:2.
```

## 审查要点

1. 三张沙发是否同一张、同一位置
2. 胯部是否在沙发中点
3. 分针角度：9 点 / 10 点 / 12 点
4. 腿是否沿沙发朝右，且明显短于上半身

## v1 审查

素材：`assets/generated/phase3-poses-v1/`

实测（1536×1024）：三张沙发宽度一致（x 85–1451，中点 768）；画3 的沙发整体低了约 140 px，合成时平移即可。

| | 结论 | 说明 |
|---|---|---|
| 画1 | ✅ 通过 | 胯部 ≈ 沙发中点；手臂伸直过头顶；上身 : 腿 ≈ 1 : 0.7 |
| 画2 | ✅ 通过（可选微调） | 上身约 26°，接近 10 点；表情（黄色星星眼、大张嘴）比另两张更卡通，如有余力可返工为"克制的惊喜" |
| 画3 | 🔁 返工 | ① 胯部偏左约 100 px，上身后仰，蛋糕偏右 → 分针不竖直；② 参考图"直接啃整个蛋糕"的劲儿丢了 |

### 找回"啃整个蛋糕"

参考图的精髓是：不切、不用盘子叉子，捧着整个蛋糕直接下嘴——馋到等不及。
但如果把蛋糕放到嘴边啃，手臂放下，分针会变短，和腿分不出长短。
**方案：蛋糕仍举过头顶，但蛋糕正面已经少了一大口，她脸上沾着奶油。**
观众一眼读出"她刚刚已经啃了一口"——馋的劲儿回来了，分针也保住了。

### 画3 返工提示词

```
Redo the last image. Keep exactly the same character, style, canvas size, and the SAME sofa as the first image of this set — same size and same vertical position (the sofa top edge at the same height as in the first image).

Changes:
1) Her hips are exactly at the horizontal center of the sofa.
2) Her torso is perfectly vertical — not leaning back. Both arms go straight up directly above her shoulders, so the cake is directly above her hips. Head, torso, arms and cake form one vertical line.
3) The whole strawberry cream cake now has ONE BIG BITE missing from its front edge — a clear, round bite mark showing the sponge layers inside. She has obviously just bitten straight into the whole cake.
4) Whipped cream smeared on her lips, nose tip and one cheek. Eyes closed, cheeks slightly full as if still chewing, a blissful, satisfied smile.
5) Legs still extend to the RIGHT along the seat cushion, knees slightly bent, slippers near the right armrest.

Plain solid off-white #F5F1EA background, faint contact shadow under the sofa only. No text. Landscape 3:2.
```
