from PIL import Image, ImageDraw, ImageFont
import os

# Create a 1200x630 image (standard OG image size)
width = 1200
height = 630
bg_color = (10, 10, 10)  # Dark background
text_color = (255, 255, 255)  # White text

# Create image
img = Image.new("RGB", (width, height), bg_color)
draw = ImageDraw.Draw(img)

# Try to use a nice font, fallback to default
try:
    # Try different font locations
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    font_large = None
    font_medium = None

    for path in font_paths:
        if os.path.exists(path):
            font_large = ImageFont.truetype(path, 72)
            font_medium = ImageFont.truetype(path, 36)
            break

    if not font_large:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
except:
    font_large = ImageFont.load_default()
    font_medium = ImageFont.load_default()

# Add text
title = "Karar Haitham"
subtitle = "Building at the intersection of"
subtitle2 = "technology and human potential"

# Center the text
title_bbox = draw.textbbox((0, 0), title, font=font_large)
title_width = title_bbox[2] - title_bbox[0]
title_x = (width - title_width) // 2

subtitle_bbox = draw.textbbox((0, 0), subtitle, font=font_medium)
subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
subtitle_x = (width - subtitle_width) // 2

subtitle2_bbox = draw.textbbox((0, 0), subtitle2, font=font_medium)
subtitle2_width = subtitle2_bbox[2] - subtitle2_bbox[0]
subtitle2_x = (width - subtitle2_width) // 2

# Draw text
y_start = 200
draw.text((title_x, y_start), title, fill=text_color, font=font_large)
draw.text((subtitle_x, y_start + 120), subtitle, fill=(180, 180, 180), font=font_medium)
draw.text(
    (subtitle2_x, y_start + 170), subtitle2, fill=(180, 180, 180), font=font_medium
)

# Add a subtle line decoration
line_y = 150
line_width = 200
line_x = (width - line_width) // 2
draw.rectangle([line_x, line_y, line_x + line_width, line_y + 2], fill=(255, 255, 255))

# Save
output_path = "/home/karar/Desktop/personal/karar-portfolio/my-repo/public/og-image.png"
img.save(output_path)
print(f"OG image created at: {output_path}")
print(f"Size: {width}x{height}")
