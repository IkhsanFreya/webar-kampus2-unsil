from PIL import Image

im = Image.open('public/targets/denah-kampus2.jpg')
w, h = im.size
print(f"Image size: {w}x{h}")

# Search for the red labeled boxes on the image
# Let's search bounding boxes of red pixels
pixels = im.load()

targets = [
    ("1. Gerbang Selatan", 240, 740, 340, 810),
    ("2. Masjid Letjen. Mashudi", 180, 700, 260, 760),
    ("3. FP Lab Biometrik", 150, 480, 260, 540),
    ("4. FT Labtek 2", 340, 360, 440, 420),
    ("5. FT Labtek 3", 390, 410, 510, 470),
    ("6. Gerbang Utara", 410, 50, 510, 110),
]

for name, x1, y1, x2, y2 in targets:
    red_pts = []
    for y in range(y1, y2):
        for x in range(x1, x2):
            r, g, b = pixels[x, y][:3]
            if r > 180 and g < 60 and b < 60:
                red_pts.append((x, y))
    if red_pts:
        avg_x = sum(p[0] for p in red_pts) / len(red_pts)
        avg_y = sum(p[1] for p in red_pts) / len(red_pts)
        xp = round(avg_x / w * 100, 1)
        yp = round(avg_y / h * 100, 1)
        # AR Coordinates:
        # width = 1 (range -0.5 to 0.5)
        # height = h/w (range -0.5*(h/w) to +0.5*(h/w))
        ar_x = round((avg_x / w) - 0.5, 3)
        ar_y = round((0.5 - (avg_y / h)) * (h / w), 3)
        print(f"{name}: px=({avg_x:.1f}, {avg_y:.1f}) -> 2D=({xp}%, {yp}%) -> AR=({ar_x}, {ar_y})")
    else:
        print(f"{name}: no red pixels found in region")

