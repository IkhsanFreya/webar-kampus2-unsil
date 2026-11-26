"""Generate an AR-tracking-optimized revised campus map from the new A4 PNG.

Preserves all original asset files and keeps the underlying map geometry 1:1
(zero shift/rescale) so every marker coordinate remains identical.
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC_MAP = ROOT / "public" / "assets" / "denah kampus 2.png"
LOGO_PATH = ROOT / "public" / "assets" / "logo-unsil.png"
OUT_PRINT = ROOT / "public" / "assets" / "denah-kampus2-ar.png"
OUT_TARGET = ROOT / "public" / "targets" / "denah-kampus2-ar.png"

TARGET_WIDTH = 1024
TARGET_HEIGHT = 1448

FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")
FONT_REG = Path(r"C:\Windows\Fonts\arial.ttf")

# Colors matching UNSIL institutional palette
DARK = (20, 32, 28)       # #14201C
EMERALD = (6, 95, 70)     # #065F46
EMERALD_LT = (16, 185, 129)  # #10B981
EMERALD_SOFT = (232, 244, 239)
TECH_BLUE = (29, 78, 216)    # #1D4ED8
AGRI_GREEN = (21, 128, 61)   # #15803D
AMBER = (180, 83, 9)      # #B45309
AMBER_LT = (245, 158, 11) # #F59E0B
SLATE = (71, 85, 105)     # #475569
FACILITY_SLATE = (51, 65, 85) # #334155
MUTED = (100, 116, 139)   # #64748B
BORDER_LT = (203, 213, 225)
WHITE = (255, 255, 255)


def load_font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def detect_red_markers(arr: np.ndarray) -> list[tuple[float, float]]:
    """Detect the 16 red marker squares and return sorted (xPercent, yPercent)."""
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    red_mask = (r > 180) & (g < 80) & (b < 80)
    step = 4
    small = red_mask[::step, ::step]
    sh, sw = small.shape
    vis = np.zeros_like(small, dtype=bool)
    h, w = arr.shape[:2]
    pts: list[tuple[float, float]] = []

    for y in range(sh):
        for x in range(sw):
            if small[y, x] and not vis[y, x]:
                stack = [(y, x)]
                vis[y, x] = True
                miny = maxy = y
                minx = maxx = x
                cnt = 0
                while stack:
                    cy, cx = stack.pop()
                    cnt += 1
                    if cy < miny:
                        miny = cy
                    if cy > maxy:
                        maxy = cy
                    if cx < minx:
                        minx = cx
                    if cx > maxx:
                        maxx = cx
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = cy + dy, cx + dx
                            if 0 <= ny < sh and 0 <= nx < sw and small[ny, nx] and not vis[ny, nx]:
                                vis[ny, nx] = True
                                stack.append((ny, nx))
                if cnt >= 10:
                    cx_px = (minx * step + (maxx + 1) * step) / 2.0
                    cy_px = (miny * step + (maxy + 1) * step) / 2.0
                    pts.append((cx_px / w * 100.0, cy_px / h * 100.0))

    return sorted(pts, key=lambda p: (round(p[1], 1), round(p[0], 1)))


def assert_region_empty(ink: np.ndarray, name: str, x1: int, y1: int, x2: int, y2: int) -> None:
    hits = int(ink[y1:y2, x1:x2].sum())
    if hits > 0:
        raise RuntimeError(f"Collision detected in region '{name}' ({x1},{y1})-({x2},{y2}): {hits} ink pixels")


def draw_corner_fiducial(draw: ImageDraw.ImageDraw, cx: int, cy: int, dx: int, dy: int) -> None:
    """Draw asymmetric L-shaped architectural corner registration marks."""
    arm = 110
    thick = 10
    # Outer L
    x_end = cx + dx * arm
    y_end = cy + dy * arm
    draw.rectangle([min(cx, x_end), cy - thick // 2, max(cx, x_end), cy + thick // 2], fill=DARK)
    draw.rectangle([cx - thick // 2, min(cy, y_end), cx + thick // 2, max(cy, y_end)], fill=DARK)
    # Inner emerald accent square + crosshair
    sq_x = cx + dx * 28
    sq_y = cy + dy * 28
    draw.rectangle([sq_x - 10, sq_y - 10, sq_x + 10, sq_y + 10], fill=EMERALD)
    draw.rectangle([sq_x + dx * 24 - 6, sq_y - 6, sq_x + dx * 24 + 6, sq_y + 6], fill=AMBER)


def draw_compass_rose(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int) -> None:
    """Draw a high-contrast 8-point cartographic compass rose (North = Up)."""
    # Outer degree ring
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=DARK, width=4, fill=WHITE)
    inner_r = int(radius * 0.84)
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], outline=EMERALD, width=2)

    # Tick marks every 30 degrees
    for deg in range(0, 360, 30):
        rad = math.radians(deg - 90)
        r1 = inner_r
        r2 = radius - 3
        x1, y1 = cx + math.cos(rad) * r1, cy + math.sin(rad) * r1
        x2, y2 = cx + math.cos(rad) * r2, cy + math.sin(rad) * r2
        draw.line([(x1, y1), (x2, y2)], fill=DARK, width=3 if deg % 90 == 0 else 2)

    # Minor diagonal star points (NE, SE, SW, NW)
    diag_r = int(radius * 0.56)
    hub_r = int(radius * 0.16)
    for deg in (45, 135, 225, 315):
        rad = math.radians(deg - 90)
        rad_l = math.radians(deg - 90 - 22)
        rad_r = math.radians(deg - 90 + 22)
        tip = (cx + math.cos(rad) * diag_r, cy + math.sin(rad) * diag_r)
        left = (cx + math.cos(rad_l) * hub_r, cy + math.sin(rad_l) * hub_r)
        right = (cx + math.cos(rad_r) * hub_r, cy + math.sin(rad_r) * hub_r)
        draw.polygon([(cx, cy), left, tip], fill=SLATE, outline=DARK)
        draw.polygon([(cx, cy), tip, right], fill=WHITE, outline=DARK)

    # Major cardinal star points (N, E, S, W)
    card_r = int(radius * 0.80)
    hub_c = int(radius * 0.20)
    for deg in (0, 90, 180, 270):
        rad = math.radians(deg - 90)
        rad_l = math.radians(deg - 90 - 25)
        rad_r = math.radians(deg - 90 + 25)
        tip = (cx + math.cos(rad) * card_r, cy + math.sin(rad) * card_r)
        left = (cx + math.cos(rad_l) * hub_c, cy + math.sin(rad_l) * hub_c)
        right = (cx + math.cos(rad_r) * hub_c, cy + math.sin(rad_r) * hub_c)
        dark_fill = EMERALD if deg == 0 else DARK
        draw.polygon([(cx, cy), left, tip], fill=dark_fill, outline=DARK)
        draw.polygon([(cx, cy), tip, right], fill=AMBER_LT if deg == 0 else WHITE, outline=DARK)

    # Center pin
    draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=DARK, outline=WHITE, width=2)

    # Cardinal labels
    f_card = load_font(FONT_BOLD, 28)
    f_sub = load_font(FONT_BOLD, 22)
    draw.text((cx, cy - radius - 22), "U", fill=EMERALD, font=f_card, anchor="mm")
    draw.text((cx, cy + radius + 22), "S", fill=DARK, font=f_sub, anchor="mm")
    draw.text((cx + radius + 22, cy), "T", fill=DARK, font=f_sub, anchor="mm")
    draw.text((cx - radius - 22, cy), "B", fill=DARK, font=f_sub, anchor="mm")


def main() -> None:
    src_im = Image.open(SRC_MAP).convert("RGBA")
    w, h = src_im.size

    # Flatten onto pure white RGB
    base = Image.new("RGB", (w, h), WHITE)
    base.paste(src_im, (0, 0), src_im)

    arr_orig = np.array(base)
    ink = (arr_orig[:, :, 0] < 235) | (arr_orig[:, :, 1] < 235) | (arr_orig[:, :, 2] < 235)
    orig_markers = detect_red_markers(arr_orig)
    assert len(orig_markers) == 16, f"Expected 16 red markers, got {len(orig_markers)}"

    # Verify remaining enhancement regions are 100% free of original map ink
    assert_region_empty(ink, "Top-Right Header & Compass", 1250, 60, 2410, 540)
    assert_region_empty(ink, "Top-Left Zona & Scale", 70, 80, 650, 680)
    assert_region_empty(ink, "Bottom-Left WebAR Anchor", 85, 3020, 920, 3380)

    draw = ImageDraw.Draw(base)

    # 1. Corner Registration Marks & Perimeter Grid Ticks (avoiding top exit road at x=950..1150)
    draw_corner_fiducial(draw, 44, 44, 1, 1)
    draw_corner_fiducial(draw, w - 44, 44, -1, 1)
    draw_corner_fiducial(draw, 44, h - 44, 1, -1)
    draw_corner_fiducial(draw, w - 44, h - 44, -1, -1)

    f_grid = load_font(FONT_BOLD, 22)
    cols = [("A", 280), ("B", 680), ("C", 1240), ("D", 1680), ("E", 2060), ("F", 2320)]
    for label, gx in cols:
        draw.line([(gx, 14), (gx, 36)], fill=DARK, width=3)
        draw.text((gx + 14, 24), label, fill=SLATE, font=f_grid, anchor="lm")
        draw.line([(gx, h - 36), (gx, h - 14)], fill=DARK, width=3)
        draw.text((gx + 14, h - 24), label, fill=SLATE, font=f_grid, anchor="lm")

    rows = [("1", 300), ("2", 740), ("3", 1180), ("4", 1620), ("5", 2060), ("6", 2500), ("7", 2940), ("8", 3280)]
    for label, gy in rows:
        draw.line([(14, gy), (36, gy)], fill=DARK, width=3)
        draw.text((24, gy - 18), label, fill=SLATE, font=f_grid, anchor="mm")
        draw.line([(w - 36, gy), (w - 14, gy)], fill=DARK, width=3)
        draw.text((w - 24, gy - 18), label, fill=SLATE, font=f_grid, anchor="mm")

    # 2. Top-Right Cartographic Header & Compass Rose (x=1270..2395, y=75..510)
    hx1, hy1, hx2, hy2 = 1270, 75, 2395, 510
    draw.rectangle([hx1, hy1, hx2, hy2], fill=WHITE, outline=DARK, width=5)
    draw.rectangle([hx1 + 10, hy1 + 10, hx2 - 10, hy2 - 10], outline=EMERALD, width=2)
    # Emerald accent bar on top edge
    draw.rectangle([hx1 + 10, hy1 + 10, hx2 - 10, hy1 + 30], fill=EMERALD)

    # Paste UNSIL Logo cleanly onto header card
    logo = Image.open(LOGO_PATH).convert("RGBA").resize((132, 132), Image.Resampling.LANCZOS)
    base.paste(logo, (hx1 + 34, hy1 + 58), logo)

    f_uni = load_font(FONT_BOLD, 30)
    f_title = load_font(FONT_BOLD, 44)
    f_sub = load_font(FONT_REG, 26)
    f_tag = load_font(FONT_BOLD, 22)

    tx = hx1 + 190
    draw.text((tx, hy1 + 66), "UNIVERSITAS SILIWANGI", fill=EMERALD, font=f_uni)
    draw.text((tx, hy1 + 108), "DENAH KAMPUS 2", fill=DARK, font=f_title)
    draw.text((tx, hy1 + 160), "MUGARSARI", fill=DARK, font=f_title)
    draw.line([(tx, hy1 + 218), (tx + 560, hy1 + 218)], fill=BORDER_LT, width=3)
    draw.text((tx, hy1 + 234), "Kel. Mugarsari, Kec. Tamansari, Kota Tasikmalaya", fill=SLATE, font=f_sub)

    # Status pill inside header
    draw.rectangle([hx1 + 34, hy1 + 318, hx1 + 520, hy1 + 382], fill=EMERALD_SOFT, outline=EMERALD, width=3)
    draw.rectangle([hx1 + 52, hy1 + 338, hx1 + 76, hy1 + 362], fill=AMBER_LT, outline=DARK, width=2)
    draw.text((hx1 + 94, hy1 + 350), "PETA WEBAR INTERAKTIF · 16 TITIK", fill=DARK, font=f_tag, anchor="lm")

    # Compass rose inside right side of header
    draw_compass_rose(draw, hx2 - 175, hy1 + 235, 118)

    # 3. Top-Left Zone Key & Metric Scale Bar (x=85..635, y=95..655)
    zx1, zy1, zx2, zy2 = 85, 95, 635, 655
    draw.rectangle([zx1, zy1, zx2, zy2], fill=WHITE, outline=DARK, width=4)
    draw.rectangle([zx1 + 8, zy1 + 8, zx2 - 8, zy1 + 62], fill=DARK)
    draw.text((zx1 + 28, zy1 + 35), "ZONA & SKALA KAWASAN", fill=WHITE, font=load_font(FONT_BOLD, 25), anchor="lm")

    zones = [
        (TECH_BLUE, "Fakultas Teknik (Biru)", "FT 1-3, Labtek 1-3, SBAP (6-12)"),
        (AGRI_GREEN, "Fakultas Pertanian (Hijau)", "Gedung, Lab, R. Kuliah (13,14,16)"),
        (FACILITY_SLATE, "Rektorat & Fasilitas", "Rektorat (2), Rusunawa (5), PH (15)"),
        (AMBER, "Akses Gerbang & Ibadah", "Gerbang (1,3) · Masjid (4)"),
    ]
    f_ztitle = load_font(FONT_BOLD, 24)
    f_zsub = load_font(FONT_REG, 20)
    zy_cur = zy1 + 92
    for color, zname, zdesc in zones:
        draw.rectangle([zx1 + 26, zy_cur, zx1 + 58, zy_cur + 32], fill=color, outline=DARK, width=2)
        draw.text((zx1 + 74, zy_cur - 4), zname, fill=DARK, font=f_ztitle)
        draw.text((zx1 + 74, zy_cur + 24), zdesc, fill=SLATE, font=f_zsub)
        zy_cur += 82

    # Metric scale bar at bottom of Top-Left card
    sb_y = zy2 - 115
    draw.line([(zx1 + 24, sb_y), (zx2 - 24, sb_y)], fill=BORDER_LT, width=2)
    draw.text((zx1 + 26, sb_y + 14), "SKALA VISUAL KAWASAN (ESTIMASI)", fill=SLATE, font=load_font(FONT_BOLD, 19))
    bar_x = zx1 + 26
    bar_y = sb_y + 46
    seg_w = 112
    for idx in range(4):
        fill_c = DARK if idx % 2 == 0 else AMBER_LT if idx == 3 else WHITE
        draw.rectangle([bar_x + idx * seg_w, bar_y, bar_x + (idx + 1) * seg_w, bar_y + 22], fill=fill_c, outline=DARK, width=2)
    f_tick = load_font(FONT_BOLD, 19)
    for idx, lbl in enumerate(["0", "50m", "100m", "150m", "200m"]):
        draw.text((bar_x + idx * seg_w, bar_y + 40), lbl, fill=DARK, font=f_tick, anchor="mm")

    # 4. Bottom-Left WebAR Anchor Block (x=95..905, y=3030..3365)
    bx1, by1, bx2, by2 = 95, 3030, 905, 3365
    draw.rectangle([bx1, by1, bx2, by2], fill=WHITE, outline=DARK, width=5)
    draw.rectangle([bx1 + 10, by1 + 10, bx2 - 10, by2 - 10], outline=EMERALD, width=2)

    # Asymmetric geometric fiducial emblem on the left side of the footer card
    fx, fy = bx1 + 44, by1 + 48
    cell = 44
    pattern = [
        [1, 1, 1, 0, 1],
        [1, 0, 1, 1, 0],
        [1, 1, 2, 0, 1],
        [0, 1, 0, 1, 1],
        [1, 0, 1, 2, 1],
    ]
    for r_i, row in enumerate(pattern):
        for c_i, val in enumerate(row):
            if val == 0:
                continue
            c_fill = DARK if val == 1 else AMBER_LT
            x0, y0 = fx + c_i * cell, fy + r_i * cell
            draw.rectangle([x0, y0, x0 + cell - 4, y0 + cell - 4], fill=c_fill)

    btx = fx + 5 * cell + 36
    draw.text((btx, by1 + 56), "TARGET PELACAKAN WEBAR", fill=EMERALD, font=load_font(FONT_BOLD, 30))
    draw.text((btx, by1 + 104), "16 Gedung & Fasilitas Aktif", fill=DARK, font=load_font(FONT_BOLD, 34))
    draw.line([(btx, by1 + 158), (bx2 - 36, by1 + 158)], fill=BORDER_LT, width=3)
    draw.text((btx, by1 + 178), "Koordinat: 7°21'S 108°13'E", fill=SLATE, font=load_font(FONT_REG, 24))
    draw.text((btx, by1 + 216), "Informatika · Fakultas Teknik UNSIL", fill=SLATE, font=load_font(FONT_REG, 24))
    draw.rectangle([btx, by1 + 260, btx + 280, by1 + 298], fill=DARK)
    draw.text((btx + 140, by1 + 279), "SCAN ARAH PORTRAIT A4", fill=WHITE, font=load_font(FONT_BOLD, 20), anchor="mm")

    # Save full-res print image & 1024x1448 WebAR target
    base.save(OUT_PRINT, format="PNG", optimize=True)
    target_im = base.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    target_im.save(OUT_TARGET, format="PNG", optimize=True)

    # Self-checks: verify 16 markers did not shift, and print feature density stats
    arr_new = np.array(base)
    new_markers = detect_red_markers(arr_new)
    assert len(new_markers) == 16, f"Expected 16 red markers after edit, got {len(new_markers)}"
    max_drift = max(
        max(abs(a[0] - b[0]), abs(a[1] - b[1]))
        for a, b in zip(orig_markers, new_markers)
    )
    assert max_drift < 0.05, f"Marker coordinates drifted by {max_drift:.4f}%!"

    white_before = ((arr_orig[:, :, 0] > 245) & (arr_orig[:, :, 1] > 245) & (arr_orig[:, :, 2] > 245)).mean() * 100
    white_after = ((arr_new[:, :, 0] > 245) & (arr_new[:, :, 1] > 245) & (arr_new[:, :, 2] > 245)).mean() * 100
    print(f"Saved print map:  {OUT_PRINT} ({base.size[0]}x{base.size[1]}, {OUT_PRINT.stat().st_size/1024:.1f} KB)")
    print(f"Saved target map: {OUT_TARGET} ({target_im.size[0]}x{target_im.size[1]}, {OUT_TARGET.stat().st_size/1024:.1f} KB)")
    print(f"Marker verification: 16/16 intact, max coordinate drift = {max_drift:.4f}%")
    print(f"Pure-white area reduced: {white_before:.1f}% -> {white_after:.1f}%")


if __name__ == "__main__":
    main()
