"""Convert web map textures and building gallery photos to optimized WebP.

Preserves all original JPG and PNG files untouched.
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BUILDINGS_DIR = ROOT / "public" / "assets" / "buildings"

MAP_JOBS = [
    (
        ROOT / "public" / "targets" / "denah-kampus2-ar.png",
        ROOT / "public" / "targets" / "denah-kampus2-ar.webp",
        (1024, 1448),
        82,
    ),
    (
        ROOT / "public" / "assets" / "denah kampus 2.png",
        ROOT / "public" / "assets" / "denah-kampus2-clean.webp",
        (1024, 1448),
        82,
    ),
]


def to_rgb_white(im: Image.Image) -> Image.Image:
    if im.mode == "RGB":
        return im
    rgba = im.convert("RGBA")
    bg = Image.new("RGB", rgba.size, (255, 255, 255))
    bg.paste(rgba, (0, 0), rgba)
    return bg


def main() -> None:
    total_src = 0
    total_dst = 0

    for src, dst, size, quality in MAP_JOBS:
        assert src.exists(), f"Missing source: {src}"
        src_sz = src.stat().st_size
        with Image.open(src) as im:
            rgb = to_rgb_white(im)
            if rgb.size != size:
                rgb = rgb.resize(size, Image.Resampling.LANCZOS)
            rgb.save(dst, format="WEBP", quality=quality, method=6)
        dst_sz = dst.stat().st_size
        assert dst.exists() and dst_sz < src_sz, f"Unexpected size for {dst}: {dst_sz} vs {src_sz}"
        total_src += src_sz
        total_dst += dst_sz
        print(f"Map WebP: {dst.relative_to(ROOT)} | {src_sz/1024:.1f} KB -> {dst_sz/1024:.1f} KB")

    count = 0
    for jpg in sorted(BUILDINGS_DIR.rglob("*.jpg")):
        webp = jpg.with_suffix(".webp")
        src_sz = jpg.stat().st_size
        with Image.open(jpg) as im:
            rgb = to_rgb_white(im)
            rgb.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            rgb.save(webp, format="WEBP", quality=78, method=6)
        dst_sz = webp.stat().st_size
        assert webp.exists() and dst_sz < src_sz, f"Unexpected size for {webp}: {dst_sz} vs {src_sz}"
        total_src += src_sz
        total_dst += dst_sz
        count += 1

    print(
        f"\nConverted {count} building photos + {len(MAP_JOBS)} maps to WebP: "
        f"{total_src/1024:.1f} KB -> {total_dst/1024:.1f} KB "
        f"(-{(1 - total_dst / total_src) * 100:.1f}%)"
    )


if __name__ == "__main__":
    main()
