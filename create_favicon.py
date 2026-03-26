from PIL import Image, ImageDraw, ImageFont
import os

# Create a 512x512 favicon (will be scaled down by browser)
size = 512
bg_color = (10, 10, 10)
text_color = (255, 255, 255)

img = Image.new("RGB", (size, size), bg_color)
draw = ImageDraw.Draw(img)

# Try to use a nice font
try:
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    font = None

    for path in font_paths:
        if os.path.exists(path):
            font = ImageFont.truetype(path, 320)
            break

    if not font:
        font = ImageFont.load_default()
except:
    font = ImageFont.load_default()

# Draw "K" in the center
letter = "K"
bbox = draw.textbbox((0, 0), letter, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
x = (size - text_width) // 2 - bbox[0]
y = (size - text_height) // 2 - bbox[1]

draw.text((x, y), letter, fill=text_color, font=font)

# Save as PNG (browsers will convert)
output_path = "/home/karar/Desktop/personal/karar-portfolio/my-repo/public/favicon.png"
img.save(output_path)

# Also create .ico format
img.save(output_path.replace(".png", ".ico"), format="ICO", sizes=[(32, 32), (64, 64)])

print(f"Favicon created at: {output_path}")
