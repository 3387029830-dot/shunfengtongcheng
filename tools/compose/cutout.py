"""把 AI 生成的纯色底插画抠成透明 PNG，并切出道具。

用法：python3 tools/compose/cutout.py
输入：assets/generated/phase3-poses-final/*.webp
输出：build/cutouts/*.png
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets/generated/phase3-poses-final"
OUT = ROOT / "build/cutouts"
OUT.mkdir(parents=True, exist_ok=True)

LO, HI = 8, 40  # 与背景色差（RGB 绝对差之和）的软阈值


def matte(rgb: np.ndarray) -> np.ndarray:
    """返回 RGBA。只对与边框连通的近背景区域做透明，内部浅色（奶油、白边）不受影响。"""
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)
    diff = np.abs(rgb - bg).sum(2)
    lum = rgb.mean(2)
    # 只有"不比背景亮"的近背景色才可能是背景/阴影；比背景亮的奶油、白边一律保留
    near = (diff < HI) & (lum <= bg.mean() + 6)
    lab, _ = ndimage.label(near)
    edge_labels = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    exterior = np.isin(lab, edge_labels[edge_labels > 0])
    # 背景颗粒里偶尔偏亮的噪点：被背景包围的小块也算背景
    holes, _ = ndimage.label(~exterior)
    sizes = np.bincount(holes.ravel())
    small = sizes < 400
    small[0] = False
    exterior |= small[holes]
    alpha = np.ones((h, w))
    alpha[exterior] = np.clip((diff[exterior] - LO) / (HI - LO), 0, 1)
    a = alpha[..., None]
    fg = np.where(a > 0.01, (rgb - (1 - a) * bg) / np.maximum(a, 0.01), 0)
    out = np.dstack([np.clip(fg, 0, 255), alpha * 255]).astype(np.uint8)
    return out


def save_trim(rgba: np.ndarray, name: str, pad: int = 4):
    ys, xs = np.where(rgba[..., 3] > 8)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    y0, x0 = max(y0 - pad, 0), max(x0 - pad, 0)
    crop = rgba[y0 : y1 + pad + 1, x0 : x1 + pad + 1]
    Image.fromarray(crop).save(OUT / f"{name}.png")
    return int(x0), int(y0), crop.shape[1], crop.shape[0]


def load(name):
    return np.asarray(Image.open(SRC / f"{name}.webp").convert("RGB")).astype(float)


if __name__ == "__main__":
    # 姿势图：整张保留原坐标（不裁切），方便按像素坐标对齐表心
    for name in ["pose1-1445", "pose2-1450", "pose3-1500"]:
        Image.fromarray(matte(load(name))).save(OUT / f"{name}.png")
        print("pose", name)

    # 品牌骑手：抠图 + 在配送箱正面贴反白 logo
    rider = matte(load("rider-sf"))
    mark = Image.open(ROOT / "assets/brand/logo-mark-white.png")
    mh = 86
    mark = mark.resize((round(mark.width * mh / mark.height), mh), Image.LANCZOS)
    rimg = Image.fromarray(rider)
    rimg.alpha_composite(mark, (408, 500))
    print("prop rider-sf", save_trim(np.asarray(rimg), "rider-sf"))

    # 道具：按连通块切出
    rgba = matte(load("props"))
    solid = ndimage.binary_dilation(rgba[..., 3] > 30, iterations=12)
    lab, n = ndimage.label(solid)
    boxes = ndimage.find_objects(lab)
    big = [(s, (s[0].stop - s[0].start) * (s[1].stop - s[1].start)) for s in boxes]
    big = [s for s, area in sorted(big, key=lambda t: -t[1])[:5]]
    h, w = rgba.shape[:2]

    def which(s):
        cy = (s[0].start + s[0].stop) / 2 / h
        cx = (s[1].start + s[1].stop) / 2 / w
        if cy < 0.5:
            return "cake" if cx < 0.33 else "box" if cx < 0.66 else "rider"
        return "bakery" if cx < 0.5 else "home"

    for s in big:
        name = which(s)
        piece = rgba.copy()
        mask = np.zeros(rgba.shape[:2], bool)
        mask[s] = True
        piece[~mask] = 0
        print("prop", name, save_trim(piece, name))
